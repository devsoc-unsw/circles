import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import svgrPlugin from 'vite-plugin-svgr';

const projectRootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env,
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    eslint(),
    splitVendorChunkPlugin(),
    checker({ typescript: true }),
  ],
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
      { find: 'test', replacement: resolve(projectRootDir, './src/test') },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#9254de', // purple-5
        },
        javascriptEnabled: true,
      },
    },
  },
});
