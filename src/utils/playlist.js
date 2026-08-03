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

/**
 * 動画 ID に一致する曲のインデックスを返す。見つからなければ -1。
 * @param {Array<{ type: string, id: string }>} tracks
 * @param {string} videoId
 * @returns {number}
 */
export function findTrackIndexByVideoId(tracks, videoId) {
  if (!Array.isArray(tracks) || !videoId) {
    return -1;
  }

  return tracks.findIndex(
    (track) => track?.type === TRACK_TYPES.VIDEO && track.id === videoId,
  );
}

/**
 * 曲を別の位置へ移動した新しい配列を返す。無効な場合は元の配列を返す。
 * @param {Array} tracks
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Array}
 */
export function moveTrack(tracks, fromIndex, toIndex) {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return tracks;
  }

  const from = Math.trunc(fromIndex);
  const to = Math.trunc(toIndex);
  if (
    from < 0 ||
    to < 0 ||
    from >= tracks.length ||
    to >= tracks.length ||
    from === to
  ) {
    return tracks;
  }

  const next = [...tracks];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
