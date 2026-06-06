import { useTimer } from '../hooks/useTimer.js';
import { formatTime } from '../utils/formatTime.js';

function Timer() {
  const { remainingSeconds, isRunning, notification, start, pause, reset } =
    useTimer();

  return (
    <section className="flex flex-col items-center gap-6 rounded-2xl bg-gray-800 p-8 shadow-lg">
      <p
        className="font-mono text-7xl font-bold tabular-nums tracking-wider text-white"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(remainingSeconds)}
      </p>

      {notification && (
        <p
          role="alert"
          className="rounded-lg bg-amber-500/20 px-4 py-2 text-lg font-medium text-amber-300"
        >
          {notification}
        </p>
      )}

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            type="button"
            onClick={start}
            disabled={remainingSeconds <= 0}
            className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            スタート
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="rounded-lg bg-yellow-600 px-6 py-2 font-medium text-white transition hover:bg-yellow-500"
          >
            一時停止
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white transition hover:bg-gray-500"
        >
          リセット
        </button>
      </div>
    </section>
  );
}

export default Timer;
