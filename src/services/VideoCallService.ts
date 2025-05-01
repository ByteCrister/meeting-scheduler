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

    constructor(meetingId: string, userId: string) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.participants = new Map();
        this.socket = this.initializeSocket();
        this.webRTCManager = new WebRTCManager(this.socket, this.meetingId, this.userId);
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
            await this.handleOffer(data.from, data.offer);
        });

        socket.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
            await this.handleAnswer(data.from, data.answer);
        });

        socket.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
            await this.handleIceCandidate(data.from, data.candidate);
        });

        socket.on('message', (data: { from: string; message: string }) => {
            this.onMessageReceived?.(data.from, data.message);
        });

        return socket;
    }

    public async initializeLocalStream(video = true, audio = true): Promise<void> {
        this.localStream = await this.webRTCManager.initializeLocalStream(video, audio);
        this.participants.set(this.userId, {
            userId: this.userId,
            stream: this.localStream,
            isMuted: !audio,
            isVideoOn: video,
            isScreenSharing: false,
        });
    }

    public async startCall(): Promise<void> {
        if (!this.localStream) throw new Error('Local stream not initialized');
        for (const [userId] of this.participants) {
            if (userId !== this.userId) {
                await this.createPeerConnection(userId);
            }
        }
    }

    private async createPeerConnection(userId: string): Promise<void> {
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
        if (this.localStream) {
            this.webRTCManager.toggleAudio(enabled);
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isMuted = !enabled;
                this.participants.set(this.userId, participant);
            }
        }
    }

    public async toggleVideo(enabled: boolean) {
        if (this.localStream) {
            this.webRTCManager.toggleVideo(enabled);
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isVideoOn = enabled;
                this.participants.set(this.userId, participant);
            }
        }
    }

    public async startScreenShare(): Promise<void> {
        this.screenStream = await this.webRTCManager.startScreenShare();
        const participant = this.participants.get(this.userId);
        if (participant) {
            participant.isScreenSharing = true;
            this.participants.set(this.userId, participant);
        }
    }

    public async stopScreenShare(): Promise<void> {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isScreenSharing = false;
                this.participants.set(this.userId, participant);
            }
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
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                await audioTrack.applyConstraints({ deviceId: { exact: deviceId } });
            }
        }
    }

    public async setVideoDevice(deviceId: string): Promise<void> {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                await videoTrack.applyConstraints({ deviceId: { exact: deviceId } });
            }
        }
    }

    public sendMessage(message: string): void {
        this.socket.emit('message', { to: 'all', message });
    }

    public cleanup(): void {
        this.webRTCManager.cleanup();
        this.socket.disconnect();
        this.localStream?.getTracks().forEach(track => track.stop());
        this.screenStream?.getTracks().forEach(track => track.stop());
        this.qualityIntervals.forEach(interval => clearInterval(interval));
        this.qualityIntervals.clear();
        this.participants.clear();
    }
}
