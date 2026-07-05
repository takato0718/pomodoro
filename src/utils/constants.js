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

/** プレイリスト編集 UI の対象（タイマー mode とは独立） */
export const PLAYLIST_EDIT_TARGETS = {
  FOCUS: TIMER_MODES.FOCUS,
  BREAK: TIMER_MODES.BREAK,
};

export const PLAYLIST_EDIT_TARGET_LABELS = {
  [PLAYLIST_EDIT_TARGETS.FOCUS]: '集中用',
  [PLAYLIST_EDIT_TARGETS.BREAK]: '休憩用',
};

/** YouTube IFrame Player API の最小表示サイズ（px） */
export const PLAYER_MIN_SIZE = 200;

/** 動作確認用の固定動画 ID（Lo-Fi Hip Hop） */
export const DEFAULT_VIDEO_ID = 'fvAXHczp2lU';

export const MIN_TIMER_MINUTES = 1;
export const MAX_TIMER_MINUTES = 90;
export const DEFAULT_VOLUME = 50;

export const STORAGE_KEYS = {
  SETTINGS: 'pomodoro_settings',
  FOCUS_TRACKS: 'pomodoro_focusTracks',
  BREAK_TRACKS: 'pomodoro_breakTracks',
};

export const TRACK_TYPES = {
  VIDEO: 'video',
  PLAYLIST: 'playlist',
};

export const DEFAULT_SETTINGS = {
  focusTime: DEFAULT_FOCUS_TIME_MINUTES,
  breakTime: DEFAULT_BREAK_TIME_MINUTES,
  volume: DEFAULT_VOLUME,
};

export const DEFAULT_FOCUS_TRACKS = [
  {
    uid: crypto.randomUUID(),
    type: TRACK_TYPES.VIDEO,
    id: DEFAULT_VIDEO_ID,
    title: 'Lo-Fi Hip Hop',
  },
];

export const DEFAULT_BREAK_TRACKS = [];
