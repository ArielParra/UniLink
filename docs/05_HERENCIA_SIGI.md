# 05 · Qué heredamos de SIGI

UniLink no partió de cero en su forma de trabajar: la configuración de este repositorio es una
adaptación de la que ya estaba probada en **SIGI** (el sistema de gestión clínica: Angular +
Spring Boot + PostgreSQL). Este documento deja constancia de qué se encontró allí, qué se
trasladó, qué se cambió y —sobre todo— **por qué**, para que nadie tenga que reconstruir el
razonamiento a partir del resultado.

## Qué había realmente en SIGI

| Pieza | Qué es | Sorpresas |
| --- | --- | --- |
| `.claude/` | Solo `skills/` (ignorada por git) | **No hay comandos personalizados, ni hooks, ni `settings.json` de proyecto.** La configuración de Claude Code allí es mínima |
| Plugins de Claude Code | `superpowers`, `frontend-design`, `claude-security`, `security-guidance`, `typescript-lsp`, `jdtls-lsp` | Instalados **a nivel de usuario**, no en el repositorio: no se versionan ni se heredan al clonar |
| `.agents/` | `AGENTS.md` (`trigger: always_on`) + `rules/{product,tech,structure}.md` + `skills/` | Es la pieza central del esquema multi-herramienta |
| `.opencode/` | `opencode.json` en la raíz apuntando a `.agents/`, y `.opencode/skills` como **enlace simbólico** a `../.agents/skills` | El `node_modules` que hay dentro es solo el SDK de plugins, no configuración |
| `.kiro/` | Espejo para Kiro: `steering/` con los mismos cuatro documentos | Tercera copia del mismo contenido |
| `skills-lock.json` | Lockfile del CLI `npx skills`: por skill guarda `source`, `sourceType`, `skillPath` y `computedHash` | Los cuerpos están en `.gitignore`; **solo se versiona el lock** |
| `CLAUDE.md` + `AGENTS.md` | El mismo contenido escrito dos veces, con una nota que pide mantenerlos sincronizados | Ya habían empezado a divergir: la sincronización manual no se sostiene |
| Calidad | `.pre-commit-config.yaml` (higiene, `gitleaks`, `shellcheck`, `hadolint`, lint, Conventional Commits en `commit-msg`), `sonar-project.properties`, `.editorconfig`, `dependabot.yml`, CI de 4 jobs | Muy completo; la base de lo que hay aquí |

## Qué se trasladó tal cual

- **El esquema `.agents/` como fuente canónica** y la separación en `product` / `tech` /
  `structure`.
- **El mecanismo de `skills-lock.json`**: cuerpos ignorados, lockfile versionado.
- **La regla de idioma**: dominio y UI en español, mecánica en inglés, booleanos con `is`/`has`
  incluso sobre campos persistidos, sin i18n.
- **El checklist de verificación obligatorio al cerrar** una funcionalidad, no tras cada edición.
- **La prohibición de que el agente ejecute `git commit` o `git push`.**
- **`id` + `aria-label` en todos los controles**, por accesibilidad y por las pruebas.
- **La tabla de "reglas duras"** y la de "trampas conocidas": dos formatos que funcionan porque
  se leen de un vistazo.
- **`pre-commit` con Conventional Commits** y el instalador `scripts/setup-dev-hooks.sh`.

## Qué se cambió, y por qué

| Cambio | Razón |
| --- | --- |
| **Las reglas se escriben una sola vez.** `.agents/` es la fuente; `AGENTS.md` de la raíz es copia exacta y `CLAUDE.md` remite a ella | En SIGI el mismo contenido vive en tres sitios y ya divergía. Un hook (`agents-sync`) verifica ahora la copia, y `scripts/sync-agents.sh` la propaga |
| **`scripts/sync-skills.sh`** lee el lockfile y reinstala | En SIGI no existe: restaurar las skills en un clon nuevo era un trabajo manual, y por tanto algo que no se hacía |
| **Los enlaces de skills no se versionan.** SIGI commitea `.opencode/skills` como enlace simbólico a `.agents/skills` | Eso impone a todo el equipo los mismos agentes y el mismo método. Aquí cada persona elige al instalar: quien solo use Claude Code no arrastra los enlaces de OpenCode |
| **Devcontainer** (`.devcontainer/`) | SIGI no lo tiene. Con Supabase + Node + CLI + hooks, montar el entorno a mano tiene demasiados pasos como para dejarlo a la suerte de cada máquina |
| **`.claude/settings.json` de proyecto** con permisos de solo lectura y de comprobación | SIGI no lo tiene; sin él, cada `npm run lint` o `git diff` pide confirmación |
| **Kiro fuera**; su lugar lo ocupa Antigravity | Es la herramienta que usa el equipo de UniLink. Antigravity lee el `AGENTS.md` de la raíz, que ya existe |
| **CI rehecho** (`calidad` → `sonarcloud` → `seguridad`) | El de SIGI construye y publica imágenes en GHCR; aquí despliega Vercel desde Git, así que el pipeline es una puerta de calidad, no un empaquetador |
| **SonarCloud en vez de SonarQube autoalojado** | SIGI se conecta a un `localhost:9000`; aquí nadie tiene que levantar un servidor |

## Skills: qué se descartó

De las 24 skills de SIGI, **13 no aplican**: `angular-developer`, `angular-material-developer`,
`angular-signals`, `angular-testing`, `java-junit`, `java-springboot`, `spring-boot-*`,
`spring-data-jpa`, `springboot-security` — todas atadas a un stack que aquí no existe.

`ui-craft` también se descartó pese a ser de interfaz: está escrita para Angular (Spartan,
PrimeNG, NG-ZORRO, Angular Material) y su valor aquí lo cubre el plugin `frontend-design`.

**`postgresql-optimization` sí se conserva**, aunque venga de la parte de base de datos de SIGI:
Supabase *es* PostgreSQL, y los índices y las políticas de RLS son exactamente su terreno.

Las 13 genéricas que sí se trasladan ya están en `skills-lock.json`, más `frontend-design`
(que en SIGI se usaba como plugin de Claude Code y aquí es skill del proyecto, para que también
la vean OpenCode y Antigravity). Las siete propias de UniLink siguen por escribir: la lista está
en [`00_ONBOARDING.md`](00_ONBOARDING.md) §4.

## La diferencia estructural que lo condiciona todo

SIGI tiene un backend propio (Spring Boot) donde viven las reglas de negocio y la
autorización. **UniLink no.** El navegador habla directamente con Supabase, así que las reglas
que en SIGI eran código de servidor aquí tienen que ser **políticas de RLS**. De ahí que la regla
"toda tabla nueva se crea con RLS y sus políticas en la misma migración" sea una regla dura y no
una recomendación: es el equivalente aquí del `PacienteController` que en SIGI filtra por
profesionista propietario.
