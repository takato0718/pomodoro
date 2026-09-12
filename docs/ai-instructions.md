# AI Instructions for TubePomo

## プロジェクト概要
YouTubeの音楽と連動したポモドーロタイマーアプリ「TubePomo」。
集中用・休憩用のプレイリストを分けて管理し、モードに応じて自動で再生を切り替える。
詳細は `docs/requirements.md` を参照。

公開URL: https://takato0718.github.io/pomodoro/

---

## 技術スタック
- React 19 (Vite)
- Tailwind CSS v4（`@tailwindcss/vite` プラグイン）
- react-youtube
- LocalStorage
- ESLint
- GitHub Pages（`gh-pages` パッケージでデプロイ、`vite.config.js` の `base: '/pomodoro/'`）
- Google Analytics（gtag.js、`index.html` に埋め込み）

---

## コーディング規約

### 全般
- **言語**: JavaScript (JSX)
- **命名規則**:
  - コンポーネント: PascalCase（例: `Timer.jsx`）
  - 関数: camelCase（例: `handleStart`）
  - 定数: UPPER_SNAKE_CASE（例: `DEFAULT_FOCUS_TIME`）
- **インデント**: スペース2つ
- **セミコロン**: 使用する

### React コンポーネント
- **関数コンポーネント** を使用（クラスコンポーネントは使わない）
- **Hooks** を積極的に活用
  - `useState`, `useEffect`, `useRef` など
- **カスタムフック** を作成して、ロジックを分離
  - 例: `useLocalStorage.js`, `useTimer.js`

### ファイル構成
src/
├── components/
│   ├── Timer.jsx
│   ├── Player.jsx
│   ├── PlayerSizeControls.jsx
│   ├── PlaylistForm.jsx
│   └── TrackList.jsx
├── hooks/
│   ├── useLocalStorage.js
│   └── useTimer.js
├── utils/
│   ├── constants.js
│   ├── formatTime.js
│   ├── playerLayout.js
│   ├── playlist.js
│   ├── timerSettings.js
│   ├── youtube.js
│   └── youtubeErrors.js
├── App.jsx
└── main.jsx

- `constants.js`: デフォルト設定値、LocalStorage キー、プレイヤーサイズ・並び替えアクションなどの定数を集約
- `playlist.js`: 曲リストの再生対象取得・インデックス検索・並び替え（`moveTrack`）などの純粋関数
- `playerLayout.js`: プレイヤー表示サイズ（小/中/大）に応じた iframe の幅・高さ計算
- `youtubeErrors.js`: YouTube IFrame Player API のエラーコードをメッセージ化し、連続エラー時のリトライ上限を算出
- `timerSettings.js`: タイマー分数のバリデーション（1〜90分にクランプ）
- `formatTime.js`: 秒数を `MM:SS` 形式に変換


### スタイリング
- **Tailwind CSS** を使用
- インラインクラスで記述
- カスタムCSSは最小限に

### 状態管理
- **LocalStorage** でデータを永続化
- グローバル状態管理（Redux等）は使わない（MVPでは不要）

---

## 実装の優先順位（実績）

### フェーズ1: 基本機能 ✅
1. タイマーのカウントダウン機能
2. YouTube動画の再生（固定ID）
3. LocalStorage への保存

### フェーズ2: 動的な曲管理 ✅
1. URL入力フォーム
2. プレイリスト/動画の判定
3. 曲リストの表示・削除

### フェーズ3: 体験向上 ✅
1. 次の曲への自動遷移
2. 音量調整
3. レスポンシブデザイン

### フェーズ4: 集中/休憩の分離と再生継続 ✅
1. 集中用・休憩用プレイリストの分離管理（`focusTracks` / `breakTracks`）
2. モード切り替え時の再生位置保存・復帰（`focusResume` / `breakResume`）
3. 連続再生エラー時の自動スキップとリトライ上限

### フェーズ5: UI/公開まわりの仕上げ ✅
1. プレイヤー表示サイズの切り替え（小/中/大、`PlayerSizeControls.jsx`）
2. 曲リストの並び替え（Top/↑/↓/Bottom ボタン）
3. GitHub Pages へのデプロイ、favicon・OGP・Google Analytics 設定

---

## 注意事項

### YouTube IFrame Player API
- `react-youtube` を使用
- プレイヤーは **常に表示**（規約違反防止）
- 最小サイズ: 200x200px（`PLAYER_MIN_SIZE`）。表示サイズは小/中/大の3段階（`playerLayout.js` が画面幅・高さから算出）

### エラーハンドリング
- 無効なURL入力時は `alert` で通知
- YouTube API のエラーは `youtubeErrors.js` でメッセージ化し、UI にも表示
- 連続再生エラー時は自動で次の曲へスキップし、上限（`getPlaybackErrorRetryLimit`）に達したら停止してユーザーに通知

### パフォーマンス
- 不要な再レンダリングを防ぐため、`useMemo`, `useCallback` を活用

---

## コード生成時のお願い

- **コメントを適度に入れる**（特にロジックが複雑な部分）
- **関数は小さく保つ**（1関数1責務）
- **マジックナンバーを避ける**（定数として定義）
- **テストしやすいコードを書く**（将来の拡張を考慮）

---

## 参考資料
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [react-youtube](https://www.npmjs.com/package/react-youtube)
- [Tailwind CSS](https://tailwindcss.com/docs)
