import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import YouTube from 'react-youtube';
import { PLAYER_MIN_SIZE } from '../utils/constants.js';

/** react-youtube の updateVideo(cueVideoById) 後にシークし直すまでの待機（ms） */
const RESUME_SETTLE_MS = 300;

/** onEnd の二重発火を無視する窓（ms） */
const VIDEO_END_DEBOUNCE_MS = 500;

/**
 * @typedef {{ videoId: string, currentTime: number, trackIndex?: number }} ResumeData
 */

/**
 * YouTube プレイヤー。タイマーの状態に応じて再生/一時停止を制御する。
 * @param {{ isRunning: boolean, videoId: string, volume: number, resume: ResumeData | null, onVolumeChange: (volume: number) => void, onVideoEnd: () => void, onVideoError: (errorCode: number) => void, onPlaybackOk: () => void, onResumeConsumed: () => void }} props
 */
const Player = forwardRef(function Player(
  {
    isRunning,
    videoId,
    volume,
    resume,
    onVolumeChange,
    onVideoEnd,
    onVideoError,
    onPlaybackOk,
    onResumeConsumed,
  },
  ref,
) {
  const playerRef = useRef(null);
  /** 現在の player インスタンスが ready になっている videoId。不一致なら操作しない */
  const readyVideoIdRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const resumeRef = useRef(resume);
  const videoIdRef = useRef(videoId);
  const shouldPlayRef = useRef(isRunning);
  const hasPendingConsumeRef = useRef(false);
  const lastVideoEndAtRef = useRef(0);
  /**
   * resume クリア後も opts.playerVars.start を維持する。
   * start を外すと react-youtube が先頭から cue し直してしまう。
   */
  const stickyStartRef = useRef(/** @type {{ videoId: string, start: number } | null} */ (null));

  resumeRef.current = resume;
  videoIdRef.current = videoId;
  shouldPlayRef.current = isRunning;

  const pendingResume =
    resume && resume.videoId === videoId && resume.currentTime > 0
      ? resume
      : null;

  if (pendingResume) {
    stickyStartRef.current = {
      videoId,
      start: Math.floor(pendingResume.currentTime),
    };
    hasPendingConsumeRef.current = true;
  } else if (stickyStartRef.current?.videoId !== videoId) {
    stickyStartRef.current = null;
  }

  const startSeconds =
    stickyStartRef.current?.videoId === videoId
      ? stickyStartRef.current.start
      : undefined;

  const opts = useMemo(
    () => ({
      height: String(PLAYER_MIN_SIZE),
      width: String(PLAYER_MIN_SIZE),
      playerVars: {
        autoplay: 0,
        controls: 1,
        ...(startSeconds != null ? { start: startSeconds } : {}),
      },
    }),
    [startSeconds],
  );

  const isPlayerReadyFor = useCallback((targetVideoId) => {
    const player = playerRef.current;
    if (!player || readyVideoIdRef.current !== targetVideoId) {
      return false;
    }

    try {
      const playingVideoId = player.getVideoData?.()?.video_id;
      // 破棄直後や切替途中は playingVideoId が古いか欠けることがある
      if (playingVideoId && playingVideoId !== targetVideoId) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }, []);

  const syncPlayback = useCallback(() => {
    const currentVideoId = videoIdRef.current;
    if (!isPlayerReadyFor(currentVideoId)) {
      return;
    }

    const player = playerRef.current;
    try {
      if (shouldPlayRef.current) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    } catch (error) {
      console.error('YouTube playback sync failed:', error);
    }
  }, [isPlayerReadyFor]);

  const getCurrentTime = useCallback(() => {
    const currentVideoId = videoIdRef.current;
    if (!isPlayerReadyFor(currentVideoId)) {
      return null;
    }

    try {
      const currentTime = playerRef.current.getCurrentTime();
      return typeof currentTime === 'number' && !Number.isNaN(currentTime)
        ? currentTime
        : null;
    } catch (error) {
      console.error('YouTube getCurrentTime failed:', error);
      return null;
    }
  }, [isPlayerReadyFor]);

  const getPlayingVideoId = useCallback(() => {
    const currentVideoId = videoIdRef.current;
    if (!isPlayerReadyFor(currentVideoId)) {
      return null;
    }

    try {
      const playingVideoId = playerRef.current.getVideoData?.()?.video_id;
      return typeof playingVideoId === 'string' && playingVideoId
        ? playingVideoId
        : null;
    } catch (error) {
      console.error('YouTube getVideoData failed:', error);
      return null;
    }
  }, [isPlayerReadyFor]);

  useImperativeHandle(
    ref,
    () => ({
      getCurrentTime,
      getPlayingVideoId,
    }),
    [getCurrentTime, getPlayingVideoId],
  );

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const finishResume = useCallback(() => {
    syncPlayback();
    if (!hasPendingConsumeRef.current) {
      return;
    }
    hasPendingConsumeRef.current = false;
    onResumeConsumed?.();
  }, [syncPlayback, onResumeConsumed]);

  /**
   * 続き再生を適用する。
   *
   * react-youtube は videoId 変更時に:
   *   1. resetPlayer() → onReady
   *   2. updateVideo() → cueVideoById
   * の順で動く。playerVars.start と遅延 seekTo で位置を維持する。
   * videoId 変更直後の破棄済み player には触れない。
   */
  const applyResume = useCallback(
    (player, source) => {
      const currentResume = resumeRef.current;
      const currentVideoId = videoIdRef.current;
      if (
        !player ||
        !currentResume ||
        currentResume.videoId !== currentVideoId ||
        currentResume.currentTime <= 0
      ) {
        return false;
      }

      // useEffect 経由は、今の videoId 向けに ready なときだけ（同一 videoId 復帰）
      if (source === 'useEffect' && !isPlayerReadyFor(currentVideoId)) {
        return false;
      }

      clearResumeTimer();

      const targetTime = currentResume.currentTime;
      try {
        player.seekTo(targetTime, true);
      } catch (error) {
        console.error('YouTube seekTo failed:', error);
        return false;
      }

      const playerInstance = player;
      resumeTimerRef.current = window.setTimeout(() => {
        resumeTimerRef.current = null;
        // タイマー発火時も、別動画へ切り替わっていれば触らない
        if (
          playerRef.current !== playerInstance ||
          readyVideoIdRef.current !== currentVideoId
        ) {
          return;
        }
        try {
          playerInstance.seekTo(targetTime, true);
        } catch (error) {
          console.error('YouTube seekTo retry failed:', error);
        }
        finishResume();
      }, RESUME_SETTLE_MS);

      return true;
    },
    [clearResumeTimer, finishResume, isPlayerReadyFor],
  );

  const handleReady = useCallback(
    (event) => {
      playerRef.current = event.target;
      readyVideoIdRef.current = videoIdRef.current;
      const didResume = applyResume(event.target, 'onReady');
      if (!didResume) {
        syncPlayback();
      }
    },
    [applyResume, syncPlayback],
  );

  const handleVideoEnd = useCallback(() => {
    const now = Date.now();
    if (now - lastVideoEndAtRef.current < VIDEO_END_DEBOUNCE_MS) {
      return;
    }
    lastVideoEndAtRef.current = now;

    stickyStartRef.current = null;
    clearResumeTimer();
    onVideoEnd?.();
  }, [clearResumeTimer, onVideoEnd]);

  const handleError = useCallback(
    (event) => {
      const errorCode = event?.data;
      console.error('YouTube Player error:', errorCode);
      stickyStartRef.current = null;
      clearResumeTimer();
      // onEnd 用デバウンスは使わず、すぐに次曲処理へ渡す
      onVideoError?.(errorCode);
    },
    [clearResumeTimer, onVideoError],
  );

  const handlePlay = useCallback(() => {
    onPlaybackOk?.();
  }, [onPlaybackOk]);

  // videoId 変更時は旧インスタンスを無効化し、onReady まで操作しない
  useEffect(() => {
    if (readyVideoIdRef.current !== videoId) {
      readyVideoIdRef.current = null;
      clearResumeTimer();
    }
  }, [videoId, clearResumeTimer]);

  // 同じ videoId のまま resume だけ届いた場合（onReady が再発火しない）
  useEffect(() => {
    if (!pendingResume) {
      return undefined;
    }
    if (!isPlayerReadyFor(videoId)) {
      return undefined;
    }
    applyResume(playerRef.current, 'useEffect');
    return undefined;
  }, [pendingResume, videoId, applyResume, isPlayerReadyFor]);

  useEffect(() => {
    if (resumeTimerRef.current != null) {
      return;
    }
    syncPlayback();
  }, [isRunning, syncPlayback]);

  useEffect(() => () => clearResumeTimer(), [clearResumeTimer]);

  useEffect(() => {
    if (!isPlayerReadyFor(videoId)) {
      return;
    }
    try {
      playerRef.current.setVolume(volume);
    } catch (error) {
      console.error('YouTube volume sync failed:', error);
    }
  }, [volume, videoId, isPlayerReadyFor]);

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
        onPlay={handlePlay}
        onEnd={handleVideoEnd}
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
});

export default Player;
