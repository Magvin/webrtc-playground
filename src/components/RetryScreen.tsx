import { useRetryState } from '@/context/CallContext';

export const RetryScreen = () => {
  const retryState = useRetryState();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto">
          <svg
            className="animate-spin w-full h-full text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-red-400">
            Bad Internet Connection
          </h2>
          <p className="text-gray-300">
            Connection lost. Retrying in {retryState.countdown}...
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">
            Attempt {retryState.currentAttempt} of {retryState.maxAttempts}
          </div>

          <div className="w-64 bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(retryState.currentAttempt / retryState.maxAttempts) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Please check your internet connection
        </div>
      </div>
    </div>
  );
};
