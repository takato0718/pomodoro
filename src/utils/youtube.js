import { TRACK_TYPES } from './constants.js';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
]);

/**
 * YouTube のホスト名かどうかを判定する
 * @param {string} hostname
 * @returns {boolean}
 */
function isYouTubeHost(hostname) {
  const normalized = hostname.replace(/^www\./, '');
  return YOUTUBE_HOSTS.has(normalized);
}

/**
 * 入力文字列を URL オブジェクトに変換する
 * @param {string} input
 * @returns {URL | null}
 */
function toYouTubeUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const urlString = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(urlString);

    if (!isYouTubeHost(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/**
 * URL からプレイリスト ID を抽出する
 * @param {string} input
 * @returns {string | null}
 */
export function extractPlaylistId(input) {
  const url = toYouTubeUrl(input);
  if (!url) {
    return null;
  }

  const listId = url.searchParams.get('list');
  return listId || null;
}

/**
 * URL から動画 ID を抽出する
 * @param {string} input
 * @returns {string | null}
 */
export function extractVideoId(input) {
  const url = toYouTubeUrl(input);
  if (!url) {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean)[0];
    return videoId || null;
  }

  const videoIdFromQuery = url.searchParams.get('v');
  if (videoIdFromQuery) {
    return videoIdFromQuery;
  }

  const pathMatch = url.pathname.match(/^\/(embed|v|shorts)\/([^/?]+)/);
  if (pathMatch) {
    return pathMatch[2];
  }

  return null;
}

/**
 * YouTube URL かどうかを検証する
 * @param {string} input
 * @returns {boolean}
 */
export function isValidYouTubeUrl(input) {
  return parseYouTubeUrl(input).ok;
}

/**
 * YouTube URL を解析し、動画またはプレイリスト ID を返す
 * list= パラメータがある場合はプレイリストとして扱う
 * @param {string} input
 * @returns {{ ok: true, type: string, id: string } | { ok: false, error: string }}
 */
export function parseYouTubeUrl(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: 'URL を入力してください' };
  }

  const url = toYouTubeUrl(trimmed);
  if (!url) {
    return { ok: false, error: '有効な YouTube URL を入力してください' };
  }

  const playlistId = extractPlaylistId(trimmed);
  if (playlistId) {
    return { ok: true, type: TRACK_TYPES.PLAYLIST, id: playlistId };
  }

  const videoId = extractVideoId(trimmed);
  if (videoId) {
    return { ok: true, type: TRACK_TYPES.VIDEO, id: videoId };
  }

  return { ok: false, error: '動画 ID またはプレイリスト ID を取得できませんでした' };
}

/**
 * YouTube 動画のサムネイル URL を返す
 * @param {string} videoId
 * @returns {string}
 */
export function getVideoThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
