---
trigger: always_on
---

# UniLink — Stack técnico

## Servicios

| Pieza | Tecnología | Notas |
| --- | --- | --- |
| Web | React 19 + Vite + TypeScript, sobre Node 24 (LTS) | SPA; código en `frontend/` |
| Estilos | Tailwind CSS v4 | Configuración CSS-first: sin `tailwind.config.js`, los tokens viven en `frontend/src/styles/index.css` |
| PWA | `vite-plugin-pwa` (Workbox) | Manifest y service worker generados en el build |
| Datos y autenticación | Supabase (PostgreSQL, Auth, Storage) | Sin backend propio; el cliente habla directo con Supabase usando la `anon key` |
| Enrutado | React Router | Rutas declaradas en `src/app/` |
| Validación | Zod | Esquemas compartidos entre formularios y capa de datos |
| Pruebas | Vitest + Testing Library | `*.test.ts` / `*.test.tsx` junto al archivo que prueban |
| Calidad | ESLint (flat config) + Prettier + SonarCloud | Ver `docs/03_CALIDAD_CI.md` |
| Despliegue | Vercel | Integración con Git; `Root Directory` = `frontend` |
| Desarrollo | Docker Compose + Supabase CLI | Ver más abajo |

Las versiones exactas viven en `frontend/package.json`. Los rangos declarados ahí son el punto
de partida del proyecto: la primera instalación (`npm install`) fija el `package-lock.json`, y a
partir de ahí manda el lockfile.

## Entorno de desarrollo

Hay tres formas de trabajar, y todas conviven:

- **Devcontainer** (`.devcontainer/`) — la más completa: Node 22, CLI de Supabase, extensiones y
  hooks ya instalados. Requiere Docker en el anfitrión.
- **En la máquina** — Node 22 y la CLI de Supabase instalados localmente.
- **Docker Compose** — solo la web en un contenedor, para quien no quiera Node en su máquina.

En cualquiera de las tres hay **dos piezas independientes** y conviene no mezclarlas:

1. **La aplicación web.** `npm run dev` desde `frontend/`, o `docker compose up` desde la raíz
   si se prefiere no instalar Node en la máquina. Ambas sirven en `:5173`.
2. **El stack de Supabase.** Lo levanta su propio CLI (`supabase start`), que arranca sus
   contenedores. **No se duplica en `docker-compose.yml`**: replicar a mano PostgreSQL, GoTrue,
   PostgREST y Storage produce un entorno que se desincroniza del real en cuanto Supabase
   cambia una versión.

Con el stack local arriba, `supabase start` imprime la URL de la API y la `anon key`; se copian
a `frontend/.env`.

## Variables de entorno

`frontend/.env` (plantilla en `frontend/.env.example`):

```bash
VITE_SUPABASE_URL=          # URL del proyecto (local: la que imprime `supabase start`)
VITE_SUPABASE_ANON_KEY=     # clave anónima — pública por diseño, protegida por RLS
VITE_APP_URL=http://localhost:5173   # base para los enlaces de verificación por correo
```

`.env` en la raíz (plantilla en `.env.example`) solo lleva ajustes del entorno de desarrollo
(puerto de Docker, ref del proyecto de Supabase).

**Nunca en el repositorio ni en el cliente:** `SUPABASE_SERVICE_ROLE_KEY`, `SONAR_TOKEN`, ni
credenciales de Vercel. Van en los secrets de GitHub y en las variables de entorno de Vercel.

Todo lo que empieza por `VITE_` termina dentro del bundle que descarga cualquier visitante.

## Comandos

```bash
# Web (desde frontend/)
npm run dev | build | preview | lint | lint:fix | typecheck | test | test:ci

# Supabase (desde la raíz)
supabase start | stop | db reset
supabase migration new <nombre>
supabase gen types typescript --local > frontend/src/lib/database.types.ts

# Docker (desde la raíz)
docker compose up          # levanta solo la web
docker compose down

# Calidad y agentes (desde la raíz)
bash scripts/setup-dev-hooks.sh
bash scripts/sync-skills.sh
bash scripts/sync-agents.sh
pre-commit run --all-files
```

