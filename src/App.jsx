import Player from './components/Player.jsx';
import Timer from './components/Timer.jsx';
import { useTimer } from './hooks/useTimer.js';

function App() {
  const { mode, remainingSeconds, isRunning, notification, start, pause, reset } =
    useTimer();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
      <h1 className="mb-8 text-4xl font-bold text-red-500">
        Simple YouTube Pomodoro
      </h1>
      <Timer
        mode={mode}
        remainingSeconds={remainingSeconds}
        isRunning={isRunning}
        notification={notification}
        start={start}
        pause={pause}
        reset={reset}
      />
      <Player isRunning={isRunning} mode={mode} />
    </div>
  );
}

export default App;
