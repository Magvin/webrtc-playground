import PermissionSVG from '@/images/svg/permision.svg';

export const PermissionsRequest = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="mb-8">
          <PermissionSVG />
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Camera & Microphone Access
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Please allow access to your camera and microphone to continue with the
          video call.
        </p>

        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};
