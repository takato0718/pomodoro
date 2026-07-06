import {
  DEFAULT_VIDEO_ID,
  TRACK_TYPES,
} from './constants.js';

/**
 * 曲リストとインデックスから再生する動画 ID を取得する
 * @param {Array<{ type: string, id: string }>} tracks
 * @param {number} [index]
 * @returns {string}
 */
export function getActiveVideoId(tracks, index = 0) {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return DEFAULT_VIDEO_ID;
  }

  const safeIndex =
    ((Math.trunc(index) % tracks.length) + tracks.length) % tracks.length;
  const track = tracks[safeIndex];

  if (track?.type === TRACK_TYPES.VIDEO && track.id) {
    return track.id;
  }

  return DEFAULT_VIDEO_ID;
}
