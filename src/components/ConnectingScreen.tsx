export const ConnectingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Connecting...</h2>
        <p className="text-gray-400">Setting up your video call</p>
      </div>
    </div>
  );
};
