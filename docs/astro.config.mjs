// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  integrations: [
      starlight({
     customCss: [
      // Path to your Tailwind base styles:
      './src/styles/global.css',
    ],
          title: 'Angular Signals',
          social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/julio-burgos/angular-signals' }],
          sidebar: [
              {
                  label: 'Guides',
                  items: [
                      // Each item here is one entry in the navigation menu.
                      { label: 'Getting Started', slug: 'guides/getting-started' },
                  ],
              },
              {
                  label: 'Reference',
                  autogenerate: { directory: 'reference' },
              },
          ],
      }),
	],

  adapter: cloudflare({
    imageService: 'cloudflare',

  }),
});
