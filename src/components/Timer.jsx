import {
  MAX_TIMER_MINUTES,
  MIN_TIMER_MINUTES,
  TIMER_MODES,
} from '../utils/constants.js';
import { formatTime } from '../utils/formatTime.js';

const MODE_STYLES = {
  [TIMER_MODES.FOCUS]: {
    section: 'border border-red-800 bg-red-950/80',
    label: 'text-red-400',
    labelText: '集中時間',
    startButton: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
  },
  [TIMER_MODES.BREAK]: {
    section: 'border border-green-800 bg-green-950/80',
    label: 'text-green-400',
    labelText: '休憩時間',
    startButton: 'bg-green-600 hover:bg-green-500 active:bg-green-700',
  },
};

function Timer({
  mode,
  remainingSeconds,
  isRunning,
  notification,
  settings,
  onSettingsChange,
  start,
  pause,
  reset,
}) {
  const styles = MODE_STYLES[mode];

  return (
    <section
      className={`flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-5 shadow-lg transition-colors duration-500 sm:gap-6 sm:p-8 ${styles.section}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-300 sm:gap-4">
        <label className="flex min-h-11 items-center gap-2">
          <span>集中</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_TIMER_MINUTES}
            max={MAX_TIMER_MINUTES}
            value={settings.focusTime}
            disabled={isRunning}
            onChange={(event) =>
              onSettingsChange({ focusTime: Number(event.target.value) })
            }
            className="h-11 w-16 rounded border border-gray-600 bg-gray-800 px-2 text-center text-base text-white disabled:opacity-50 sm:h-9 sm:text-sm"
          />
          <span>分</span>
        </label>
        <label className="flex min-h-11 items-center gap-2">
          <span>休憩</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_TIMER_MINUTES}
            max={MAX_TIMER_MINUTES}
            value={settings.breakTime}
            disabled={isRunning}
            onChange={(event) =>
              onSettingsChange({ breakTime: Number(event.target.value) })
            }
            className="h-11 w-16 rounded border border-gray-600 bg-gray-800 px-2 text-center text-base text-white disabled:opacity-50 sm:h-9 sm:text-sm"
          />
          <span>分</span>
        </label>
      </div>

      <p className={`text-sm font-semibold uppercase tracking-widest ${styles.label}`}>
        {styles.labelText}
      </p>

      <p
        className="font-mono text-5xl font-bold tabular-nums tracking-wider text-white sm:text-6xl md:text-7xl"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(remainingSeconds)}
      </p>

      {notification && (
        <p
          role="alert"
          className="rounded-lg bg-amber-500/20 px-4 py-2 text-base font-medium text-amber-300 sm:text-lg"
        >
          {notification}
        </p>
      )}

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {!isRunning ? (
          <button
            type="button"
            onClick={start}
            disabled={remainingSeconds <= 0}
            className={`min-h-11 w-full rounded-lg px-6 py-2.5 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${styles.startButton}`}
          >
            スタート
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="min-h-11 w-full rounded-lg bg-yellow-600 px-6 py-2.5 font-medium text-white transition hover:bg-yellow-500 active:bg-yellow-700 sm:w-auto"
          >
            一時停止
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="min-h-11 w-full rounded-lg bg-gray-600 px-6 py-2.5 font-medium text-white transition hover:bg-gray-500 active:bg-gray-700 sm:w-auto"
        >
          リセット
        </button>
      </div>
    </section>
  );
}

export default Timer;
