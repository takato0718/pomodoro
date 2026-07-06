import { useCallback, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import {
  PLAYER_MIN_SIZE,
  TIMER_MODES,
} from '../utils/constants.js';

/**
 * YouTube プレイヤー。タイマーの状態に応じて再生/一時停止を制御する。
 * @param {{ isRunning: boolean, mode: string, videoId: string, volume: number, onVolumeChange: (volume: number) => void }} props
 */
function Player({ isRunning, mode, videoId, volume, onVolumeChange }) {
  const playerRef = useRef(null);

  const shouldPlay = isRunning

  const syncPlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    try {
      if (shouldPlay) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    } catch (error) {
      console.error('YouTube playback sync failed:', error);
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

  useEffect(() => {
    try {
      playerRef.current?.setVolume(volume);
    } catch (error) {
      console.error('YouTube volume sync failed:', error);
    }
  }, [volume]);

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
      className="fixed bottom-4 right-4 overflow-hidden rounded-lg bg-gray-800 shadow-lg"
      style={{ minWidth: PLAYER_MIN_SIZE }}
      aria-label="YouTube プレイヤー"
    >
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onError={handleError}
      />
      <label className="flex items-center gap-2 px-2 py-2 text-xs text-gray-300">
        <span>音量</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          className="w-24"
        />
      </label>
    </div>
  );
}

export default Player;
