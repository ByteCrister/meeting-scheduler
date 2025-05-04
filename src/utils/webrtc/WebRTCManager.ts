import { Socket } from 'socket.io-client';

export class WebRTCManager {
    private peerConnections: Map<string, RTCPeerConnection>;
    private localStream: MediaStream | null;
    private screenStream: MediaStream | null;
    private socket: Socket;
    private roomId: string;
    private userId: string;
    private onStreamChange: ((userId: string, stream: MediaStream) => void) | null;
    private onConnectionStateChange: ((userId: string, state: RTCPeerConnectionState) => void) | null;
    private onError: ((error: Error) => void) | null;

    constructor(socket: Socket, roomId: string, userId: string) {
        this.peerConnections = new Map();
        this.localStream = null;
        this.screenStream = null;
        this.socket = socket;
        this.roomId = roomId;
        this.userId = userId;
        this.onStreamChange = null;
        this.onConnectionStateChange = null;
        this.onError = null;
    }

    setStreamChangeCallback(callback: (userId: string, stream: MediaStream) => void): void {
        this.onStreamChange = callback;
    }

    setConnectionStateChangeCallback(callback: (userId: string, state: RTCPeerConnectionState) => void): void {
        this.onConnectionStateChange = callback;
    }

    setErrorCallback(callback: (error: Error) => void): void {
        this.onError = callback;
    }

    private async checkMediaPermissions(): Promise<{ audio: boolean; video: boolean }> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasAudio = devices.some(device => device.kind === 'audioinput');
            const hasVideo = devices.some(device => device.kind === 'videoinput');
            return { audio: hasAudio, video: hasVideo };
        } catch (error) {
            console.error('Error checking media devices:', error);
            throw new Error('Failed to check media device permissions');
        }
    }

    async initializeLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
        try {
            // Check permissions first
            const { audio: hasAudio, video: hasVideo } = await this.checkMediaPermissions();
            
            if (audio && !hasAudio) {
                throw new Error('No audio input device found');
            }
            if (video && !hasVideo) {
                throw new Error('No video input device found');
            }

            const constraints: MediaStreamConstraints = {
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 },
                    facingMode: 'user',
                } : false,
                audio: audio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                } : false,
            };

            // Request permissions
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Clean up existing stream if any
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }

            this.localStream = stream;
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to access camera/microphone';
            this.onError?.(new Error(errorMessage));
            throw new Error(errorMessage);
        }
    }

    createPeerConnection(userId: string): RTCPeerConnection {
        let peerConnection = this.peerConnections.get(userId);
        if (peerConnection) return peerConnection;

        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                // Add TURN servers here
            ],
            iceCandidatePoolSize: 10,
        };

        try {
            peerConnection = new RTCPeerConnection(configuration);
            this.peerConnections.set(userId, peerConnection);

            if (this.localStream) {
                this.localStream.getTracks().forEach((track) => {
                    try {
                        peerConnection!.addTrack(track, this.localStream!);
                    } catch (error) {
                        console.error(`Error adding track to peer connection: ${error}`);
                        this.onError?.(new Error('Failed to add media track to connection'));
                    }
                });
            }

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('ice-candidate', {
                        roomId: this.roomId,
                        userId,
                        candidate: event.candidate,
                    });
                }
            };

            peerConnection.onconnectionstatechange = () => {
                if (this.onConnectionStateChange) {
                    this.onConnectionStateChange(userId, peerConnection!.connectionState);
                }
            };

            peerConnection.ontrack = (event) => {
                const remoteStream = event.streams[0];
                if (this.onStreamChange) {
                    this.onStreamChange(userId, remoteStream);
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log(`ICE connection state for ${userId}:`, peerConnection!.iceConnectionState);
                if (peerConnection!.iceConnectionState === 'failed') {
                    this.onError?.(new Error('ICE connection failed'));
                }
            };

            return peerConnection;
        } catch (error) {
            console.error('Error creating peer connection:', error);
            this.onError?.(new Error('Failed to create peer connection'));
            throw error;
        }
    }

    async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
        const peerConnection = this.createPeerConnection(userId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    }

    async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection && !peerConnection.remoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
        const peerConnection = this.createPeerConnection(userId);
        if (!peerConnection.remoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        }
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', {
            roomId: this.roomId,
            userId,
            answer,
        });
    }

    async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    toggleAudio(enabled: boolean): void {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        } catch (error) {
            console.error('Error toggling audio:', error);
            this.onError?.(new Error('Failed to toggle audio'));
        }
    }

    toggleVideo(enabled: boolean): void {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            this.localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
            });
        } catch (error) {
            console.error('Error toggling video:', error);
            this.onError?.(new Error('Failed to toggle video'));
        }
    }

    async startScreenShare(): Promise<MediaStream> {
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 },
                },
                audio: true,
            };

            this.screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);
            const screenTrack = this.screenStream.getVideoTracks()[0];

            if (screenTrack) {
                screenTrack.onended = () => this.stopScreenShare();

                this.peerConnections.forEach((pc) => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });
            }

            return this.screenStream;
        } catch (error) {
            console.error('Error accessing screen share:', error);
            throw new Error('Failed to start screen sharing. Please check your permissions.');
        }
    }

    async stopScreenShare(): Promise<void> {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;

            if (this.localStream) {
                const videoTrack = this.localStream.getVideoTracks()[0];
                if (videoTrack) {
                    this.peerConnections.forEach(peerConnection => {
                        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(videoTrack);
                        }
                    });
                }
            }
        }
    }

    async setAudioDevice(deviceId: string): Promise<void> {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                await audioTrack.applyConstraints({ deviceId: { exact: deviceId } });
            }
        } catch (error) {
            console.error('Error setting audio device:', error);
            this.onError?.(new Error('Failed to set audio device'));
            throw error;
        }
    }

    async setVideoDevice(deviceId: string): Promise<void> {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                await videoTrack.applyConstraints({ deviceId: { exact: deviceId } });
            }
        } catch (error) {
            console.error('Error setting video device:', error);
            this.onError?.(new Error('Failed to set video device'));
            throw error;
        }
    }

    getConnectionStats(userId: string): Promise<RTCStatsReport> | null {
        const peerConnection = this.peerConnections.get(userId);
        return peerConnection ? peerConnection.getStats() : null;
    }

    removePeerConnection(userId: string): void {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.onconnectionstatechange = null;
            pc.oniceconnectionstatechange = null;
            pc.close();
            this.peerConnections.delete(userId);
        }
    }

    cleanup(): void {
        this.localStream?.getTracks().forEach(track => track.stop());
        this.screenStream?.getTracks().forEach(track => track.stop());

        this.peerConnections.forEach((pc, userId) => {
            this.removePeerConnection(userId);
        });

        this.peerConnections.clear();
    }
}