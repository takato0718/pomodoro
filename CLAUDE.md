# CLAUDE.md

このファイルは、このリポジトリでコードを扱う Claude Code (claude.ai/code) への指示を提供します。

## プロジェクト概要

TubePomo — YouTubeの音楽と連動するポモドーロタイマー（React + Vite + Tailwind CSS v4、バックエンド・認証なし）。公開URL: https://takato0718.github.io/pomodoro/ 。要件定義・実装/issue の全履歴・コーディング規約は `docs/requirements.md`、`docs/issues.md`、`docs/ai-instructions.md` にあるので、プロダクトやスタイルに関する判断をする前にそちらを確認すること。

## コマンド

```bash
npm install     # 依存関係のインストール
npm run dev      # Vite開発サーバーの起動
npm run build    # 本番ビルド（dist/ に出力）
npm run lint     # ESLint 実行（フラット設定: eslint.config.js）
npm run preview  # 本番ビルドのローカルプレビュー
npm run deploy   # ビルド後、gh-pages で dist/ を GitHub Pages に公開
```

このリポジトリにテストスイートは存在しない（テストランナー未設定、`*.test.*` / `*.spec.*` ファイルもなし）。

## アーキテクチャ

### タイマーと再生ロジックは分離されている
`App.jsx` が唯一の状態管理の中心（オーケストレーター）。`src/hooks/useTimer.js` はカウントダウン/モードの状態機械（start/pause/reset と集中⇄休憩の時計）のみを担い、YouTube については一切関知しない。`onBeforeModeChange(leavingMode, nextMode)` コールバックを公開しており、これはモード切り替え直前（自然なタイムアウト時・手動 `reset` 時の両方）に同期的に呼ばれる。App がタイマー進行前に再生状態を保存できる唯一のフックがこれ。

### 独立した2つのプレイリストと、単一の再生対象モード
集中用・休憩用の曲は別々の LocalStorage 連動配列（`focusTracks` / `breakTracks`、キーは `pomodoro_focusTracks` / `pomodoro_breakTracks`）で、それぞれ独立した再生インデックス（`focusIndex` / `breakIndex`）を持つ。`useTimer` の `mode` がどちらのプレイリストを実際に再生するかを決め、別の `editTarget` state が `PlaylistForm`/`TrackList` の UI がどちらを編集対象にしているかを決める。この2つは意図的に分離されており、集中モード実行中に休憩用リストを編集しても再生には影響しない。

### モード切替時の再開再生は「一度きり・メモリ上のみ」
モードを離れる際、`App.jsx` の `handleBeforeModeChange` がプレイヤーの `getPlayingVideoId()` / `getCurrentTime()` を直接読み取る（保存済みインデックスより実際に再生中の動画を優先する。曲がインデックス保存前に自動で次に進むことがあるため）。取得した `{ videoId, currentTime, trackIndex }` は `focusResume` / `breakResume` に格納される（メモリ上のみで、LocalStorage には保存しない）。そのモードに再度入ったとき `Player` が保存位置へシークし、`onResumeConsumed` を呼んで即座にクリアする。再開データが二重に適用されないようにするため。

### 再生エラー処理にはモードごとのリトライ上限がある
`consecutivePlaybackErrorsRef` がモードごとの連続 `onError` 回数を追跡する。`src/utils/youtubeErrors.js` の `getPlaybackErrorRetryLimit` が `max(プレイリストの曲数, MIN_PLAYBACK_ERROR_RETRIES)` をリトライ上限とすることで、曲数の少ないプレイリストでも無限にリトライせず、上限に達したらアプリが諦めて一時停止する。正常再生（`onPlaybackOk`）または通常の `onVideoEnd` でそのモードのカウンタはリセットされる。

### プレイヤーのサイズは計算で決まる（CSSのみではない）
`src/utils/playerLayout.js` の `getPlayerFrameSize(size, viewport)` が、現在のビューポートから小/中/大それぞれの幅・高さをピクセルで算出する。モバイル（640px未満、Tailwind の `sm` ブレークポイントに合わせている）とデスクトップで異なる比率・余白（chrome offset）を使う。`PLAYER_MIN_SIZE`（200px）を下回ることはなく、プレイヤーが非表示になることもない — これは単なる UX 上の選択ではなく、YouTube IFrame Player API の利用規約要件。

### 曲は配列のインデックスではなく `uid` で識別する
曲を追加するたびに `crypto.randomUUID()` で `uid` が付与される（`App.jsx` の `handleAddTrack`）。並び替え（`src/utils/playlist.js` の `moveTrack`）、削除、再開位置の検索はすべて `uid` を基準にしており、位置（インデックス）は基準にしていない。並び替え・削除・自動再生進行によって位置がずれるため、インデックスだけで「どの曲か」を判断すると実際の再生内容とズレる。

### `src/utils/constants.js` が設定の唯一の集約場所
LocalStorage のキー、デフォルト設定/曲リスト、タイマーの分数の上限・下限、プレイヤーサイズ、並び替えアクション名はすべてここにまとまっている。他の場所にマジックナンバー/マジックストリングを追加する前にまずここを確認すること。

### デプロイ
GitHub Pages の project site として公開しているため、`vite.config.js` で `base: '/pomodoro/'` を設定している。`index.html` には Google Analytics（gtag.js）と Open Graph/Twitter Card のメタタグも静的に埋め込まれており、リポジトリ名や base path を変更する場合はこれらも公開URLと整合させる必要がある。
