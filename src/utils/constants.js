export const DEFAULT_FOCUS_TIME_MINUTES = 25;
export const DEFAULT_BREAK_TIME_MINUTES = 5;
export const SECONDS_PER_MINUTE = 60;
export const DEFAULT_FOCUS_TIME_SECONDS =
  DEFAULT_FOCUS_TIME_MINUTES * SECONDS_PER_MINUTE;
export const DEFAULT_BREAK_TIME_SECONDS =
  DEFAULT_BREAK_TIME_MINUTES * SECONDS_PER_MINUTE;

export const TIMER_MODES = {
  FOCUS: 'focus',
  BREAK: 'break',
};

/** YouTube IFrame Player API の最小表示サイズ（px） */
export const PLAYER_MIN_SIZE = 200;

/** 動作確認用の固定動画 ID（Lo-Fi Hip Hop） */
export const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk';
