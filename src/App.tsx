import { CallProvider } from './context/CallContext';
import { VideoCallInterface } from './components/VideoCallInterface';

function App() {
  return (
    <CallProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <VideoCallInterface />
      </div>
    </CallProvider>
  );
}

export default App;
