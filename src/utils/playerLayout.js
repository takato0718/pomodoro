import {
  MOBILE_MAX_WIDTH_PX,
  PLAYER_MEDIUM_VIEWPORT_RATIO,
  PLAYER_MEDIUM_VIEWPORT_RATIO_MOBILE,
  PLAYER_MIN_SIZE,
  PLAYER_SIZES,
} from './constants.js';

/**
 * 表示サイズに応じた YouTube iframe の幅・高さを返す
 * @param {string} size
 * @param {{ width: number, height: number }} [viewport]
 * @returns {{ width: number, height: number }}
 */
export function getPlayerFrameSize(size, viewport = getViewportSize()) {
  const { width: vw, height: vh } = viewport;
  const isMobile = vw < MOBILE_MAX_WIDTH_PX;

  if (size === PLAYER_SIZES.MEDIUM) {
    const chromeHeight = isMobile ? 64 : 52;
    const ratio = isMobile
      ? PLAYER_MEDIUM_VIEWPORT_RATIO_MOBILE
      : PLAYER_MEDIUM_VIEWPORT_RATIO;
    const width = Math.max(PLAYER_MIN_SIZE, vw - (isMobile ? 16 : 32));
    const height = Math.max(
      PLAYER_MIN_SIZE,
      Math.floor(vh * ratio) - chromeHeight,
    );
    return { width, height };
  }

  if (size === PLAYER_SIZES.LARGE) {
    const chromeHeight = isMobile ? 72 : 56;
    const horizontalPad = isMobile ? 16 : 24;
    const width = Math.max(PLAYER_MIN_SIZE, vw - horizontalPad);
    const height = Math.max(
      PLAYER_MIN_SIZE,
      vh - chromeHeight - (isMobile ? 16 : 24),
    );
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
