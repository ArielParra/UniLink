/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';

// Manifest de la PWA. Es la única definición: no existe un manifest.webmanifest
// estático en public/ — lo genera el plugin durante el build.
const manifest = {
  name: 'UniLink',
  short_name: 'UniLink',
  description: 'Conecta con estudiantes de tu universidad a partir de intereses en común.',
  lang: 'es-MX',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#ffffff',
  theme_color: '#1d4ed8',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    {
      src: '/icons/icon-512-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  // `satisfies` valida el manifest contra el tipo del plugin sin ensanchar los
  // literales: sin esto, `orientation` se infiere como `string` y el error solo
  // aparecería al construir.
} satisfies Partial<ManifestOptions>;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // El service worker se actualiza solo; aun así, para probar el comportamiento
      // real hay que usar `npm run build && npm run preview` (en `dev` está inactivo).
      registerType: 'autoUpdate',
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Necesario para que el servidor sea accesible desde fuera del contenedor.
    host: true,
    // A través de un bind mount (Docker Desktop en macOS/Windows, y algunos
    // montajes en Linux) los eventos del sistema de archivos no llegan al
    // contenedor y la recarga en caliente no se dispara. docker-compose.yml
    // activa CHOKIDAR_USEPOLLING para esos casos; en local no se paga el coste.
    ...(process.env.CHOKIDAR_USEPOLLING === 'true'
      ? { watch: { usePolling: true, interval: 300 } }
      : {}),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Convención del proyecto: `.test.ts(x)`, nunca `.spec` — ver
    // docs/02_CONVENCIONES.md. Vitest aceptaría ambos; se fija uno a propósito.
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      // `include` acota el informe al código de la aplicación: sin esto, los
      // archivos de configuración entran en la métrica y la falsean (es también
      // lo que SonarCloud lee del LCOV).
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        'src/test/**',
        'src/lib/database.types.ts',
        // Arranque de la aplicación: no hay nada que probar en él.
        'src/app/main.tsx',
      ],
    },
  },
});
