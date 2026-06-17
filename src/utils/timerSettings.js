import { MAX_TIMER_MINUTES, MIN_TIMER_MINUTES } from './constants.js';

/**
 * タイマー設定の分数を有効範囲（1〜90分）に収める
 * @param {number} minutes
 * @returns {number}
 */
export function clampTimerMinutes(minutes) {
  if (Number.isNaN(minutes)) {
    return MIN_TIMER_MINUTES;
  }

  return Math.min(
    MAX_TIMER_MINUTES,
    Math.max(MIN_TIMER_MINUTES, Math.round(minutes)),
  );
}
