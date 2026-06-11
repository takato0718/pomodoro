import { useCallback, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import {
  DEFAULT_VIDEO_ID,
  PLAYER_MIN_SIZE,
  TIMER_MODES,
} from '../utils/constants.js';

/**
 * YouTube プレイヤー。タイマーの状態に応じて再生/一時停止を制御する。
 * @param {{ isRunning: boolean, mode: string }} props
 */
function Player({ isRunning, mode }) {
  const playerRef = useRef(null);

  const shouldPlay = isRunning && mode === TIMER_MODES.FOCUS;

  const syncPlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    if (shouldPlay) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [shouldPlay]);

  const handleReady = useCallback(
    (event) => {
      playerRef.current = event.target;
      syncPlayback();
    },
    [syncPlayback],
  );

  useEffect(() => {
    syncPlayback();
  }, [syncPlayback]);

  const handleError = (event) => {
    console.error('YouTube Player error:', event.data);
  };

  const opts = {
    height: String(PLAYER_MIN_SIZE),
    width: String(PLAYER_MIN_SIZE),
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  return (
    <div
      className="fixed bottom-4 right-4 overflow-hidden rounded-lg shadow-lg"
      style={{ minWidth: PLAYER_MIN_SIZE, minHeight: PLAYER_MIN_SIZE }}
      aria-label="YouTube プレイヤー"
    >
      <YouTube
        videoId={DEFAULT_VIDEO_ID}
        opts={opts}
        onReady={handleReady}
        onError={handleError}
      />
    </div>
  );
}

export default Player;
