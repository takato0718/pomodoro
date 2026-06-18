import {
  DEFAULT_VIDEO_ID,
  TRACK_TYPES,
} from './constants.js';

/**
 * 曲リストから再生する動画 ID を取得する（最初の動画トラックを使用）
 * @param {Array<{ type: string, id: string }>} tracks
 * @returns {string}
 */
export function getActiveVideoId(tracks) {
  const videoTrack = tracks.find((track) => track.type === TRACK_TYPES.VIDEO);
  return videoTrack?.id ?? DEFAULT_VIDEO_ID;
}
