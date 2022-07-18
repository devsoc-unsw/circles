import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";

const projectRootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
  ],
  resolve: {
    alias: [
      { find: "assets", replacement: resolve(projectRootDir, "src/assets") },
      { find: "components", replacement: resolve(projectRootDir, "./src/components") },
      { find: "config", replacement: resolve(projectRootDir, "./src/config") },
      { find: "hooks", replacement: resolve(projectRootDir, "./src/hooks") },
      { find: "pages", replacement: resolve(projectRootDir, "./src/pages") },
      { find: "reducers", replacement: resolve(projectRootDir, "./src/reducers") },
    ],
  },
  server: {
    watch: {
      usePolling: true
    }
  },

  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          "@primary-color": "#9254de", // purple-5
          // Since we've disabled the toggling of themes, I've changed heading colour to black
          "@heading-color": "black",
          "@text-color": "black",
        },
        javascriptEnabled: true,
      },
    },
  },

});
