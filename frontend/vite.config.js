import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository name — used as the base path for GitHub Pages.
// When deployed to: https://Harshs515.github.io/SIHhack/
// all assets must be served under /SIHhack/
const REPO_NAME = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/SIHhack/';

export default defineConfig({
  // Use repo sub-path in production (GitHub Pages), root in dev.
  base: process.env.NODE_ENV === 'production' ? REPO_NAME : '/',

  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
