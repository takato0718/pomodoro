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
 */
export function useTimer(
  focusSeconds = DEFAULT_FOCUS_TIME_SECONDS,
  breakSeconds = DEFAULT_BREAK_TIME_SECONDS,
) {
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [remainingSeconds, setRemainingSeconds] = useState(focusSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [notification, setNotification] = useState('');
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);

          if (modeRef.current === TIMER_MODES.FOCUS) {
            setMode(TIMER_MODES.BREAK);
            setNotification('休憩時間です！');
            return breakSeconds;
          }

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
