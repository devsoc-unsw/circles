import { defineConfig } from 'vitest/config'
import { resolve } from "path";

const projectRootDir = resolve(__dirname);


export default defineConfig({
  test: {
    // TODO: add config
  },
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
})
