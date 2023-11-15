// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { threeMinifier } from '@yushijinhun/three-minifier-rollup';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // vite config
    define: {
      __APP_ENV__: env.APP_ENV
    },
    root: __dirname,
    publicDir: 'public',
    build: {
      outDir: 'dist'
    },
    base: env.BASE_URL || '/',
    plugins: [
      splitVendorChunkPlugin(),
      { ...threeMinifier(), enforce: 'pre' },
      visualizer()
    ]
  };
});
