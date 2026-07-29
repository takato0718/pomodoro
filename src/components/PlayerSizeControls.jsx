import { PLAYER_SIZES, PLAYER_SIZE_LABELS } from '../utils/constants.js';

/**
 * プレイヤーサイズの3セグメント切替
 * @param {{ size: string, onChange: (size: string) => void }} props
 */
function PlayerSizeControls({ size, onChange }) {
  return (
    <div
      className="flex rounded-md border border-gray-600 bg-gray-900/80 p-0.5"
      role="group"
      aria-label="プレイヤーサイズ"
    >
      {Object.values(PLAYER_SIZES).map((value) => {
        const isActive = size === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={`min-h-11 min-w-11 rounded px-3 py-2 text-sm font-medium transition sm:min-h-9 sm:min-w-9 sm:px-2 sm:py-1 sm:text-xs ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:bg-gray-700/80 hover:text-white'
            }`}
          >
            {PLAYER_SIZE_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}

export default PlayerSizeControls;
