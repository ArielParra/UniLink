# 00 · Puesta a punto

Todo lo necesario para empezar a trabajar en UniLink.

## 1. Requisitos

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Node.js | 22 o superior | Aplicación web |
| Docker o Podman | reciente | Stack local de Supabase (y, opcionalmente, la web) |
| Supabase CLI | reciente | Base de datos, autenticación y migraciones |
| Python + `pre-commit` | 3.5+ | Hooks de calidad y seguridad |
| ShellCheck | reciente | Opcional: análisis de los scripts al commitear (el CI lo comprueba igual) |
| Git | 2.40+ | — |

## 2. Primer arranque

Hay dos caminos. El devcontainer deja todo montado; la instalación local da más control.

### Opción A — Devcontainer (recomendado si ya usas Docker)

Abre el repositorio en VSCode y acepta *"Reopen in Container"* (o `Dev Containers: Reopen in
Container` desde la paleta). `.devcontainer/post-create.sh` instala las dependencias de la web,
la CLI de Supabase y los hooks de git, crea `frontend/.env` desde la plantilla y reenvía los
puertos 5173 y 54321-54324. Las extensiones recomendadas vienen preinstaladas.

Al terminar:

```bash
supabase start && supabase status   # copia API URL y anon key a frontend/.env
cd frontend && npm run dev
```

Las skills de los agentes **no** se instalan solas: son una elección personal (ver §4).

### Opción B — En tu máquina

```bash
git clone <url-del-repo> && cd UniLink

# Hooks de calidad (formato, secretos, Conventional Commits)
bash scripts/setup-dev-hooks.sh

# Skills de los agentes de IA (ver sección 4)
bash scripts/sync-skills.sh

# Base de datos local
supabase start
supabase status          # copia API URL y anon key

# Aplicación web
cd frontend
cp .env.example .env     # pega ahí la URL y la anon key
npm install              # instala desde package-lock.json
npm run dev              # http://localhost:5173
```

Alternativa sin Node en la máquina: `docker compose up` desde la raíz (necesita
`frontend/.env` ya creado). Levanta solo la web; Supabase sigue viniendo de `supabase start`.

> **Nota sobre las dependencias.** `package-lock.json` está versionado: `npm install` debe
> reproducir exactamente el mismo árbol. Si necesitas actualizar algo, hazlo con `npm install
> <paquete>@<versión>` y commitea `package.json` y el lockfile juntos.

## 2.bis Compatibilidad por sistema

El equipo trabaja en macOS, Windows y Linux (Fedora, Ubuntu y Arch), con Docker o Podman
indistintamente. El proyecto está preparado para las tres combinaciones; esto es lo que conviene
saber de cada una.

