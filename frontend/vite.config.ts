import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import svgrPlugin from 'vite-plugin-svgr';

const projectRootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  build: {
    outDir: 'build',
    assetsInlineLimit: 0
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true
        // ...svgr options (https://react-svgr.com/docs/options/)
      }
    }),
    // the frontend eslint config must not lint packages/degree-eval (it has its own)
    eslint({ exclude: ['**/node_modules/**', '**/packages/degree-eval/**'] }),
    checker({ typescript: true })
  ],
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        resolve(projectRootDir, '../packages/degree-eval')
      ]
    }
  },
  resolve: {
    alias: [
      // TODO: alias should be sync with vitest.config.ts
      // @circles/degree-eval is source-only: alias to src/ so edits hot-reload without reinstalling
      {
        find: /^@circles\/degree-eval$/,
        replacement: resolve(projectRootDir, '../packages/degree-eval/src/index.ts')
      },
      { find: 'assets', replacement: resolve(projectRootDir, 'src/assets') },
      { find: 'components', replacement: resolve(projectRootDir, './src/components') },
      { find: 'config', replacement: resolve(projectRootDir, './src/config') },
      { find: 'hooks', replacement: resolve(projectRootDir, './src/hooks') },
      { find: 'pages', replacement: resolve(projectRootDir, './src/pages') },
      { find: 'reducers', replacement: resolve(projectRootDir, './src/reducers') },
      { find: 'types', replacement: resolve(projectRootDir, './src/types') },
      { find: 'utils', replacement: resolve(projectRootDir, './src/utils') },
      { find: 'test', replacement: resolve(projectRootDir, './src/test') },
      { find: 'styles', replacement: resolve(projectRootDir, './src/styles') }
    ]
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#9254de' // purple-5
        },
        javascriptEnabled: true
      }
    }
  }
});
