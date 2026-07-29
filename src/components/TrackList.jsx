import { TRACK_TYPES } from '../utils/constants.js';
import { getVideoThumbnailUrl } from '../utils/youtube.js';

const TRACK_TYPE_ICONS = {
  [TRACK_TYPES.VIDEO]: '♪',
  [TRACK_TYPES.PLAYLIST]: '🎵',
};

/**
 * 曲リストの1項目
 * @param {{ track: { type: string, id: string, title: string }, index: number, onRemove: (index: number) => void }} props
 */
function TrackListItem({ track, onRemove }) {
  const icon = TRACK_TYPE_ICONS[track.type] ?? '♪';
  const isVideo = track.type === TRACK_TYPES.VIDEO;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2">
      {isVideo ? (
        <img
          src={getVideoThumbnailUrl(track.id)}
          alt=""
          className="h-12 w-20 shrink-0 rounded object-cover"
        />
      ) : (
        <div
          className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-gray-700 text-2xl"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-medium text-white">
          <span aria-hidden="true">{icon}</span>
          <span className="truncate">{track.title}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(track.uid)}
        aria-label={`「${track.title}」を削除`}
        className="min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-red-900/40 hover:text-red-400 active:bg-red-900/60"
      >
        削除
      </button>
    </li>
  );
}

/**
 * 登録済み曲リストの表示
 * @param {{
 *   playlistLabel: string,
 *   tracks: Array<{ type: string, id: string, title: string }>,
 *   onRemoveTrack: (uid: string) => void,
 * }} props
 */
function TrackList({ playlistLabel, tracks, onRemoveTrack }) {
  return (
    <section className="mt-6 w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-800/80 p-4 shadow-lg sm:p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">
        {playlistLabel}プレイリスト
      </h2>
      <p className="mb-4 text-sm text-gray-400">
        登録済みの動画・プレイリスト（{tracks.length}件）
      </p>

      {tracks.length === 0 ? (
        <p className="text-sm text-gray-500">まだ曲が登録されていません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tracks.map((track) => (
            <TrackListItem
              key={track.uid}
              track={track}
              onRemove={onRemoveTrack}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TrackList;
