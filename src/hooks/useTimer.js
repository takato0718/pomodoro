import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_BREAK_TIME_SECONDS,
  DEFAULT_FOCUS_TIME_SECONDS,
  TIMER_MODES,
} from '../utils/constants.js';

/**
 * 集中/休憩モード付きカウントダウンタイマーの状態と操作を提供する
 * @param {number} [focusSeconds]
 * @param {number} [breakSeconds]
 * @param {{ onBeforeModeChange?: (leavingMode: string, nextMode: string) => void }} [options]
 */
export function useTimer(
  focusSeconds = DEFAULT_FOCUS_TIME_SECONDS,
  breakSeconds = DEFAULT_BREAK_TIME_SECONDS,
  options = {},
) {
  const { onBeforeModeChange } = options;
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [remainingSeconds, setRemainingSeconds] = useState(focusSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [notification, setNotification] = useState('');
  const [durationSnapshot, setDurationSnapshot] = useState({
    focusSeconds,
    breakSeconds,
    mode: TIMER_MODES.FOCUS,
  });
  const modeRef = useRef(mode);
  const onBeforeModeChangeRef = useRef(onBeforeModeChange);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    onBeforeModeChangeRef.current = onBeforeModeChange;
  }, [onBeforeModeChange]);

  // 停止中に設定やモードが変わったら残り時間を同期
  if (
    !isRunning &&
    (durationSnapshot.focusSeconds !== focusSeconds ||
      durationSnapshot.breakSeconds !== breakSeconds ||
      durationSnapshot.mode !== mode)
  ) {
    setDurationSnapshot({ focusSeconds, breakSeconds, mode });
    setRemainingSeconds(
      mode === TIMER_MODES.FOCUS ? focusSeconds : breakSeconds,
    );
  }

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);

          if (modeRef.current === TIMER_MODES.FOCUS) {
            onBeforeModeChangeRef.current?.(
              TIMER_MODES.FOCUS,
              TIMER_MODES.BREAK,
            );
            setMode(TIMER_MODES.BREAK);
            setNotification('休憩時間です！');
            return breakSeconds;
          }

          onBeforeModeChangeRef.current?.(TIMER_MODES.BREAK, TIMER_MODES.FOCUS);
          setMode(TIMER_MODES.FOCUS);
          setNotification('集中時間です！');
          return focusSeconds;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, focusSeconds, breakSeconds]);

  const start = () => {
    if (remainingSeconds <= 0) {
      return;
    }
    setNotification('');
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    if (modeRef.current !== TIMER_MODES.FOCUS) {
      onBeforeModeChangeRef.current?.(modeRef.current, TIMER_MODES.FOCUS);
    }
    setIsRunning(false);
    setMode(TIMER_MODES.FOCUS);
    setRemainingSeconds(focusSeconds);
    setNotification('');
  };

  return {
    mode,
    remainingSeconds,
    isRunning,
    notification,
    start,
    pause,
    reset,
  };
}
