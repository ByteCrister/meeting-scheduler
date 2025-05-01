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

    constructor(socket: Socket, roomId: string, userId: string) {
        this.peerConnections = new Map();
        this.localStream = null;
        this.screenStream = null;
        this.socket = socket;
        this.roomId = roomId;
        this.userId = userId;
        this.onStreamChange = null;
        this.onConnectionStateChange = null;
    }

    setStreamChangeCallback(callback: (userId: string, stream: MediaStream) => void): void {
        this.onStreamChange = callback;
    }

    setConnectionStateChangeCallback(callback: (userId: string, state: RTCPeerConnectionState) => void): void {
        this.onConnectionStateChange = callback;
    }

    async initializeLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
        try {
            const constraints: MediaStreamConstraints = {
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 },
                } : false,
                audio: audio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                } : false,
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw new Error('Failed to access camera/microphone. Please check your permissions and device connections.');
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

        peerConnection = new RTCPeerConnection(configuration);
        this.peerConnections.set(userId, peerConnection);

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                peerConnection!.addTrack(track, this.localStream!);
            });
        } else {
            console.warn('Local stream not initialized before creating peer connection.');
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
        };

        return peerConnection;
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
        this.localStream?.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
    }

    toggleVideo(enabled: boolean): void {
        this.localStream?.getVideoTracks().forEach((track) => {
            track.enabled = enabled;
        });
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