---
trigger: always_on
---

# UniLink — Instrucciones para agentes

> **Fuente canónica.** Este archivo y `.agents/rules/*.md` son la única definición de las
> reglas del proyecto. `AGENTS.md` (raíz) es una copia exacta y `CLAUDE.md` remite aquí.
> Si cambias una regla, cámbiala aquí y ejecuta `bash scripts/sync-agents.sh`.

## Resumen del proyecto

**UniLink** es una PWA para que estudiantes de una misma universidad se conecten a partir de
intereses en común. Alta con correo institucional de la UAA, perfil simple (nombre, foto,
centro universitario y gustos por categoría) y descubrimiento de personas afines.

**Estado actual: esqueleto.** Existen la configuración, la documentación y las convenciones;
no hay lógica de negocio ni pantallas. Al implementar una pieza nueva, documenta su patrón en
`.agents/rules/structure.md` para que el resto del equipo lo siga.

### Regla de idioma (crítica)

**El dominio y todo lo que ve el usuario van en español**: entidades, campos persistidos,
nombres de tablas y columnas, textos de UI, rutas visibles y mensajes de error.

**Los conceptos genéricos de programación van en inglés**: hooks, utilidades, servicios,
clientes, guards, tipos de infraestructura y variables locales de control de flujo
(`useSession`, `buildQuery`, `formatDate`, `isLoading`).

**Los booleanos y predicados usan prefijo `is`/`has`, nunca `es`/`tiene`** — y esta regla se
aplica también a campos persistidos y DTOs: `isVerificado` (no `esVerificado`),
`hasFotoPerfil` (no `tieneFotoPerfil`). Solo el sustantivo o adjetivo del dominio permanece en
español. Los campos no booleanos se quedan íntegramente en español: `nombre`,
`centroUniversitario`, `correoInstitucional`.

**Sin i18n**: un único locale español, sin infraestructura de traducción.

Los comentarios y la documentación siguen la misma lógica: en español cuando describen
comportamiento de dominio, en inglés cuando describen mecánica genérica.

---

## Checklist de verificación obligatorio

Se ejecuta **al cerrar una funcionalidad** —cuando el usuario da por terminado el trabajo y se
pasa a otra cosa—, no después de cada edición incremental.

```bash
cd frontend
npm run lint        # 0 problemas (usar `npm run lint:fix` antes)
npm run typecheck   # 0 errores
npm test            # todas las pruebas en verde
npm run build       # compila sin errores
```

Si el cambio tocó `supabase/migrations/`, además:

```bash
supabase db reset   # la migración aplica desde cero sin errores
```

**Nunca** se omite al cerrar. Una funcionalidad no está terminada hasta que todas las
comprobaciones aplicables pasan.

**Pruebas en navegador** (Chrome DevTools, Playwright, extensiones de automatización): solo
cuando el usuario lo pide explícitamente. Nunca levantes un servidor de desarrollo ni conduzcas
un navegador por iniciativa propia para "verificar" un cambio.

---

## Reglas duras — no violar

| Regla | Detalle |
| --- | --- |
| Nunca `git commit` ni `git push` | Ni siquiera con el trabajo terminado y verificado. Commitear y publicar son acciones exclusivas del usuario, que las hace él o las pide de forma explícita y aislada ("commitea esto") — nunca implícitas en un "termina esto" o similar. Deja el árbol de trabajo con los cambios y di qué queda listo. |
| Prohibido `any` en TypeScript | Usa interfaces estrictas o `unknown`. Los comentarios `eslint-disable` para `any` están prohibidos. |
| La `service_role` key jamás en el cliente | `frontend/` usa exclusivamente la `anon key` (`VITE_SUPABASE_ANON_KEY`). Cualquier clave con privilegios va en secrets de GitHub/Vercel. Toda variable expuesta con prefijo `VITE_` es pública: asúmelo. |
| RLS obligatoria | Toda tabla nueva se crea con `ENABLE ROW LEVEL SECURITY` **y sus políticas** en la misma migración. Una migración que crea una tabla sin políticas no se acepta. |
| Una única definición del correo institucional | El formato `al<6 dígitos>@edu.uaa.mx` se define una sola vez en `frontend/src/lib/auth/correo-institucional.ts` y se reutiliza desde la UI, el esquema de validación y la política/constraint de la base de datos. Prohibido duplicar la expresión regular. |
| Sin componentes de clase | Solo componentes de función con hooks. |
| Sin `console.log` como feedback | El feedback al usuario se da por el mecanismo de notificaciones de la app, nunca con `alert()` ni `console.log`. |
| El estilo se hace con Tailwind | Sin CSS ad-hoc fuera de `frontend/src/styles/`, sin estilos en línea. Los tokens de color y espaciado se declaran una vez en `styles/index.css`. |
| Accesibilidad en los controles | Todo input, select y botón lleva `id` y `aria-label` — sirve tanto para accesibilidad como para las pruebas. |
| Los secretos no entran al repositorio | Solo `.env` (ignorado) y secrets de GitHub/Vercel. `gitleaks` corre en cada commit. |
| No editar código generado | `frontend/src/lib/database.types.ts` lo genera Supabase; se regenera, no se edita a mano. |

