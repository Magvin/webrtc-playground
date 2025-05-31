export type CallStatus =
  | 'idle'
  | 'requesting-permissions'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'retrying';

export type ErrorType = 'connection' | 'permissions' | 'device' | 'unknown';

export type Resolution = 'low' | 'medium' | 'high';

export type MockScenarioType =
  | 'basic'
  | 'poor-connection'
  | 'screen-share'
  | 'connection-drop';

export interface CallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  callStatus: CallStatus;
  devices: MediaDeviceInfo[];
  settings: CallSettings;
  errors: ErrorState[];
  mockScenario: MockScenario;
  retryState: RetryState;
}

export interface CallSettings {
  audioEnabled: boolean;
  videoEnabled: boolean;
  selectedAudioDevice?: string;
  selectedVideoDevice?: string;
  resolution: Resolution;
}

export interface MockScenario {
  type: MockScenarioType;
  active: boolean;
}

export interface ErrorState {
  message: string;
  type: ErrorType;
  timestamp: number;
}

export interface RetryState {
  currentAttempt: number;
  maxAttempts: number;
  countdown: number;
  isRetrying: boolean;
}

export const ActionTypes = {
  SET_LOCAL_STREAM: 'SET_LOCAL_STREAM',
  SET_REMOTE_STREAM: 'SET_REMOTE_STREAM',
  SET_PEER_CONNECTION: 'SET_PEER_CONNECTION',
  UPDATE_CALL_STATUS: 'UPDATE_CALL_STATUS',
  SET_DEVICES: 'SET_DEVICES',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  ADD_ERROR: 'ADD_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_MOCK_SCENARIO: 'SET_MOCK_SCENARIO',
  TOGGLE_AUDIO: 'TOGGLE_AUDIO',
  TOGGLE_VIDEO: 'TOGGLE_VIDEO',
  END_CALL: 'END_CALL',
  UPDATE_RETRY_STATE: 'UPDATE_RETRY_STATE',
  RESET_RETRY_STATE: 'RESET_RETRY_STATE',
} as const;

export type CallAction =
  | { type: typeof ActionTypes.SET_LOCAL_STREAM; stream: MediaStream | null }
  | { type: typeof ActionTypes.SET_REMOTE_STREAM; stream: MediaStream | null }
  | {
      type: typeof ActionTypes.SET_PEER_CONNECTION;
      peerConnection: RTCPeerConnection | null;
    }
  | {
      type: typeof ActionTypes.UPDATE_CALL_STATUS;
      status: CallState['callStatus'];
    }
  | { type: typeof ActionTypes.SET_DEVICES; devices: MediaDeviceInfo[] }
  | {
      type: typeof ActionTypes.UPDATE_SETTINGS;
      settings: Partial<CallSettings>;
    }
  | { type: typeof ActionTypes.ADD_ERROR; error: Omit<ErrorState, 'timestamp'> }
  | { type: typeof ActionTypes.CLEAR_ERRORS }
  | { type: typeof ActionTypes.SET_MOCK_SCENARIO; scenario: MockScenario }
  | { type: typeof ActionTypes.TOGGLE_AUDIO }
  | { type: typeof ActionTypes.TOGGLE_VIDEO }
  | { type: typeof ActionTypes.END_CALL }
  | {
      type: typeof ActionTypes.UPDATE_RETRY_STATE;
      retryState: Partial<RetryState>;
    }
  | { type: typeof ActionTypes.RESET_RETRY_STATE };
