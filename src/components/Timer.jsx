import { useTimer } from '../hooks/useTimer.js';
import { TIMER_MODES } from '../utils/constants.js';
import { formatTime } from '../utils/formatTime.js';

const MODE_STYLES = {
  [TIMER_MODES.FOCUS]: {
    section: 'border border-red-800 bg-red-950/80',
    label: 'text-red-400',
    labelText: '集中時間',
    startButton: 'bg-red-600 hover:bg-red-500',
  },
  [TIMER_MODES.BREAK]: {
    section: 'border border-green-800 bg-green-950/80',
    label: 'text-green-400',
    labelText: '休憩時間',
    startButton: 'bg-green-600 hover:bg-green-500',
  },
};

function Timer() {
  const { mode, remainingSeconds, isRunning, notification, start, pause, reset } =
    useTimer();
  const styles = MODE_STYLES[mode];

  return (
    <section
      className={`flex flex-col items-center gap-6 rounded-2xl p-8 shadow-lg transition-colors duration-500 ${styles.section}`}
    >
      <p className={`text-sm font-semibold uppercase tracking-widest ${styles.label}`}>
        {styles.labelText}
      </p>

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
            className={`rounded-lg px-6 py-2 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${styles.startButton}`}
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
