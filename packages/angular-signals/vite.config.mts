/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

// Limit Angular build worker parallelism during tests to reduce memory pressure.
// (Angular build tooling uses worker threads internally.)
if (process.env['VITEST']) {
  process.env['NG_BUILD_MAX_WORKERS'] ??= '1';
  process.env['NG_BUILD_PARALLEL_TS'] ??= '0';
  process.env['NG_BUILD_TYPE_CHECK'] ??= '0';
}

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/angular-signals',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    name: 'angular-signals',
    watch: false,
    globals: true,
    environment: 'jsdom',
    deps: {
      optimizer: {
        web: { enabled: false },
        ssr: { enabled: false },
      },
    },
    dangerouslyIgnoreUnhandledErrors: true,
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/angular-signals',
      provider: 'v8' as const,
    },
  },
}));
