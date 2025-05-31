import { VideoFeed } from '@/components/VideoFeed';
import { CallState } from '@/types/call';
import UserSVG from '@/images/svg/user.svg';
import CameraOutlineSVG from '@/images/svg/cameraOutline.svg';

type VideoContainerProps = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: CallState['callStatus'];
};

export const VideoContainer = ({
  localStream,
  remoteStream,
  callStatus,
}: VideoContainerProps) => {
  return (
    <div className="relative w-full h-full" data-testid="video-container">
      <VideoFeed
        stream={remoteStream}
        className="w-full h-full object-cover bg-gray-800"
        placeholder={
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <UserSVG />
              <p className="text-gray-500">
                {callStatus === 'connected'
                  ? 'Waiting for remote video...'
                  : 'Connecting...'}
              </p>
            </div>
          </div>
        }
      />

      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <VideoFeed
          stream={localStream}
          muted
          className="w-full h-full object-cover"
          placeholder={
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <CameraOutlineSVG />
            </div>
          }
        />
      </div>
    </div>
  );
};
