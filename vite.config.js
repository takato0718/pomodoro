import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// GitHub Pages（project site）用。リポジトリ名が pomodoro のため base は /pomodoro/
export default defineConfig({
  base: '/pomodoro/',
  plugins: [react(), tailwindcss()],
});
