import { useEffect, useState } from 'react';
import { DEFAULT_FOCUS_TIME_SECONDS } from '../utils/constants.js';

/**
 * カウントダウンタイマーの状態と操作を提供する
 * @param {number} [initialSeconds]
 */
export function useTimer(initialSeconds = DEFAULT_FOCUS_TIME_SECONDS) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setNotification('タイマーが終了しました！');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

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
    setRemainingSeconds(initialSeconds);
    setNotification('');
  };

  return {
    remainingSeconds,
    isRunning,
    notification,
    start,
    pause,
    reset,
  };
}
