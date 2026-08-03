# TubePomo

YouTubeの音楽と連動したポモドーロタイマーアプリ。

## 概要

通常のポモドーロタイマーは25分作業5分休憩ですが、このアプリではそのタイムを基本として、自由に時間を指定することができます。また、youtubeのURLを使うことで作業中のBGMや休憩中のBGMも自由に選択できるようになっています。他のポモドーロアプリではタスク管理機能がついているものであったりさまざまなアレンジがありますが、本アプリはどのようなものとは逆に機能を削ぎ落として直感的に操作ができるかつすぐに誰でも扱えるようなシンプルなアプリになっています。

## 公開URL

https://takato0718.github.io/pomodoro/

## 技術スタック

- React (Vite)
- Tailwind CSS
- react-youtube
- LocalStorage

## セットアップ

```bash
npm install
npm run dev
```

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint 実行 |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run deploy` | GitHub Pages へデプロイ |

## ドキュメント

- [要件定義](docs/requirements.md)
- [AI Instructions](docs/ai-instructions.md)
- [Issue 一覧](docs/issues.md)