---

## Arquitectura de un vistazo

| Pieza | Tecnología | Notas |
| --- | --- | --- |
| Web | React + Vite + TypeScript, Tailwind CSS | SPA instalable como PWA |
| Datos y autenticación | Supabase (PostgreSQL + Auth + Storage) | Sin backend propio: la seguridad la da la RLS |
| Despliegue | Vercel | Build estático; `main` protegida por los checks de CI |
| Desarrollo | Docker Compose (web) + Supabase CLI (stack local) | Ver `.agents/rules/tech.md` |

No hay servidor de aplicación intermedio. **Esto significa que la RLS de Supabase es la única
frontera de seguridad de los datos**: cualquier regla que se aplique solo en el cliente es una
sugerencia, no una garantía.

---

## Convenciones de commits

**Conventional Commits en español**, validados por el hook `commit-msg`. Un mensaje mal formado
se rechaza antes de crearse.

```
<tipo>(<alcance>): <verbo en infinitivo> <qué cambia>

<cuerpo opcional: por qué, no qué>
```

| Regla | Detalle |
| --- | --- |
| Verbo en **infinitivo** | `agregar`, `corregir`, `validar`, `eliminar` — nunca `agrega` ni `agregado` |
| Todo en minúscula tras los dos puntos | Salvo nombres propios (`Supabase`, `Vercel`, `RLS`) |
| Sin punto final | En el asunto |
| Asunto ≤ 72 caracteres | Si no cabe, el cambio probablemente son dos commits |
| Alcance casi siempre | Se omite solo cuando el cambio es realmente transversal |
| Un cambio lógico por commit | Reformatear y arreglar un bug son dos commits |

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
`revert`. **No hay otros**: prefijos como `sync:` o `Big feat:` los rechaza el hook.

Alcances: `auth`, `perfil`, `gustos`, `descubrir`, `pwa`, `ui`, `db`, `ci`, `docs`, `deps`,
`agents`.

```
feat(perfil): agregar selector de centro universitario
fix(auth): rechazar correos con más de 6 dígitos
refactor(gustos): extraer el catálogo de categorías a un módulo único
chore(deps): actualizar vite a 7.4
```

Cuando el cambio toca varias áreas, el cuerpo las enumera con una viñeta por área:

```
fix(auth): evitar bucle de 401 al cerrar sesión

- Cliente: omitir el manejo de 401 en el interceptor para /auth/logout.
- Base de datos: revocar la sesión en la política en lugar de en el cliente.
- Pruebas: cubrir el cierre de sesión con el token ya vencido.
```

Cambios que rompen compatibilidad: `feat(db)!: ...` o una línea `BREAKING CHANGE: ...` en el
cuerpo. Para cerrar incidencias, `Cierra #123` al final.

**Sin atribución de herramientas.** Los mensajes de commit y las descripciones de PR no llevan
trailers de IA (`Co-Authored-By: Claude ...`, `Claude-Session: ...`) ni menciones al asistente
que ayudó a escribirlos. El historial registra a las personas del equipo. Esto aplica también
cuando es un agente quien redacta el mensaje para que lo ejecute una persona.

Plantilla disponible en `.gitmessage`; se activa con
`git config commit.template .gitmessage` (el devcontainer lo hace solo).

---

## Ramas y flujo de trabajo

