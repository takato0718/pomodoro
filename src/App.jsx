import { useCallback } from 'react';
import Player from './components/Player.jsx';
import PlaylistForm from './components/PlaylistForm.jsx';
import Timer from './components/Timer.jsx';
import TrackList from './components/TrackList.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useTimer } from './hooks/useTimer.js';
import {
  DEFAULT_PLAYLIST,
  DEFAULT_SETTINGS,
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
  const [playlist, setPlaylist] = useLocalStorage(
    STORAGE_KEYS.PLAYLIST,
    DEFAULT_PLAYLIST,
  );

  const focusSeconds = settings.focusTime * SECONDS_PER_MINUTE;
  const breakSeconds = settings.breakTime * SECONDS_PER_MINUTE;

  const { mode, remainingSeconds, isRunning, notification, start, pause, reset } =
    useTimer(focusSeconds, breakSeconds);

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
      setPlaylist((prev) => [...prev, track]);
    },
    [setPlaylist],
  );

  const videoId = getActiveVideoId(playlist);

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
      <PlaylistForm onAddTrack={handleAddTrack} />
      <TrackList tracks={playlist} />
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
