import { PLAYER_MEDIUM_VIEWPORT_RATIO, PLAYER_MIN_SIZE, PLAYER_SIZES } from './constants.js';

/**
 * 表示サイズに応じた YouTube iframe の幅・高さを返す
 * @param {string} size
 * @param {{ width: number, height: number }} [viewport]
 * @returns {{ width: number, height: number }}
 */
export function getPlayerFrameSize(size, viewport = getViewportSize()) {
  const { width: vw, height: vh } = viewport;

  if (size === PLAYER_SIZES.MEDIUM) {
    const chromeHeight = 52;
    const width = Math.max(PLAYER_MIN_SIZE, vw - 32);
    const height = Math.max(
      PLAYER_MIN_SIZE,
      Math.floor(vh * PLAYER_MEDIUM_VIEWPORT_RATIO) - chromeHeight,
    );
    return { width, height };
  }

  if (size === PLAYER_SIZES.LARGE) {
    const chromeHeight = 56;
    const width = Math.max(PLAYER_MIN_SIZE, vw - 24);
    const height = Math.max(PLAYER_MIN_SIZE, vh - chromeHeight - 24);
    return { width, height };
  }

  return { width: PLAYER_MIN_SIZE, height: PLAYER_MIN_SIZE };
}

function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}
