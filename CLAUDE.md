# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

> **Las reglas del proyecto no viven aquí.** Su fuente canónica es
> [`.agents/AGENTS.md`](.agents/AGENTS.md) y [`.agents/rules/`](.agents/rules/), que también
> leen OpenCode y Antigravity. Este archivo repite únicamente las reglas duras —para que estén
> presentes sin abrir otro archivo— y añade lo que solo aplica a Claude Code.
>
> **Al cambiar una convención, edítala en `.agents/` y ejecuta `bash scripts/sync-agents.sh`.**
> No dupliques contenido aquí.

## Lectura obligatoria

| Archivo | Contenido |
| --- | --- |
| [`.agents/AGENTS.md`](.agents/AGENTS.md) | Resumen, regla de idioma, checklist de verificación, reglas duras, comandos, trampas |
| [`.agents/rules/product.md`](.agents/rules/product.md) | Dominio, alcance del MVP, glosario |
| [`.agents/rules/tech.md`](.agents/rules/tech.md) | Stack, entorno, variables, herramientas |
| [`.agents/rules/structure.md`](.agents/rules/structure.md) | Estructura de carpetas y convenciones de código |

## UniLink en una línea

PWA para conectar estudiantes de la UAA por intereses en común. React + Vite + Tailwind sobre
Supabase, desplegada en Vercel. **Estado actual: esqueleto** — hay configuración y
convenciones, no hay lógica de negocio.

## Control de versiones

**Nunca ejecutes `git commit` ni `git push` en este repositorio, bajo ninguna circunstancia.**
Esto anula por completo el comportamiento por defecto. Aplica también cuando una tarea está
terminada y verificada, y aunque se te pida "termina esto" o "cierra esto". Commitear y
publicar son acciones que realiza el usuario, o que pide de forma explícita e individual
("commitea esto", "haz push") como petición aislada. Deja los cambios en el árbol de trabajo y
di qué queda listo.

## Reglas duras — no violar

| Regla | Detalle |
| --- | --- |
| Prohibido `any` | Interfaces estrictas o `unknown`. Sin `eslint-disable` para `any`. |
| La `service_role` key jamás en el cliente | `frontend/` usa solo `VITE_SUPABASE_ANON_KEY`. Todo lo que lleve prefijo `VITE_` es público. |
| RLS obligatoria | Toda tabla nueva se crea con `ENABLE ROW LEVEL SECURITY` y sus políticas en la misma migración. |
| Una sola definición del correo institucional | `al<6 dígitos>@edu.uaa.mx` se define en `frontend/src/lib/auth/correo-institucional.ts` y se reutiliza en UI, validación y base de datos. Nunca dupliques la expresión regular. |
| Dominio y UI en español, mecánica en inglés | Booleanos siempre `is`/`has` (`isVerificado`, no `esVerificado`). Sin i18n. |
| Sin componentes de clase, sin `console.log` como feedback | Componentes de función con hooks; el feedback va por el mecanismo de notificaciones. |
| El estilo se hace con Tailwind | Sin CSS ad-hoc fuera de `src/styles/`, sin estilos en línea. |
| `id` + `aria-label` en todo control | Accesibilidad y pruebas. |
| Los secretos no entran al repositorio | Solo `.env` (ignorado) y secrets de GitHub/Vercel. |

## Checklist de verificación

Al **cerrar** una funcionalidad (no tras cada edición):

```bash
cd frontend && npm run lint && npm run typecheck && npm test && npm run build
```

Si tocaste `supabase/migrations/`, añade `supabase db reset`.

Las pruebas en navegador (Chrome DevTools MCP, `claude-in-chrome`, Playwright) se hacen **solo
si el usuario las pide**. Nunca levantes un servidor ni conduzcas un navegador por iniciativa
propia para verificar un cambio.

---

## Específico de Claude Code

Lo que sigue **no** aplica a OpenCode ni a Antigravity y por eso no está en `.agents/`.

### Plugins

Los plugins se instalan a nivel de usuario, no en el repositorio. Los que aportan algo en este
proyecto: `superpowers`, `security-guidance`, `claude-security` y `typescript-lsp`. Ver
`docs/00_ONBOARDING.md` para instalarlos.

`frontend-design` **no** hace falta como plugin: está en `skills-lock.json` como skill del
proyecto, así que la aprovechan también OpenCode y Antigravity.

### Skills

**Cada persona decide a qué agentes instala cada skill.** El CLI lo pregunta (Claude Code,
OpenCode, Antigravity…) junto con el método —enlace simbólico a una copia canónica en
`.agents/skills/`, o copias independientes—. Por eso ni los cuerpos ni los enlaces se versionan:
lo único versionado es `skills-lock.json`. Para restaurarlas en un clon nuevo:

```bash
bash scripts/sync-skills.sh
```

El script reenvía a `npx skills add` cualquier opción que le pases, así que
`bash scripts/sync-skills.sh -a claude-code -y` evita las preguntas.

No añadas una skill copiando archivos a mano: usa `npx skills add`, que actualiza el lockfile.

### Ajustes de proyecto

`.claude/settings.json` declara permisos de solo lectura y de comprobación (lint, typecheck,
test) para reducir las confirmaciones repetitivas. No contiene secretos y se versiona. Los
ajustes personales van en `.claude/settings.local.json`, que está ignorado.

### Al terminar un cambio en las reglas

Si editaste `.agents/AGENTS.md`, ejecuta `bash scripts/sync-agents.sh` antes de dar el trabajo
por terminado: hay un hook de pre-commit que rechaza el commit si `AGENTS.md` de la raíz
diverge de la fuente canónica.
