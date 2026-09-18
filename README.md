# UniLink

Aplicación web progresiva (PWA) para que estudiantes de una misma universidad se conecten a
partir de intereses en común. Registro con correo institucional de la UAA, perfil con gustos por
categoría y descubrimiento de personas afines.

> **Estado: esqueleto.** Este repositorio contiene la configuración, las convenciones y la
> documentación del proyecto. Todavía no hay lógica de negocio ni pantallas.

## Stack

| Pieza | Tecnología |
| --- | --- |
| Web | React + Vite + TypeScript, Tailwind CSS v4 |
| PWA | `vite-plugin-pwa` (Workbox) |
| Datos y autenticación | Supabase (PostgreSQL + Auth + Storage) |
| Despliegue | Vercel |
| Desarrollo | Docker Compose + Supabase CLI |
| Calidad | ESLint, Prettier, SonarCloud, pre-commit, GitHub Actions |

## Arranque rápido

```bash
bash scripts/setup-dev-hooks.sh   # hooks de calidad y seguridad
bash scripts/sync-skills.sh       # skills de los agentes de IA

supabase start                    # base de datos local
supabase status                   # copia API URL y anon key

cd frontend
cp .env.example .env              # pega ahí esos dos valores
npm install
npm run dev                       # http://localhost:5173
```

Guía completa: [`docs/00_ONBOARDING.md`](docs/00_ONBOARDING.md).

## Estructura

```text
.agents/     Reglas del proyecto — fuente canónica para todas las herramientas de IA
.claude/     Ajustes de Claude Code (permisos); las skills las instala cada dev
.opencode/   Skills de OpenCode (opencode.json está en la raíz)
.devcontainer/ Entorno de desarrollo reproducible (opcional)
docs/        Documentación del equipo y decisiones de arquitectura (ADR)
frontend/    La aplicación web  ← Root Directory en Vercel
supabase/    Esquema, migraciones y configuración del stack local
scripts/     Utilidades del repositorio
```

## Documentación

| Documento | Contenido |
| --- | --- |
| [`docs/00_ONBOARDING.md`](docs/00_ONBOARDING.md) | Puesta a punto del entorno y de las herramientas de IA |
| [`docs/01_ARQUITECTURA.md`](docs/01_ARQUITECTURA.md) | Cómo encajan las piezas y por qué la RLS es crítica |
| [`docs/02_CONVENCIONES.md`](docs/02_CONVENCIONES.md) | Idioma, nombres, commits, código |
| [`docs/03_CALIDAD_CI.md`](docs/03_CALIDAD_CI.md) | Lint, pre-commit, SonarCloud, pipeline |
| [`docs/04_PWA.md`](docs/04_PWA.md) | Manifest, service worker e instalación por plataforma |
| [`docs/05_HERENCIA_SIGI.md`](docs/05_HERENCIA_SIGI.md) | Qué prácticas vienen de SIGI, qué se adaptó y por qué |
| [`docs/adr/`](docs/adr/) | Decisiones de arquitectura, incluidas las abiertas |
| [`AGENTS.md`](AGENTS.md) · [`CLAUDE.md`](CLAUDE.md) | Instrucciones para los agentes de IA |

## Ramas

`main` está protegida y solo recibe merges por PR con el CI en verde; es lo que Vercel publica.
Se trabaja en `dev` o en ramas que salen de ella:

```bash
git switch dev            # rama de integración
git switch -c feat/algo   # rama de trabajo
```

## Reglas que no se negocian

- El dominio y la interfaz van en español; la mecánica genérica, en inglés. Booleanos con
  `is`/`has`.
- Prohibido `any` en TypeScript.
- Toda tabla nueva se crea con RLS **y sus políticas** en la misma migración.
- La `service_role` key jamás llega al cliente. Todo lo que empieza por `VITE_` es público.
- Los agentes de IA no ejecutan `git commit` ni `git push`.

El detalle está en [`.agents/AGENTS.md`](.agents/AGENTS.md).
