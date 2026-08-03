import { useState } from 'react';
import { REORDER_ACTIONS, TRACK_TYPES } from '../utils/constants.js';
import { getVideoThumbnailUrl } from '../utils/youtube.js';

const TRACK_TYPE_ICONS = {
  [TRACK_TYPES.VIDEO]: '♪',
  [TRACK_TYPES.PLAYLIST]: '🎵',
};

const REORDER_BUTTON_CLASS =
  'min-h-11 min-w-11 shrink-0 rounded-lg px-2 py-2 text-sm text-gray-300 transition hover:bg-gray-700 hover:text-white active:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300';

/**
 * 曲リストの1項目
 * @param {{
 *   track: { uid: string, type: string, id: string, title: string },
 *   index: number,
 *   total: number,
 *   isReorderMode: boolean,
 *   onRemove: (uid: string) => void,
 *   onReorder: (uid: string, action: string) => void,
 * }} props
 */
function TrackListItem({
  track,
  index,
  total,
  isReorderMode,
  onRemove,
  onReorder,
}) {
  const icon = TRACK_TYPE_ICONS[track.type] ?? '♪';
  const isVideo = track.type === TRACK_TYPES.VIDEO;
  const isFirst = index === 0;
  const isLast = index === total - 1;

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

      {isReorderMode ? (
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <button
            type="button"
            onClick={() => onReorder(track.uid, REORDER_ACTIONS.TOP)}
            disabled={isFirst}
            aria-label={`「${track.title}」を一番上へ`}
            title="一番上へ"
            className={REORDER_BUTTON_CLASS}
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => onReorder(track.uid, REORDER_ACTIONS.UP)}
            disabled={isFirst}
            aria-label={`「${track.title}」を上へ`}
            title="上へ"
            className={REORDER_BUTTON_CLASS}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onReorder(track.uid, REORDER_ACTIONS.DOWN)}
            disabled={isLast}
            aria-label={`「${track.title}」を下へ`}
            title="下へ"
            className={REORDER_BUTTON_CLASS}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onReorder(track.uid, REORDER_ACTIONS.BOTTOM)}
            disabled={isLast}
            aria-label={`「${track.title}」を一番下へ`}
            title="一番下へ"
            className={REORDER_BUTTON_CLASS}
          >
            Bottom
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onRemove(track.uid)}
          aria-label={`「${track.title}」を削除`}
          className="min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-red-900/40 hover:text-red-400 active:bg-red-900/60"
        >
          削除
        </button>
      )}
    </li>
  );
}

/**
 * 登録済み曲リストの表示
 * @param {{
 *   playlistLabel: string,
 *   tracks: Array<{ uid: string, type: string, id: string, title: string }>,
 *   onRemoveTrack: (uid: string) => void,
 *   onReorderTrack: (uid: string, action: string) => void,
 * }} props
 */
function TrackList({ playlistLabel, tracks, onRemoveTrack, onReorderTrack }) {
  const [isReorderMode, setIsReorderMode] = useState(false);
  const canReorder = tracks.length >= 2;

  return (
    <section className="mt-6 w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-800/80 p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">
            {playlistLabel}プレイリスト
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            登録済みの動画・プレイリスト（{tracks.length}件）
          </p>
        </div>

        {canReorder && (
          <button
            type="button"
            onClick={() => setIsReorderMode((prev) => !prev)}
            aria-pressed={isReorderMode}
            className={`min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isReorderMode
                ? 'bg-gray-600 text-white hover:bg-gray-500'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {isReorderMode ? '完了' : '並び替え'}
          </button>
        )}
      </div>

      {tracks.length === 0 ? (
        <p className="text-sm text-gray-500">まだ曲が登録されていません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tracks.map((track, index) => (
            <TrackListItem
              key={track.uid}
              track={track}
              index={index}
              total={tracks.length}
              isReorderMode={isReorderMode && canReorder}
              onRemove={onRemoveTrack}
              onReorder={onReorderTrack}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TrackList;
