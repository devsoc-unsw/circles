import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const projectRootDir = resolve(__dirname);

export default defineConfig({
  plugins: [react()],
  test: {
    // TODO: add config
    environment: 'happy-dom',
  },
  resolve: {
    alias: [
      { find: 'assets', replacement: resolve(projectRootDir, 'src/assets') },
      { find: 'components', replacement: resolve(projectRootDir, './src/components') },
      { find: 'config', replacement: resolve(projectRootDir, './src/config') },
      { find: 'hooks', replacement: resolve(projectRootDir, './src/hooks') },
      { find: 'pages', replacement: resolve(projectRootDir, './src/pages') },
      { find: 'reducers', replacement: resolve(projectRootDir, './src/reducers') },
      { find: 'types', replacement: resolve(projectRootDir, './src/types') },
      { find: 'utils', replacement: resolve(projectRootDir, './src/utils') },
    ],
  },
});