| Sistema | Estado | Qué tener en cuenta |
| --- | --- | --- |
| **macOS** | Sin fricción | Docker Desktop o Colima. La recarga en caliente dentro del contenedor usa *polling* (lo activa `docker-compose.yml`), porque los eventos de archivo no cruzan la VM |
| **Windows** | Sin fricción **usando WSL2** | Clona el repositorio **dentro** del sistema de archivos de WSL, no en `C:\`: desde `/mnt/c` el rendimiento cae y los permisos se comportan distinto. Los scripts `.sh` necesitan bash (WSL o Git Bash) |
| **Linux (Fedora, SELinux)** | Sin fricción | El bind mount de `docker-compose.yml` lleva `:z`, que es lo que evita el `permission denied`. Si alguna herramienta en contenedor reetiqueta el árbol, `restorecon -F -R .` lo devuelve a su estado |
| **Linux (Ubuntu, AppArmor)** | Sin fricción | El perfil por defecto de Docker no interfiere con nada de lo que hace el proyecto |
| **Linux (Arch)** | Sin fricción | Con Podman recuerda habilitar el socket de usuario (abajo) |

### Podman en lugar de Docker

Los archivos son los mismos; cambia el comando:

```bash
podman compose up            # equivalente a `docker compose up`
```

Para que el **devcontainer** funcione con Podman, VSCode necesita un socket compatible:

```bash
systemctl --user enable --now podman.socket
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
```

La CLI de Supabase detecta Podman por sí sola si `DOCKER_HOST` apunta al socket.

### Finales de línea

`.gitattributes` fuerza LF en todo el repositorio y CRLF solo donde Windows lo necesita. No
cambies `core.autocrlf`: un script `.sh` con CRLF falla dentro del contenedor con un error
(`bad interpreter`) que no se parece en nada a su causa.

## 3. Dónde están las reglas

La fuente canónica es [`.agents/`](../.agents/), que leen todas las herramientas:

| Archivo | Contenido |
| --- | --- |
| [`.agents/AGENTS.md`](../.agents/AGENTS.md) | Reglas duras, checklist de verificación, comandos, trampas |
| [`.agents/rules/product.md`](../.agents/rules/product.md) | Dominio, alcance del MVP, glosario |
| [`.agents/rules/tech.md`](../.agents/rules/tech.md) | Stack, entorno, variables |
| [`.agents/rules/structure.md`](../.agents/rules/structure.md) | Carpetas y convenciones de código |
| [`05_HERENCIA_SIGI.md`](05_HERENCIA_SIGI.md) | De dónde vienen estas convenciones y por qué son así |

`AGENTS.md` (raíz) es una **copia** de `.agents/AGENTS.md` y `CLAUDE.md` **remite** a ella. Si
cambias una convención: edítala en `.agents/`, ejecuta `bash scripts/sync-agents.sh` y commitea
ambos archivos. Un hook de pre-commit rechaza el commit si divergen.

## 4. Herramientas de IA

El repositorio está preparado para **Claude Code**, **OpenCode** y **Antigravity**. Ninguna
necesita configuración adicional en el proyecto:

- **OpenCode** lee `opencode.json`, que apunta a `.agents/AGENTS.md` y `.agents/rules/*.md`.
- **Antigravity** lee `AGENTS.md` de la raíz.
- **Claude Code** lee `CLAUDE.md` y `.claude/settings.json` (permisos de solo lectura y de
  comprobación, para reducir confirmaciones repetitivas).

Las tres funcionan en macOS, Windows y Linux. El único detalle por sistema está en las skills:
`npx skills` ofrece instalarlas como **enlace simbólico** o como **copia**, y en Windows los
enlaces requieren el modo desarrollador activado —ahí conviene elegir *copia*—. Como el método
lo decide cada persona al instalar y nada de eso se versiona, no hay nada que configurar.

### Plugins de Claude Code

Se instalan **a nivel de usuario**, no en el repositorio, así que cada persona lo hace una vez
con `/plugin`. Los que aportan algo aquí:

| Plugin | Para qué |
| --- | --- |
| `superpowers` | Flujos de trabajo: brainstorming, depuración sistemática, TDD, revisión |
| `typescript-lsp` | Navegación y diagnósticos de TypeScript |
| `security-guidance` / `claude-security` | Revisión de seguridad — relevante con datos de estudiantes reales |

### Skills

Las skills son **compartidas** entre Claude Code y OpenCode: una sola copia en
`.agents/skills/`, enlazada desde `.claude/skills/` y `.opencode/skills`.

**A qué agentes instalarlas lo decide cada persona.** El CLI lo pregunta al instalar —junto con
el método: enlaces simbólicos a una copia canónica en `.agents/skills/`, o copias independientes
por agente—. Quien solo use Claude Code no necesita las de OpenCode, y al revés.

Por eso **ni los cuerpos ni los enlaces se versionan** (están en `.gitignore`); lo único
versionado es `skills-lock.json`, con el origen y el hash de cada skill. De ahí:

```bash
bash scripts/sync-skills.sh          # restaura lo del lockfile; el CLI te pregunta
bash scripts/sync-skills.sh -a claude-code -y   # sin preguntas: opciones reenviadas al CLI
bash scripts/sync-skills.sh --list   # qué hay registrado, sin instalar

# Añadir una skill (actualiza el lockfile automáticamente)
npx skills add <owner/repo> --skill <nombre>
```

Nunca añadas una skill copiando archivos a mano: el lockfile quedaría desincronizado.

#### Skills instaladas

`skills-lock.json` registra 14 skills. Se instalan de golpe en un clon nuevo con
`bash scripts/sync-skills.sh` (el CLI te preguntará a qué agentes).

| Skill | Origen | Para qué aquí |
| --- | --- | --- |
| `frontend-design` | `anthropics/skills` | Criterio visual al construir interfaz. Como skill —y no solo como plugin de Claude Code— la aprovechan también OpenCode y Antigravity |
| `architecture` | `anthropics/knowledge-work-plugins` | Registrar decisiones como ADR |
| `code-review` | `mattpocock/skills` | Revisión contra las convenciones del repo |
| `codebase-design`, `domain-modeling` | `mattpocock/skills` | Diseñar módulos y vocabulario del dominio |
| `improve-codebase-architecture` | `mattpocock/skills` | Detectar abstracciones pobres |
| `grilling` | `mattpocock/skills` | Cuestionar un plan antes de implementarlo |
| `refactor` | `github/awesome-copilot` | Mejoras graduales sin cambiar comportamiento |
| `postgresql-optimization` | `github/awesome-copilot` | Supabase **es** PostgreSQL: índices, consultas y RLS |
| `multi-stage-dockerfile` | `github/awesome-copilot` | Imagen de desarrollo |
| `owasp-security` | `hoodini/ai-agents-skills` | Datos de estudiantes reales |
| `security-audit` | `cloudflare/security-audit-skill` | Auditoría antes de exponer la app |
| `typescript-advanced-types` | `wshobson/agents` | Tipos generados de Supabase |
| `browser-testing-with-devtools` | `addyosmani/agent-skills` | Solo cuando se pida probar en navegador |

> El repositorio de `owasp-security` es grande y su clon puede superar el límite del CLI. Si
> falla: `SKILLS_CLONE_TIMEOUT_MS=900000 bash scripts/sync-skills.sh`.

Sin cubrir todavía: **React moderno, Tailwind v4 y Vite/PWA**. Hay que buscar si existen en el
ecosistema antes de escribirlas a mano.

Propias de UniLink (a escribir):

| Skill | Qué resolvería | Por qué importa |
| --- | --- | --- |
| `unilink-correo-institucional` | Cómo tocar la validación `al<6 dígitos>@edu.uaa.mx`: definición única, dónde se aplica (input, esquema, base de datos, pruebas) y casos límite | Es la regla que decide quién entra a la app; duplicar la expresión regular en tres sitios es el fallo silencioso más caro del MVP |
| `unilink-supabase-migracion` | Añadir una tabla: migración, DDL, **RLS con sus políticas**, tipos generados, verificación | Sin backend propio, la RLS *es* la seguridad. Una tabla sin políticas expone datos reales |
| `unilink-pwa-instalable` | Manifest, iconos, service worker, `beforeinstallprompt` en Android/PC y el flujo manual de iOS | Requisito explícito del producto y área llena de trampas por plataforma |
| `unilink-componente-react-tailwind` | Plantilla de componente: ubicación, nombres, idioma, Tailwind, `id`/`aria-label`, prueba | Mantiene coherencia cuando varias personas y agentes generan pantallas en paralelo |
| `unilink-verificacion` | El checklist de cierre y cómo leer el informe de Sonar | Evita dar por terminada una funcionalidad que rompe CI |
| `unilink-commit-y-pr` | Conventional Commits con los alcances del proyecto y qué job falla ante qué error | Los hooks rechazan commits mal formados; ahorra prueba y error |
| `unilink-modelo-gustos` *(opcional)* | Modelar "3 gustos por categoría" de forma que admita APIs externas sin migrar datos | Única decisión de modelado del MVP con coste real si se hace mal |

## 5. Editor

Al abrir el proyecto, VSCode ofrecerá las extensiones recomendadas
([`.vscode/extensions.json`](../.vscode/extensions.json)). Acéptalas: los ajustes del proyecto
dan por hecho que ESLint, Prettier y Tailwind IntelliSense están activos, y con
`source.fixAll.eslint` al guardar, tanto tú como los agentes corregís el lint sin pasos extra.

Para SonarQube for IDE, conéctalo a SonarCloud desde la extensión y descomenta
`sonarlint.connectedMode.project` en [`.vscode/settings.json`](../.vscode/settings.json) con la
clave del proyecto: así ves en el editor exactamente lo mismo que marcará el CI.
