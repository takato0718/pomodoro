import { MIN_PLAYBACK_ERROR_RETRIES } from './constants.js';

/**
 * YouTube IFrame Player API の onError コードと表示用メッセージ
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 */
export const YOUTUBE_ERROR_MESSAGES = {
  2: 'リクエストが無効です',
  5: 'HTML5 プレイヤーで再生できませんでした',
  100: '動画が見つかりません（削除または非公開の可能性があります）',
  101: '埋め込み再生が許可されていません',
  150: '埋め込み再生が許可されていません',
};

/**
 * @param {unknown} errorCode
 * @returns {string}
 */
export function formatYouTubeError(errorCode) {
  const code = Number(errorCode);
  const detail = YOUTUBE_ERROR_MESSAGES[code];
  if (detail) {
    return `エラー ${code}: ${detail}`;
  }
  return `エラー ${errorCode ?? '不明'}`;
}

/**
 * 連続再生失敗の上限。プレイリスト1周分、最低 MIN_PLAYBACK_ERROR_RETRIES 回。
 * @param {number} trackCount
 * @returns {number}
 */
export function getPlaybackErrorRetryLimit(trackCount) {
  const count = Math.max(0, Math.trunc(trackCount) || 0);
  return Math.max(count, MIN_PLAYBACK_ERROR_RETRIES);
}
