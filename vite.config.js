// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, loadEnv } from 'vite';

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
    base: '/StuffInSpace'
  };
});
