import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    server: {
      allowedHosts: ['3afc-46-187-195-128.ngrok-free.app']
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
