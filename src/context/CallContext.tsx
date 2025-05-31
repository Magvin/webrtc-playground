import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
  Dispatch,
} from 'react';
import { CallState, CallAction, ActionTypes } from '@/types/call';

const initialCallState: CallState = {
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  callStatus: 'idle',
  devices: [],
  settings: {
    audioEnabled: true,
    videoEnabled: true,
    resolution: 'medium',
  },
  errors: [],
  mockScenario: {
    type: 'basic',
    active: false,
  },
  retryState: {
    currentAttempt: 0,
    maxAttempts: 3,
    countdown: 3,
    isRetrying: false,
  },
};

function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case ActionTypes.SET_LOCAL_STREAM:
      return { ...state, localStream: action.stream };

    case ActionTypes.SET_REMOTE_STREAM:
      return { ...state, remoteStream: action.stream };

    case ActionTypes.SET_PEER_CONNECTION:
      return { ...state, peerConnection: action.peerConnection };

    case ActionTypes.UPDATE_CALL_STATUS:
      return { ...state, callStatus: action.status };

    case ActionTypes.SET_DEVICES:
      return { ...state, devices: action.devices };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    case ActionTypes.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, { ...action.error, timestamp: Date.now() }],
      };

    case ActionTypes.CLEAR_ERRORS:
      return { ...state, errors: [] };

    case ActionTypes.SET_MOCK_SCENARIO:
      return { ...state, mockScenario: action.scenario };

    case ActionTypes.TOGGLE_AUDIO:
      return {
        ...state,
        settings: {
          ...state.settings,
          audioEnabled: !state.settings.audioEnabled,
        },
      };

    case ActionTypes.TOGGLE_VIDEO:
      return {
        ...state,
        settings: {
          ...state.settings,
          videoEnabled: !state.settings.videoEnabled,
        },
      };

    case ActionTypes.END_CALL:
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      return {
        ...state,
        localStream: null,
        remoteStream: null,
        peerConnection: null,
        callStatus: 'disconnected',
      };

    case ActionTypes.UPDATE_RETRY_STATE:
      return {
        ...state,
        retryState: { ...state.retryState, ...action.retryState },
      };

    case ActionTypes.RESET_RETRY_STATE:
      return {
        ...state,
        retryState: {
          currentAttempt: 0,
          maxAttempts: 3,
          countdown: 3,
          isRetrying: false,
        },
      };

    default:
      return state;
  }
}

const CallStateContext = createContext<CallState | null>(null);
const CallDispatchContext = createContext<Dispatch<CallAction> | null>(null);

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(callReducer, initialCallState);

  const memoizedState = useMemo(() => state, [state]);

  const memoizedDispatch = useMemo(() => dispatch, []);

  return (
    <CallStateContext.Provider value={memoizedState}>
      <CallDispatchContext.Provider value={memoizedDispatch}>
        {children}
      </CallDispatchContext.Provider>
    </CallStateContext.Provider>
  );
};

export const useCallState = () => {
  const state = useContext(CallStateContext);
  if (!state) {
    throw new Error('useCallState must be used within CallProvider');
  }
  return state;
};

export const useCallDispatch = () => {
  const dispatch = useContext(CallDispatchContext);
  if (!dispatch) {
    throw new Error('useCallDispatch must be used within CallProvider');
  }
  return dispatch;
};

export const useCallStatus = () => {
  const state = useContext(CallStateContext);
  if (!state) {
    throw new Error('useCallStatus must be used within CallProvider');
  }
  return useMemo(() => state.callStatus, [state.callStatus]);
};

export const useMediaStreams = () => {
  const state = useContext(CallStateContext);
  if (!state) {
    throw new Error('useMediaStreams must be used within CallProvider');
  }
  return useMemo(
    () => ({
      localStream: state.localStream,
      remoteStream: state.remoteStream,
    }),
    [state.localStream, state.remoteStream]
  );
};

export const useCallSettings = () => {
  const state = useContext(CallStateContext);
  if (!state) {
    throw new Error('useCallSettings must be used within CallProvider');
  }
  return useMemo(() => state.settings, [state.settings]);
};

export const useRetryState = () => {
  const state = useContext(CallStateContext);
  if (!state) {
    throw new Error('useRetryState must be used within CallProvider');
  }
  return useMemo(() => state.retryState, [state.retryState]);
};
