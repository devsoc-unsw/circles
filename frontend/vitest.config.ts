import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const projectRootDir = resolve(__dirname);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: [
      // TODO: alias should be sync with vite.config.ts
      { find: 'assets', replacement: resolve(projectRootDir, 'src/assets') },
      { find: 'components', replacement: resolve(projectRootDir, './src/components') },
      { find: 'config', replacement: resolve(projectRootDir, './src/config') },
      { find: 'hooks', replacement: resolve(projectRootDir, './src/hooks') },
      { find: 'pages', replacement: resolve(projectRootDir, './src/pages') },
      { find: 'reducers', replacement: resolve(projectRootDir, './src/reducers') },
      { find: 'types', replacement: resolve(projectRootDir, './src/types') },
      { find: 'utils', replacement: resolve(projectRootDir, './src/utils') },
      { find: 'test', replacement: resolve(projectRootDir, './src/test') },
    ],
  },
});
