import { useCallback, useState } from 'react';
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
  PLAYLIST_EDIT_TARGETS,
  PLAYLIST_EDIT_TARGET_LABELS,
  SECONDS_PER_MINUTE,
  STORAGE_KEYS,
} from './utils/constants.js';
import { getActiveVideoId } from './utils/playlist.js';
import { clampTimerMinutes } from './utils/timerSettings.js';

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

  const focusSeconds = settings.focusTime * SECONDS_PER_MINUTE;
  const breakSeconds = settings.breakTime * SECONDS_PER_MINUTE;

  const { mode, remainingSeconds, isRunning, notification, start, pause, reset } =
    useTimer(focusSeconds, breakSeconds);

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
  const setActiveIndex = setIndexByMode[editTarget];
  const editTargetLabel = PLAYLIST_EDIT_TARGET_LABELS[editTarget];
  const videoId = getActiveVideoId(tracksByMode[mode], indexByMode[mode]);

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
      <h1 className="mb-8 text-4xl font-bold text-red-500">
        Simple YouTube Pomodoro
      </h1>
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

      <div
        className="mt-8 flex w-full max-w-xl rounded-xl border border-gray-700 bg-gray-800/80 p-1"
        role="tablist"
        aria-label="編集するプレイリスト"
      >
        {Object.values(PLAYLIST_EDIT_TARGETS).map((target) => {
          const isActive = editTarget === target;
          return (
            <button
              key={target}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setEditTarget(target)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-red-600 text-white'
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
        onAddTrack={handleAddTrack}
      />
      <TrackList
        playlistLabel={editTargetLabel}
        tracks={activeTracks}
        onRemoveTrack={handleRemoveTrack}
      />
      <Player
        isRunning={isRunning}
        mode={mode}
        videoId={videoId}
        volume={settings.volume}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}

export default App;