## Herramientas de IA

El repositorio está preparado para **Claude Code**, **OpenCode** y **Antigravity**. Las reglas
se escriben una sola vez en `.agents/` y las tres herramientas las leen:

| Herramienta | Qué lee | Cómo |
| --- | --- | --- |
| OpenCode | `.agents/AGENTS.md`, `.agents/rules/*.md`, `.opencode/skills` | `opencode.json` (`instructions`); las skills las instala cada persona con `npx skills` |
| Antigravity | `AGENTS.md` de la raíz | Copia exacta de `.agents/AGENTS.md`, verificada por un hook de pre-commit |
| Claude Code | `CLAUDE.md`, `.claude/skills/` | `CLAUDE.md` contiene las reglas duras y remite a `.agents/rules/*.md` |

Consecuencia al escribir reglas: **nada específico de una sola herramienta dentro de
`.agents/`**. Los comandos propios de Claude Code, sus plugins o sus subagentes se documentan en
`CLAUDE.md` y en `docs/00_ONBOARDING.md`.

Las **skills** se instalan con el CLI `skills` y se registran en `skills-lock.json` (origen y
hash de cada una). **Qué agentes las reciben lo decide cada persona**: el CLI lo pregunta al
instalar, igual que si prefiere enlaces simbólicos o copias. Por eso ni los cuerpos ni los
enlaces se versionan —están en `.gitignore`— y un clon nuevo las recupera con
`bash scripts/sync-skills.sh`, que reenvía a `npx skills add` las opciones que le pases.

## Trampas conocidas

| Problema | Detalle |
| --- | --- |
| El service worker sirve una versión vieja | En `npm run dev` el service worker está desactivado; la PWA solo se comporta como en producción con `npm run build && npm run preview`. Configurado con `registerType: 'autoUpdate'`, pero un `index.html` cacheado puede sobrevivir a un despliegue. |
| iOS no dispara `beforeinstallprompt` | Safari no ofrece prompt de instalación. El tutorial de iPhone es manual ("Compartir → Añadir a pantalla de inicio") y debe detectarse la plataforma. |
| `VITE_` es público | Cualquier variable con ese prefijo viaja al navegador. No es un lugar donde esconder nada. |
| Un `supabase db reset` que pasa no significa RLS correcta | Solo prueba que la migración aplica. Las políticas hay que probarlas explícitamente con distintos usuarios. |
| Bind mounts y SELinux | En Fedora/RHEL, un bind mount sin sufijo `:z` da `permission denied` dentro del contenedor. `docker-compose.yml` ya lo lleva. Si una herramienta en contenedor reetiqueta el árbol de trabajo y otras dejan de leerlo, `restorecon -F -R .` lo restaura. |
| CRLF rompe los scripts | `.gitattributes` fuerza LF. Un `.sh` con CRLF falla dentro del contenedor con `bad interpreter`, un error que no apunta a su causa. No toques `core.autocrlf`. |
| Recarga en caliente en contenedor | A través de un bind mount los eventos de archivo no siempre llegan. `docker-compose.yml` activa `CHOKIDAR_USEPOLLING`, y `vite.config.ts` lo traduce a `server.watch.usePolling` solo cuando está presente. |
| `vite.config.ts` no lo cubría `tsc --noEmit` | `tsconfig.json` solo incluye `src`. Por eso `npm run typecheck` comprueba también `tsconfig.node.json`: sin eso, un error de tipos en la configuración solo aparecía al construir. |
| Tailwind v4 no usa `tailwind.config.js` | La configuración es CSS-first (`@theme` en `styles/index.css`). Guías escritas para v3 aplican mal aquí; no añadas `postcss.config.js` ni `tailwind.config.js` "porque el tutorial lo dice". |
| Sin `package-lock.json` el CI falla | El job de calidad usa `npm ci`, que exige el lockfile. Se genera con la primera instalación y se commitea. |
