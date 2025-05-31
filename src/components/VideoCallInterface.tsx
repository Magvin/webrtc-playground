import { useCallStatus, useMediaStreams } from '@/context/CallContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import { PreCallSetup } from '@/components/PreCallSetup';
import { PermissionsRequest } from '@/components/PermissionsRequest';
import { ConnectingScreen } from '@/components/ConnectingScreen';
import { RetryScreen } from '@/components/RetryScreen';
import { VideoContainer } from '@/components/VideoContainer';
import { ControlPanel } from '@/components/ControlPanel';

export const VideoCallInterface = () => {
  const callStatus = useCallStatus();
  const { localStream, remoteStream } = useMediaStreams();
  const { initializeCall, toggleAudio, toggleVideo, endCall } = useWebRTC();

  if (callStatus === 'idle' || callStatus === 'disconnected') {
    return <PreCallSetup onStartCall={initializeCall} />;
  }

  if (callStatus === 'requesting-permissions') {
    return <PermissionsRequest />;
  }

  if (callStatus === 'connecting') {
    return <ConnectingScreen />;
  }

  if (callStatus === 'retrying') {
    return <RetryScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 relative">
        <VideoContainer
          localStream={localStream}
          remoteStream={remoteStream}
          callStatus={callStatus}
        />
      </div>

      <ControlPanel
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
      />
    </div>
  );
};
