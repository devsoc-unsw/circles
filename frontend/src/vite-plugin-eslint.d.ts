// vite-plugin-eslint 1.8.1 ships declarations at dist/index.d.ts but its package.json
// "exports" map has no "types" condition, so they are unreachable under
// moduleResolution: "bundler". Re-export the bundled types via a direct path.
declare module 'vite-plugin-eslint' {
  export * from 'vite-plugin-eslint/dist/index';
  export { default } from 'vite-plugin-eslint/dist/index';
}
