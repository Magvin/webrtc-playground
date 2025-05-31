import { useState } from 'react';
import { MockScenario } from '@/types/call';

type PreCallSetupProps = {
  onStartCall: (scenario?: MockScenario['type']) => Promise<void>;
};

export const PreCallSetup = ({ onStartCall }: PreCallSetupProps) => {
  const [selectedScenario, setSelectedScenario] =
    useState<MockScenario['type']>('basic');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartCall = async () => {
    setIsStarting(true);
    try {
      await onStartCall(selectedScenario);
    } catch (error) {
      /**
       * Logger need to be added here to track the error
       */
      console.error('Failed to start call:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Start Video Call
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Test Scenario
          </label>
          <select
            value={selectedScenario}
            onChange={e =>
              setSelectedScenario(e.target.value as MockScenario['type'])
            }
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="basic">Basic Call</option>
            <option value="poor-connection">Poor Connection</option>
            <option value="connection-drop">Connection Drop</option>
          </select>
        </div>

        <button
          onClick={handleStartCall}
          disabled={isStarting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {isStarting ? 'Starting...' : 'Start Call'}
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Make sure to allow camera and microphone access</p>
        </div>
      </div>
    </div>
  );
};
