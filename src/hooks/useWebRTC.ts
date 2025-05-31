import { useMemo, useCallback } from 'react';
import { WebRTCService } from '@/services/WebRTCService';
import { useCallDispatch } from '@/context/CallContext';
import { MockScenario } from '@/types/call';

export const useWebRTC = () => {
  const dispatch = useCallDispatch();
  const webRTCService = useMemo(() => new WebRTCService(dispatch), [dispatch]);

  const initializeCall = useCallback(
    async (scenario?: MockScenario['type']) => {
      try {
        await webRTCService.initializeMockSession();
        await webRTCService.createCallSession(scenario);
      } catch (error) {
        console.error('Failed to initialize call:', error);
      }
    },
    [webRTCService]
  );

  const toggleAudio = useCallback(() => {
    webRTCService.toggleAudio();
  }, [webRTCService]);

  const toggleVideo = useCallback(() => {
    webRTCService.toggleVideo();
  }, [webRTCService]);

  const switchCamera = useCallback(async () => {
    await webRTCService.switchCamera();
  }, [webRTCService]);

  const endCall = useCallback(async () => {
    await webRTCService.endCall();
  }, [webRTCService]);

  const updateMediaConstraints = useCallback(
    async (constraints: MediaStreamConstraints) => {
      await webRTCService.updateMediaConstraints(constraints);
    },
    [webRTCService]
  );

  return {
    initializeCall,
    toggleAudio,
    toggleVideo,
    switchCamera,
    endCall,
    updateMediaConstraints,
  };
};