| Rama | Qué es |
| --- | --- |
| `main` | Protegida. Siempre desplegable. **No se le hace push directo**: solo recibe merges por PR con los checks `calidad` y `seguridad` en verde. Es lo que Vercel publica en producción |
| `dev` | Rama de integración. Es la rama por defecto para trabajar y donde confluye todo antes de subir a `main` |
| `<tipo>/<descripción>` | Ramas de trabajo, salen de `dev` y vuelven a `dev`: `feat/registro-correo`, `fix/manifest-ios` |

```
feat/mi-cambio ──▶ dev ──PR──▶ main ──▶ producción (Vercel)
                    │            │
                CI informa    CI es la puerta
```

El pipeline se ejecuta **en push a `dev` y a `main`, y en toda PR hacia `main`**. En `dev` sirve
para enterarse pronto; el que decide es el de la PR, porque es el que exige la protección de
rama.

Consecuencia práctica para un agente: **el trabajo se deja en `dev` o en una rama de trabajo,
nunca en `main`**. Y como no se commitea ni se hace push (ver reglas duras), lo normal es
simplemente dejar el árbol de trabajo listo en la rama en la que ya está el usuario.

---

## Comandos comunes

```bash
# Web (desde frontend/)
npm run dev          # servidor de desarrollo en :5173
npm run build        # build de producción
npm run preview      # sirve el build (útil para probar la PWA)
npm run lint         # ESLint — debe reportar 0 problemas
npm run lint:fix     # corrige lo autocorregible
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run test:ci      # Vitest headless + cobertura (lo que corre en CI)

# Supabase (desde la raíz)
supabase start                       # levanta el stack local (BD, Auth, Studio)
supabase stop                        # lo detiene
supabase db reset                    # recrea la BD aplicando todas las migraciones
supabase migration new <nombre>      # crea una migración vacía
supabase gen types typescript --local > frontend/src/lib/database.types.ts

# Docker (desde la raíz) — alternativa a npm run dev
docker compose up            # web en :5173
docker compose down

# Calidad y agentes (desde la raíz)
bash scripts/setup-dev-hooks.sh      # instala los hooks de pre-commit
bash scripts/sync-skills.sh          # restaura las skills desde skills-lock.json
bash scripts/sync-agents.sh          # propaga .agents/AGENTS.md a la raíz
pre-commit run --all-files           # ejecuta todos los hooks manualmente
```

---

## Trampas conocidas

- **El service worker sirve una versión vieja de la app.** `vite-plugin-pwa` se configura con
  `registerType: 'autoUpdate'`; aun así, un `index.html` cacheado puede sobrevivir a un
  despliegue. Para reproducir el comportamiento real hay que usar `npm run preview`, no
  `npm run dev` — en desarrollo el service worker está desactivado por defecto.
- **iOS no dispara `beforeinstallprompt`.** Safari no ofrece prompt de instalación: en iPhone el
  único camino es "Compartir → Añadir a pantalla de inicio", así que el tutorial de instalación
  es manual y depende de la plataforma detectada. No asumas que el evento existe.
- **`VITE_` es público.** Todo lo que lleva ese prefijo acaba en el bundle que descarga el
  navegador. Si algo no puede ser público, no lleva ese prefijo y no vive en el cliente.
- **Las políticas de RLS no se prueban solas.** `supabase db reset` valida que la migración
  aplica, no que las políticas sean correctas. Una tabla puede quedar accesible para todos y
  todo "funcionará" en desarrollo.
- **La verificación del correo institucional no es la verificación del usuario.** Comprobar el
  formato en un input no impide que alguien se registre con otro correo por otra vía; la
  restricción tiene que existir también del lado de Supabase.

---

## Documentos relacionados

| Archivo | Contenido |
| --- | --- |
| `.agents/rules/product.md` | Qué es UniLink, dominio, alcance del MVP, glosario |
| `.agents/rules/tech.md` | Stack, versiones, variables de entorno, herramientas |
| `.agents/rules/structure.md` | Estructura de carpetas y convenciones de código |
| `docs/00_ONBOARDING.md` | Puesta a punto del entorno y de las herramientas de IA |
| `docs/adr/` | Decisiones de arquitectura, incluidas las que siguen abiertas |
