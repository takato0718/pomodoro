import { useCallback, useEffect, useRef, useState } from 'react';
import Player from './components/Player.jsx';
import PlaylistForm from './components/PlaylistForm.jsx';
import Timer from './components/Timer.jsx';
import TrackList from './components/TrackList.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useTimer } from './hooks/useTimer.js';
import {
  DEFAULT_BREAK_TRACKS,
  DEFAULT_FOCUS_TRACKS,
  DEFAULT_SETTINGS,
  PLAYER_SIZES,
  PLAYLIST_EDIT_TARGETS,
  PLAYLIST_EDIT_TARGET_LABELS,
  REORDER_ACTIONS,
  SECONDS_PER_MINUTE,
  STORAGE_KEYS,
  TIMER_MODES,
} from './utils/constants.js';
import {
  findTrackIndexByVideoId,
  getActiveVideoId,
  moveTrack,
} from './utils/playlist.js';
import { clampTimerMinutes } from './utils/timerSettings.js';
import {
  formatYouTubeError,
  getPlaybackErrorRetryLimit,
} from './utils/youtubeErrors.js';

function App() {
  const [settings, setSettings] = useLocalStorage(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS,
  );
  const [focusTracks, setFocusTracks] = useLocalStorage(
    STORAGE_KEYS.FOCUS_TRACKS,
    DEFAULT_FOCUS_TRACKS,
  );
  const [breakTracks, setBreakTracks] = useLocalStorage(
    STORAGE_KEYS.BREAK_TRACKS,
    DEFAULT_BREAK_TRACKS,
  );
  const [focusIndex, setFocusIndex] = useState(0);
  const [breakIndex, setBreakIndex] = useState(0);
  const [editTarget, setEditTarget] = useState(PLAYLIST_EDIT_TARGETS.FOCUS);
  const [playerSize, setPlayerSize] = useState(PLAYER_SIZES.SMALL);
  // #10 で保存、#11 で復帰に使用する
  const [focusResume, setFocusResume] = useState(null);
  const [breakResume, setBreakResume] = useState(null);
  const [playbackError, setPlaybackError] = useState('');
  const playerRef = useRef(null);
  const focusIndexRef = useRef(focusIndex);
  const breakIndexRef = useRef(breakIndex);
  /** モード別の連続再生失敗回数（正常再生でリセット） */
  const consecutivePlaybackErrorsRef = useRef({
    [TIMER_MODES.FOCUS]: 0,
    [TIMER_MODES.BREAK]: 0,
  });

  useEffect(() => {
    focusIndexRef.current = focusIndex;
  }, [focusIndex]);

  useEffect(() => {
    breakIndexRef.current = breakIndex;
  }, [breakIndex]);

  const focusSeconds = settings.focusTime * SECONDS_PER_MINUTE;
  const breakSeconds = settings.breakTime * SECONDS_PER_MINUTE;

  const handleBeforeModeChange = useCallback(
    (leavingMode) => {
      const tracks =
        leavingMode === TIMER_MODES.FOCUS ? focusTracks : breakTracks;
      const index =
        leavingMode === TIMER_MODES.FOCUS
          ? focusIndexRef.current
          : breakIndexRef.current;
      const setIndex =
        leavingMode === TIMER_MODES.FOCUS ? setFocusIndex : setBreakIndex;

      // 実際に再生中の動画を優先（次曲へ進んだ直後のインデックスずれを防ぐ）
      const playingVideoId = playerRef.current?.getPlayingVideoId?.();
      const currentTime = playerRef.current?.getCurrentTime?.() ?? null;
      const videoId = playingVideoId || getActiveVideoId(tracks, index);

      // Player 未準備時や取得失敗時は保存しない
      if (currentTime == null || !videoId) {
        return;
      }

      const trackIndex = findTrackIndexByVideoId(tracks, videoId);
      const resolvedIndex = trackIndex >= 0 ? trackIndex : index;
      if (trackIndex >= 0 && trackIndex !== index) {
        setIndex(trackIndex);
      }

      const resume = {
        videoId,
        currentTime,
        trackIndex: resolvedIndex,
      };
      if (leavingMode === TIMER_MODES.FOCUS) {
        setFocusResume(resume);
      } else {
        setBreakResume(resume);
      }
    },
    [focusTracks, breakTracks],
  );

  const { mode, remainingSeconds, isRunning, notification, start, pause, reset } =
    useTimer(focusSeconds, breakSeconds, {
      onBeforeModeChange: handleBeforeModeChange,
    });

  const tracksByMode = {
    [PLAYLIST_EDIT_TARGETS.FOCUS]: focusTracks,
    [PLAYLIST_EDIT_TARGETS.BREAK]: breakTracks,
  };
  const setTracksByMode = {
    [PLAYLIST_EDIT_TARGETS.FOCUS]: setFocusTracks,
    [PLAYLIST_EDIT_TARGETS.BREAK]: setBreakTracks,
  };
  const indexByMode = {
    [PLAYLIST_EDIT_TARGETS.FOCUS]: focusIndex,
    [PLAYLIST_EDIT_TARGETS.BREAK]: breakIndex,
  };
  const setIndexByMode = {
    [PLAYLIST_EDIT_TARGETS.FOCUS]: setFocusIndex,
    [PLAYLIST_EDIT_TARGETS.BREAK]: setBreakIndex,
  };

  // 編集対象（editTarget）と再生対象（mode）は独立。再生は useTimer の mode のみを使う
  const activeTracks = tracksByMode[editTarget];
  const setActiveTracks = setTracksByMode[editTarget];
  const activeIndex = indexByMode[editTarget];
  const setActiveIndex = setIndexByMode[editTarget];
  const editTargetLabel = PLAYLIST_EDIT_TARGET_LABELS[editTarget];
  const isEditingBreak = editTarget === PLAYLIST_EDIT_TARGETS.BREAK;
  const activeResume =
    mode === TIMER_MODES.FOCUS ? focusResume : breakResume;
  const videoId =
    activeResume?.videoId ??
    getActiveVideoId(tracksByMode[mode], indexByMode[mode]);

  const handleResumeConsumed = useCallback(() => {
    const resume = mode === TIMER_MODES.FOCUS ? focusResume : breakResume;
    const tracks = mode === TIMER_MODES.FOCUS ? focusTracks : breakTracks;
    const setIndex =
      mode === TIMER_MODES.FOCUS ? setFocusIndex : setBreakIndex;

    if (resume) {
      const trackIndex =
        resume.trackIndex ??
        findTrackIndexByVideoId(tracks, resume.videoId);
      if (trackIndex >= 0) {
        setIndex(trackIndex);
      }
    }

    if (mode === TIMER_MODES.FOCUS) {
      setFocusResume(null);
    } else {
      setBreakResume(null);
    }
  }, [mode, focusResume, breakResume, focusTracks, breakTracks]);

  const handleSettingsChange = useCallback(
    (partial) => {
      setSettings((prev) => ({
        ...prev,
        ...partial,
        ...(partial.focusTime !== undefined && {
          focusTime: clampTimerMinutes(partial.focusTime),
        }),
        ...(partial.breakTime !== undefined && {
          breakTime: clampTimerMinutes(partial.breakTime),
        }),
        ...(partial.volume !== undefined && {
          volume: Math.min(100, Math.max(0, partial.volume)),
        }),
      }));
    },
    [setSettings],
  );

  const handleVolumeChange = useCallback(
    (volume) => {
      handleSettingsChange({ volume });
    },
    [handleSettingsChange],
  );

  const advanceToNextTrack = useCallback(() => {
    const tracks = mode === TIMER_MODES.FOCUS ? focusTracks : breakTracks;
    const setIndex =
      mode === TIMER_MODES.FOCUS ? setFocusIndex : setBreakIndex;

    if (tracks.length === 0) {
      return false;
    }

    setIndex((prev) => (prev + 1) % tracks.length);
    return true;
  }, [mode, focusTracks, breakTracks]);

  const handleVideoEnd = useCallback(() => {
    if (!isRunning) {
      return;
    }
    consecutivePlaybackErrorsRef.current[mode] = 0;
    setPlaybackError('');
    advanceToNextTrack();
  }, [isRunning, mode, advanceToNextTrack]);

  const handleVideoError = useCallback(
    (errorCode) => {
      const detail = formatYouTubeError(errorCode);
      if (!isRunning) {
        setPlaybackError(`動画を再生できません。（${detail}）`);
        return;
      }

      const tracks = mode === TIMER_MODES.FOCUS ? focusTracks : breakTracks;
      const limit = getPlaybackErrorRetryLimit(tracks.length);

      consecutivePlaybackErrorsRef.current[mode] += 1;
      const attempt = consecutivePlaybackErrorsRef.current[mode];

      if (tracks.length === 0 || attempt >= limit) {
        setPlaybackError(
          `再生できる動画がありません。プレイリストを確認してください。（${detail}）`,
        );
        pause();
        return;
      }

      setPlaybackError(
        `再生できないため次の曲へ進みます。（${detail} / ${attempt}/${limit}）`,
      );
      advanceToNextTrack();
    },
    [isRunning, mode, focusTracks, breakTracks, advanceToNextTrack, pause],
  );

  const handlePlaybackOk = useCallback(() => {
    if (
      consecutivePlaybackErrorsRef.current[mode] === 0 &&
      playbackError === ''
    ) {
      return;
    }
    consecutivePlaybackErrorsRef.current[mode] = 0;
    setPlaybackError('');
  }, [mode, playbackError]);

  const handleAddTrack = useCallback(
    (track) => {
      const newTrack = {
        ...track,
        uid: crypto.randomUUID(),
      };
      setActiveTracks((prev) => [...prev, newTrack]);
    },
    [setActiveTracks],
  );

  const handleRemoveTrack = useCallback(
    (uid) => {
      const result = window.confirm('本当に削除しますか？');
      if (!result) return;

      const removedIndex = activeTracks.findIndex((track) => track.uid === uid);
      if (removedIndex === -1) return;

      setActiveTracks((prev) => prev.filter((track) => track.uid !== uid));
      setActiveIndex((prev) => {
        const nextLength = activeTracks.length - 1;
        if (nextLength <= 0) return 0;
        if (removedIndex < prev) return prev - 1;
        if (prev >= nextLength) return nextLength - 1;
        return prev;
      });
    },
    [activeTracks, setActiveTracks, setActiveIndex],
  );

  const handleReorderTrack = useCallback(
    (uid, action) => {
      const fromIndex = activeTracks.findIndex((track) => track.uid === uid);
      if (fromIndex === -1) return;

      const lastIndex = activeTracks.length - 1;
      const destinationByAction = {
        [REORDER_ACTIONS.UP]: fromIndex - 1,
        [REORDER_ACTIONS.DOWN]: fromIndex + 1,
        [REORDER_ACTIONS.TOP]: 0,
        [REORDER_ACTIONS.BOTTOM]: lastIndex,
      };
      const toIndex = destinationByAction[action];
      if (
        toIndex == null ||
        toIndex < 0 ||
        toIndex > lastIndex ||
        toIndex === fromIndex
      ) {
        return;
      }

      const currentUid = activeTracks[activeIndex]?.uid;
      const nextTracks = moveTrack(activeTracks, fromIndex, toIndex);
      setActiveTracks(nextTracks);

      // 再生中の曲がズレないよう uid でインデックスを引き直す
      if (currentUid) {
        const nextIndex = nextTracks.findIndex(
          (track) => track.uid === currentUid,
        );
        if (nextIndex >= 0) {
          setActiveIndex(nextIndex);
        }
      }
    },
    [activeTracks, activeIndex, setActiveTracks, setActiveIndex],
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-3 py-6 text-white sm:px-4 sm:py-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-red-500 sm:mb-8 sm:text-4xl">
        Simple YouTube Pomodoro
      </h1>

      <div className="flex w-full max-w-5xl flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-center">
        <Timer
          mode={mode}
          remainingSeconds={remainingSeconds}
          isRunning={isRunning}
          notification={notification}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          start={start}
          pause={pause}
          reset={reset}
        />
        <Player
          ref={playerRef}
          isRunning={isRunning}
          videoId={videoId}
          resume={activeResume}
          volume={settings.volume}
          size={playerSize}
          onSizeChange={setPlayerSize}
          onVolumeChange={handleVolumeChange}
          onVideoEnd={handleVideoEnd}
          onVideoError={handleVideoError}
          onPlaybackOk={handlePlaybackOk}
          onResumeConsumed={handleResumeConsumed}
        />
      </div>

      {playbackError && (
        <p
          className="mt-4 max-w-xl rounded-lg border border-amber-700/80 bg-amber-950/80 px-4 py-3 text-center text-sm text-amber-200"
          role="alert"
        >
          {playbackError}
        </p>
      )}

      <div
        className="mt-6 flex w-full max-w-xl rounded-xl border border-gray-700 bg-gray-800/80 p-1 sm:mt-8"
        role="tablist"
        aria-label="編集するプレイリスト"
      >
        {Object.values(PLAYLIST_EDIT_TARGETS).map((target) => {
          const isActive = editTarget === target;
          const activeClass =
            target === PLAYLIST_EDIT_TARGETS.BREAK
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white';
          return (
            <button
              key={target}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setEditTarget(target)}
              className={`min-h-11 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
                isActive
                  ? activeClass
                  : 'text-gray-400 hover:bg-gray-700/60 hover:text-white'
              }`}
            >
              {PLAYLIST_EDIT_TARGET_LABELS[target]}
            </button>
          );
        })}
      </div>

      <PlaylistForm
        playlistLabel={editTargetLabel}
        accent={isEditingBreak ? 'break' : 'focus'}
        onAddTrack={handleAddTrack}
      />
      <TrackList
        key={editTarget}
        playlistLabel={editTargetLabel}
        tracks={activeTracks}
        onRemoveTrack={handleRemoveTrack}
        onReorderTrack={handleReorderTrack}
      />
    </div>
  );
}

export default App;
