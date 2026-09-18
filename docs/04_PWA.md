# 04 · PWA e instalación

UniLink es una aplicación web instalable. En el móvil se usa como una app; en el escritorio, la
web invita a instalarla desde el teléfono, que es donde tiene sentido usarla.

## Cómo está montado

| Pieza | Dónde | Notas |
| --- | --- | --- |
| Manifest | `frontend/vite.config.ts` (`VitePWA`) | **Definición única.** No hay `manifest.webmanifest` estático: lo genera el plugin en el build |
| Service worker | `vite-plugin-pwa` + Workbox | `registerType: 'autoUpdate'`; desactivado en `dev` |
| Iconos | `frontend/public/icons/` | `icon-192.png`, `icon-512.png` y `icon-512-maskable.png`, generados desde `public/favicon.svg` |
| Etiquetas de iOS | `frontend/index.html` | Safari no lee el manifest para instalar; necesita `apple-touch-icon` y `apple-mobile-web-app-*` |

**El modo `dev` no sirve para probar la PWA.** El service worker está desactivado ahí a
propósito. La única forma de ver el comportamiento real es:

```bash
cd frontend && npm run build && npm run preview
```

## El tutorial de instalación (pendiente de implementar)

Es un requisito del producto: la web debe explicar cómo instalarse, y el comportamiento cambia
por plataforma. El detalle que condiciona todo el diseño:

| Plataforma | ¿Hay prompt del navegador? | Qué mostrar |
| --- | --- | --- |
| Android (Chrome/Edge) | Sí — evento `beforeinstallprompt` | Botón "Instalar" que dispara el prompt guardado |
| Escritorio (Chrome/Edge) | Sí | Invitar a instalarla **desde el teléfono** (con QR o enlace), y ofrecer la instalación de escritorio como secundaria |
| iPhone / iPad (Safari) | **No existe** | Instrucciones manuales ilustradas: Compartir → "Añadir a pantalla de inicio" |
| Firefox, otros | Variable | Instrucciones genéricas |

Puntos que suelen olvidarse:

- `beforeinstallprompt` **no existe en iOS**. No basta con capturar el evento: hay que detectar
  la plataforma y mostrar el flujo manual.
- El evento se dispara **una sola vez** y hay que guardarlo para usarlo cuando la persona pulse
  el botón; si no se llama a `preventDefault()`, el navegador muestra su propio banner.
- Si la app ya está instalada, el evento no se dispara: hay que detectar el modo `standalone`
  (`window.matchMedia('(display-mode: standalone)')`) y no mostrar el tutorial.
- Los criterios de instalabilidad de cada navegador incluyen HTTPS, manifest válido, service
  worker registrado e iconos de 192 y 512 px. Sin los iconos reales, la app no será instalable
  aunque el resto esté bien.

## Pendientes antes de considerarla instalable

- [x] Iconos (192, 512 y 512 maskable) en `frontend/public/icons/` — provisionales: se
      regeneran desde `public/favicon.svg` cuando exista la identidad visual definitiva
- [x] `favicon.svg`
- [ ] Componente del tutorial de instalación con detección de plataforma
- [ ] Detección de `display-mode: standalone` para ocultar el tutorial cuando ya está instalada
- [ ] Verificación en dispositivo real: Android, iPhone y escritorio
- [ ] Auditoría de Lighthouse en el pipeline (job previsto en `ci.yml`)
