import { useState } from 'react';
import { TRACK_TYPES } from '../utils/constants.js';
import { parseYouTubeUrl } from '../utils/youtube.js';

const URL_EXAMPLES = [
  'https://www.youtube.com/watch?v=xxxxxxxxxxx',
  'https://youtu.be/xxxxxxxxxxx',
  'https://www.youtube.com/playlist?list=PLxxxxxxxx',
];

/**
 * YouTube URL 入力フォーム
 * @param {{ onAddTrack: (track: { type: string, id: string, title: string }) => void }} props
 */
function PlaylistForm({ onAddTrack }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [lastExtractedId, setLastExtractedId] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = parseYouTubeUrl(url);

    if (!result.ok) {
      setError(result.error);
      setLastExtractedId('');
      return;
    }

    setError('');
    setLastExtractedId(result.id);

    const title =
      result.type === TRACK_TYPES.PLAYLIST
        ? 'YouTube プレイリスト'
        : 'YouTube 動画';

    onAddTrack({
      type: result.type,
      id: result.id,
      title,
    });
    setUrl('');
  };

  return (
    <section className="mt-8 w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-800/80 p-6 shadow-lg">
      <h2 className="mb-1 text-lg font-semibold text-white">曲を追加</h2>
      <p className="mb-4 text-sm text-gray-400">
        YouTube の動画 URL またはプレイリスト URL を入力してください
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2 text-sm text-gray-300">
          <span>YouTube URL</span>
          <input
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              if (error) {
                setError('');
              }
            }}
            placeholder={URL_EXAMPLES[0]}
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none"
          />
        </label>

        <p className="text-xs text-gray-500">
          例: {URL_EXAMPLES.join(' / ')}
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        {lastExtractedId && !error && (
          <p className="text-sm text-green-400">
            ID を抽出しました: {lastExtractedId}
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-500"
        >
          追加
        </button>
      </form>
    </section>
  );
}

export default PlaylistForm;
