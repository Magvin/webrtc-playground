import { useCallSettings } from '@/context/CallContext';
import MuteSVG from '@/images/svg/microphone.svg';
import NotAllowSVG from '@/images/svg/notAllow.svg';
import CameraOffSVG from '@/images/svg/cameraDisabled.svg';
import CameraOnSVG from '@/images/svg/camera.svg';
import PhoneSVG from '@/images/svg/phone.svg';
import { cn } from '@/utils/cn';

type ControlPanelProps = {
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => Promise<void>;
};

export const ControlPanel = ({
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}: ControlPanelProps) => {
  const { audioEnabled, videoEnabled } = useCallSettings();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-6">
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={onToggleAudio}
          className={cn('p-4 rounded-full transition-colors', {
            'bg-gray-700 hover:bg-gray-600': audioEnabled,
            'bg-red-600 hover:bg-red-700': !audioEnabled,
          })}
          aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {audioEnabled ? <MuteSVG /> : <NotAllowSVG />}
        </button>

        <button
          onClick={onToggleVideo}
          className={cn('p-4 rounded-full transition-colors', {
            'bg-gray-700 hover:bg-gray-600': videoEnabled,
            'bg-red-600 hover:bg-red-700': !videoEnabled,
          })}
          aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {videoEnabled ? <CameraOnSVG /> : <CameraOffSVG />}
        </button>

        <button
          onClick={onEndCall}
          className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          aria-label="End call"
        >
          <PhoneSVG />
        </button>
      </div>
    </div>
  );
};
