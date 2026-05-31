# AI Instructions for Simple YouTube Pomodoro

## プロジェクト概要
YouTubeの音楽と連動したポモドーロタイマーアプリ。
詳細は `docs/requirements.md` を参照。

---

## 技術スタック
- React (Vite)
- Tailwind CSS
- react-youtube
- LocalStorage

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
│   └── PlaylistForm.jsx
├── hooks/
│   ├── useLocalStorage.js
│   └── useTimer.js
├── utils/
│   └── youtube.js
├── App.jsx
└── main.jsx


### スタイリング
- **Tailwind CSS** を使用
- インラインクラスで記述
- カスタムCSSは最小限に

### 状態管理
- **LocalStorage** でデータを永続化
- グローバル状態管理（Redux等）は使わない（MVPでは不要）

---

## 実装の優先順位

### フェーズ1: 基本機能
1. タイマーのカウントダウン機能
2. YouTube動画の再生（固定ID）
3. LocalStorage への保存

### フェーズ2: 動的な曲管理
1. URL入力フォーム
2. プレイリスト/動画の判定
3. 曲リストの表示・削除

### フェーズ3: 体験向上
1. 次の曲への自動遷移
2. 音量調整
3. レスポンシブデザイン

---

## 注意事項

### YouTube IFrame Player API
- `react-youtube` を使用
- プレイヤーは **常に表示**（規約違反防止）
- 最小サイズ: 200x200px

### エラーハンドリング
- 無効なURL入力時は `alert` で通知
- YouTube API のエラーは `console.error` でログ出力

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
