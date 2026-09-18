---
trigger: always_on
---

# UniLink — Estructura y convenciones de código

```text
UniLink/
├── .agents/                 # Fuente canónica de instrucciones para agentes
│   ├── AGENTS.md
│   ├── rules/{product,tech,structure}.md
│   └── skills/              # ignorado por git — lo crea `npx skills`, no se versiona
├── .claude/                 # settings.json de proyecto (+ skills, ignoradas)
├── .opencode/               # opencode.json está en la raíz (+ skills, ignoradas)
├── .devcontainer/           # entorno reproducible opcional
├── .github/                 # workflows, dependabot, plantilla de PR
├── .vscode/                 # extensiones recomendadas y ajustes del editor
├── docs/                    # documentación del equipo + ADRs
├── frontend/                # la aplicación web (raíz del proyecto en Vercel)
│   ├── public/              # estáticos servidos tal cual (iconos, manifest)
│   └── src/
│       ├── app/             # entrada, router, providers globales
│       ├── features/        # una carpeta por área funcional
│       ├── components/      # UI compartida entre features
│       ├── hooks/           # hooks reutilizables
│       ├── lib/             # cliente de Supabase, validación, utilidades
│       └── styles/          # index.css: Tailwind + tokens del tema
├── supabase/                # config, migraciones y seed
├── scripts/                 # utilidades del repositorio
├── AGENTS.md                # copia de .agents/AGENTS.md (Antigravity)
├── CLAUDE.md                # puntero + specifics de Claude Code
└── skills-lock.json         # origen y hash de cada skill instalada
```

## Dónde va cada cosa

| Si estás escribiendo… | Va en… |
| --- | --- |
| Una pantalla o flujo completo (registro, perfil, descubrir) | `src/features/<area>/` |
| Un componente que usan dos o más features | `src/components/` |
| Un componente que usa una sola feature | dentro de esa feature |
| Un hook atado a una feature | `src/features/<area>/hooks/` |
| Un hook genérico | `src/hooks/` |
| Acceso a datos de Supabase | `src/features/<area>/api/` (o `src/lib/` si es transversal) |
| Validación de un formulario | junto al formulario; el esquema Zod se exporta si lo comparte la capa de datos |
| Reglas de dominio reutilizables (p. ej. el correo institucional) | `src/lib/<dominio>/` |
| Tipos de la base de datos | `src/lib/database.types.ts` — **generado, no editar** |

Regla práctica: **algo empieza dentro de su feature y se promueve a `components/`, `hooks/` o
`lib/` en el momento en que un segundo consumidor lo necesita**, no antes.

## Nombres

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Carpetas | `kebab-case` | `features/registro/`, `lib/auth/` |
| Componentes React (archivo y símbolo) | `PascalCase` | `TarjetaPerfil.tsx` → `TarjetaPerfil` |
| Hooks | `camelCase` con prefijo `use` | `usePerfilActual.ts` |
| Utilidades, tipos, esquemas | `kebab-case` para el archivo | `correo-institucional.ts` |
| Pruebas | mismo nombre + `.test` | `correo-institucional.test.ts` |
| Tablas y columnas | `snake_case`, en español | `perfiles`, `centro_universitario` |
| Migraciones | las nombra el CLI | `20260903120000_crea_perfiles.sql` |

El idioma se decide por lo que el símbolo *es*, no por dónde vive: `TarjetaPerfil`,
`useGustosPorCategoria`, `centroUniversitario` (dominio, español) conviven con `useDebounce`,
`buildQuery`, `isLoading`, `hasError` (mecánica, inglés). Los booleanos siempre `is`/`has`,
incluso sobre campos de dominio: `isVerificado`.

## Componentes

- Solo componentes de función. Props tipadas con una interfaz explícita; nada de `any`.
- Un componente por archivo; el archivo se llama como el componente.
- El estado del servidor se lee mediante los hooks de datos de la feature, no con
  `useEffect` + `fetch` disperso por la UI.
- Cada input, select y botón lleva `id` y `aria-label`.
- El estilo se escribe con clases de Tailwind. Si una combinación se repite tres veces, se
  extrae a un componente, no a una clase CSS nueva.

## Datos y Supabase

- Un único cliente de Supabase, creado en `src/lib/supabase.ts` y reutilizado; no se instancia
  dentro de componentes.
- Toda tabla nueva se crea en una migración con `ENABLE ROW LEVEL SECURITY` y sus políticas en
  la misma migración.
- Los campos de catálogo (centro universitario, categoría de gusto) se definen con su
  restricción en la base de datos y se derivan al frontend desde los tipos generados; **está
  prohibido escribir a mano el arreglo de opciones en un componente**. Las etiquetas legibles
  viven en un único módulo de catálogos.
- Tras cambiar el esquema: `supabase gen types typescript --local > frontend/src/lib/database.types.ts`.

## Pruebas

- Junto al archivo que prueban, con la extensión **`.test.ts(x)`** — no `.spec`. Es el
  equivalente aquí de los `.spec.ts` que genera el CLI de Angular: React no tiene generador que
  los cree, así que la convención la fija este documento. Vitest reconoce ambos sufijos; el
  proyecto usa uno solo para que no convivan dos.
- Prioridad del MVP: reglas de dominio puras (formato del correo, cálculo de afinidad) y los
  componentes con lógica condicional real. No se persigue cobertura por cobertura.

## Documentar los patrones nuevos

Este proyecto arranca vacío a propósito. Cuando establezcas un patrón que el resto deba seguir
—cómo se leen datos, cómo se notifica al usuario, cómo se estructura un formulario— **añádelo a
este archivo en el mismo cambio que lo introduce**. Una convención que solo existe en la cabeza
de quien la escribió deja de aplicarse en la segunda feature.
