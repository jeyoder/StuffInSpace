// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { threeMinifier } from '@yushijinhun/three-minifier-rollup';
import path from 'path';

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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@satellite-viewer': path.resolve(__dirname, './src/viewer')
      },
    },
    plugins: [
      // TODO attempting to reduce threejs bundle size. Still a WIP
      { ...threeMinifier(), enforce: 'pre' },
      splitVendorChunkPlugin(),
      visualizer()
    ]
  };
});
