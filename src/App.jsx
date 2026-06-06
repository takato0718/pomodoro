import Timer from './components/Timer.jsx';

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
      <h1 className="mb-8 text-4xl font-bold text-red-500">
        Simple YouTube Pomodoro
      </h1>
      <Timer />
    </div>
  );
}

export default App;
