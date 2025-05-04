// src>services>VideoCallServices.ts

import { Socket } from 'socket.io-client';
import { WebRTCManager } from '../utils/webrtc/WebRTCManager';
import { getSocket } from '@/utils/socket/initiateSocket';

export interface CallParticipant {
    userId: string;
    stream: MediaStream | null;
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
}

export class VideoCallService {
    private meetingId: string;
    private userId: string;
    private socket: Socket;
    private webRTCManager: WebRTCManager;
    private participants: Map<string, CallParticipant>;
    private localStream: MediaStream | null = null;
    private screenStream: MediaStream | null = null;
    private qualityIntervals: Map<string, NodeJS.Timeout> = new Map();

    public onParticipantJoined: ((participant: CallParticipant) => void) | null = null;
    public onParticipantLeft: ((participantId: string) => void) | null = null;
    public onStreamReceived: ((participantId: string, stream: MediaStream) => void) | null = null;
    public onConnectionQualityChanged: ((participantId: string, quality: 'good' | 'medium' | 'poor') => void) | null = null;
    public onMessageReceived: ((participantId: string, message: string) => void) | null = null;
    public onError: ((error: Error) => void) | null = null;

    constructor(meetingId: string, userId: string) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.participants = new Map();
        this.socket = this.initializeSocket();
        this.webRTCManager = new WebRTCManager(this.socket, this.meetingId, this.userId);
        this.setupErrorHandling();
    }

    private setupErrorHandling(): void {
        this.webRTCManager.setErrorCallback((error) => {
            console.error('WebRTC error:', error);
            this.onError?.(error);
        });
    }

    private initializeSocket(): Socket {
        const socket = getSocket();
        
        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('join-meeting', { meetingId: this.meetingId, userId: this.userId });
        });

        socket.on('participant-joined', (data: { userId: string }) => {
            this.handleParticipantJoined(data.userId);
        });

        socket.on('participant-left', (data: { userId: string }) => {
            this.handleParticipantLeft(data.userId);
        });

        socket.on('offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
            try {
                await this.handleOffer(data.from, data.offer);
            } catch (error) {
                console.error('Error handling offer:', error);
                this.onError?.(new Error('Failed to handle offer'));
            }
        });

        socket.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
            try {
                await this.handleAnswer(data.from, data.answer);
            } catch (error) {
                console.error('Error handling answer:', error);
                this.onError?.(new Error('Failed to handle answer'));
            }
        });

        socket.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
            try {
                await this.handleIceCandidate(data.from, data.candidate);
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
                this.onError?.(new Error('Failed to handle ICE candidate'));
            }
        });

        socket.on('message', (data: { from: string; message: string }) => {
            this.onMessageReceived?.(data.from, data.message);
        });

        socket.on('error', (error: Error) => {
            console.error('Socket error:', error);
            this.onError?.(error);
        });

        return socket;
    }

    public async initializeLocalStream(video = true, audio = true): Promise<void> {
        try {
            this.localStream = await this.webRTCManager.initializeLocalStream(video, audio);
            this.participants.set(this.userId, {
                userId: this.userId,
                stream: this.localStream,
                isMuted: !audio,
                isVideoOn: video,
                isScreenSharing: false,
            });
        } catch (error) {
            console.error('Error initializing local stream:', error);
            this.onError?.(new Error('Failed to initialize local stream'));
            throw error;
        }
    }

    public async startCall(): Promise<void> {
        if (!this.localStream) {
            throw new Error('Local stream not initialized');
        }

        try {
            for (const [userId] of this.participants) {
                if (userId !== this.userId) {
                    await this.createPeerConnection(userId);
                }
            }
        } catch (error) {
            console.error('Error starting call:', error);
            this.onError?.(new Error('Failed to start call'));
            throw error;
        }
    }

    private async createPeerConnection(userId: string): Promise<void> {
        try {
            const peerConnection = this.webRTCManager.createPeerConnection(userId);

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('ice-candidate', { to: userId, candidate: event.candidate });
                }
            };

            peerConnection.ontrack = (event) => {
                const participant = this.participants.get(userId);
                if (participant) {
                    participant.stream = event.streams[0];
                    this.participants.set(userId, participant);
                    this.onStreamReceived?.(userId, event.streams[0]);
                }
            };

            const intervalId = setInterval(() => {
                peerConnection.getStats().then(report => {
                    let quality: 'good' | 'medium' | 'poor' = 'good';
                    report.forEach(stat => {
                        if (stat.type === 'candidate-pair' && stat.currentRoundTripTime) {
                            const rtt = stat.currentRoundTripTime;
                            if (rtt > 0.4) quality = 'poor';
                            else if (rtt > 0.2) quality = 'medium';
                        }
                    });
                    this.onConnectionQualityChanged?.(userId, quality);
                });
            }, 5000);

            this.qualityIntervals.set(userId, intervalId);
        } catch (error) {
            console.error('Error creating peer connection:', error);
            this.onError?.(new Error('Failed to create peer connection'));
            throw error;
        }
    }

    private async handleParticipantJoined(userId: string): Promise<void> {
        this.participants.set(userId, {
            userId,
            stream: null,
            isMuted: false,
            isVideoOn: true,
            isScreenSharing: false,
        });
        await this.createPeerConnection(userId);
        this.onParticipantJoined?.(this.participants.get(userId)!);
    }

    private async handleParticipantLeft(userId: string): Promise<void> {
        this.participants.delete(userId);
        const interval = this.qualityIntervals.get(userId);
        if (interval) {
            clearInterval(interval);
            this.qualityIntervals.delete(userId);
        }
        this.onParticipantLeft?.(userId);
    }

    private async handleOffer(from: string, offer: RTCSessionDescriptionInit) {
        await this.webRTCManager.handleOffer(from, offer);
    }

    private async handleAnswer(from: string, answer: RTCSessionDescriptionInit) {
        await this.webRTCManager.handleAnswer(from, answer);
    }

    private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit) {
        await this.webRTCManager.handleIceCandidate(from, candidate);
    }

    public async toggleAudio(enabled: boolean) {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            await this.webRTCManager.toggleAudio(enabled);
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isMuted = !enabled;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error toggling audio:', error);
            this.onError?.(new Error('Failed to toggle audio'));
            throw error;
        }
    }

    public async toggleVideo(enabled: boolean) {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            await this.webRTCManager.toggleVideo(enabled);
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isVideoOn = enabled;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error toggling video:', error);
            this.onError?.(new Error('Failed to toggle video'));
            throw error;
        }
    }

    public async startScreenShare(): Promise<void> {
        try {
            this.screenStream = await this.webRTCManager.startScreenShare();
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isScreenSharing = true;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error starting screen share:', error);
            this.onError?.(new Error('Failed to start screen sharing'));
            throw error;
        }
    }

    public async stopScreenShare(): Promise<void> {
        try {
            if (this.screenStream) {
                await this.webRTCManager.stopScreenShare();
                this.screenStream = null;
                const participant = this.participants.get(this.userId);
                if (participant) {
                    participant.isScreenSharing = false;
                    this.participants.set(this.userId, participant);
                }
            }
        } catch (error) {
            console.error('Error stopping screen share:', error);
            this.onError?.(new Error('Failed to stop screen sharing'));
            throw error;
        }
    }

    public async setVideoQuality(userId: string): Promise<void> {
        const peerConnection = this.webRTCManager.createPeerConnection(userId);
        if (!peerConnection) throw new Error(`PeerConnection not found for user: ${userId}`);

        const intervalId = setInterval(() => {
            peerConnection.getStats().then(report => {
                let quality: 'good' | 'medium' | 'poor' = 'good';
                report.forEach(stat => {
                    if (stat.type === 'candidate-pair' && stat.currentRoundTripTime) {
                        const rtt = stat.currentRoundTripTime;
                        if (rtt > 0.4) quality = 'poor';
                        else if (rtt > 0.2) quality = 'medium';
                    }
                });
                this.onConnectionQualityChanged?.(userId, quality);
            });
        }, 5000);

        this.qualityIntervals.set(userId, intervalId);
    }

    public async setAudioDevice(deviceId: string): Promise<void> {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            await this.webRTCManager.setAudioDevice(deviceId);
        } catch (error) {
            console.error('Error setting audio device:', error);
            this.onError?.(new Error('Failed to set audio device'));
            throw error;
        }
    }

    public async setVideoDevice(deviceId: string): Promise<void> {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            await this.webRTCManager.setVideoDevice(deviceId);
        } catch (error) {
            console.error('Error setting video device:', error);
            this.onError?.(new Error('Failed to set video device'));
            throw error;
        }
    }

    public sendMessage(message: string): void {
        this.socket.emit('message', { to: 'all', message });
    }

    public cleanup(): void {
        try {
            this.webRTCManager.cleanup();
            this.qualityIntervals.forEach(interval => clearInterval(interval));
            this.qualityIntervals.clear();
            this.participants.clear();
            this.localStream = null;
            this.screenStream = null;
        } catch (error) {
            console.error('Error during cleanup:', error);
            this.onError?.(new Error('Failed to cleanup resources'));
        }
    }
}
