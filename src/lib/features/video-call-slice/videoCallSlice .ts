import { ChatMessage } from '@/components/video-call/ChatPanel';
import { CallParticipant } from '@/services/VideoCallService';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ConnectionQuality = 'good' | 'medium' | 'poor';


interface VideoCallState {
  participants: CallParticipant[];
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isParticipantsPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
  isChatPanelOpen: boolean;
  connectionQuality: Record<string, ConnectionQuality>;
  messages: ChatMessage[];
  error: string | null;
}

const initialState: VideoCallState = {
  participants: [],
  isMuted: false,
  isVideoOn: true,
  isScreenSharing: false,
  isParticipantsPanelOpen: false,
  isSettingsPanelOpen: false,
  isChatPanelOpen: false,
  connectionQuality: {},
  messages: [],
  error: null,
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    setParticipants(state, action: PayloadAction<CallParticipant[]>) {
      state.participants = action.payload;
    },
    addParticipant(state, action: PayloadAction<CallParticipant>) {
      state.participants.push(action.payload);
    },
    removeParticipant(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter(p => p.userId !== action.payload);
    },
    updateStream(state, action: PayloadAction<{ userId: string; stream: MediaStream }>) {
      state.participants = state.participants.map(p =>
        p.userId === action.payload.userId ? { ...p, stream: action.payload.stream } : p
      );
    },
    setConnectionQuality(state, action: PayloadAction<{ userId: string; quality: ConnectionQuality }>) {
      state.connectionQuality[action.payload.userId] = action.payload.quality;
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.isMuted = action.payload;
    },
    setVideoOn(state, action: PayloadAction<boolean>) {
      state.isVideoOn = action.payload;
    },
    setScreenSharing(state, action: PayloadAction<boolean>) {
      state.isScreenSharing = action.payload;
    },
    setParticipantsPanelOpen(state, action: PayloadAction<boolean>) {
      state.isParticipantsPanelOpen = action.payload;
    },
    setSettingsPanelOpen(state, action: PayloadAction<boolean>) {
      state.isSettingsPanelOpen = action.payload;
    },
    setChatPanelOpen(state, action: PayloadAction<boolean>) {
      state.isChatPanelOpen = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetVideoCallState() {
      return initialState;
    },
  },
});

export const {
  setParticipants,
  addParticipant,
  removeParticipant,
  updateStream,
  setConnectionQuality,
  setMuted,
  setVideoOn,
  setScreenSharing,
  setParticipantsPanelOpen,
  setSettingsPanelOpen,
  setChatPanelOpen,
  addMessage,
  setError,
  resetVideoCallState,
} = videoCallSlice.actions;

export default videoCallSlice.reducer;
