import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name, version } from './package.json';

export default defineConfig(({ mode }) => ({
  envPrefix: 'DU_',
  plugins: [
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: `${name}-${version}-${mode}.zip` }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
}));
