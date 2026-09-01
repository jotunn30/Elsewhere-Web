import { sites } from '@openai/sites-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [sites()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        library: 'library/index.html',
        libraryCategory: 'library/category/index.html',
        passport: 'passport/index.html',
      },
    },
  },
});
