# 02 · Convenciones

> Este documento **resume y ejemplifica**. La definición normativa vive en
> [`.agents/AGENTS.md`](../.agents/AGENTS.md) y [`.agents/rules/structure.md`](../.agents/rules/structure.md),
> que es lo que leen las herramientas de IA. Si hay discrepancia, manda `.agents/`.

## Idioma

El idioma de un nombre lo decide **qué es**, no dónde vive.

| Va en español | Va en inglés |
| --- | --- |
| Entidades y campos de dominio: `perfil`, `gustos`, `centroUniversitario` | Mecánica genérica: `useDebounce`, `buildQuery`, `formatDate` |
| Tablas y columnas: `perfiles`, `centro_universitario` | Variables de control de flujo: `index`, `result`, `retries` |
| Textos de UI y mensajes de error | Infraestructura: clientes, hooks técnicos, utilidades |

Los booleanos usan siempre `is`/`has`, incluso sobre campos de dominio:

```ts
// bien
const isVerificado = perfil.correoConfirmado !== null;
interface Perfil { nombre: string; centroUniversitario: CentroUniversitario; isActivo: boolean }

// mal
const esVerificado = ...;
interface Perfil { tieneFoto: boolean }
```

Sin i18n: un único locale español, sin infraestructura de traducción.

## Nombres de archivo

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Carpetas | `kebab-case` | `features/registro/` |
| Componentes | `PascalCase` | `TarjetaPerfil.tsx` |
| Hooks | `camelCase` con `use` | `usePerfilActual.ts` |
| Utilidades y esquemas | `kebab-case` | `correo-institucional.ts` |
| Pruebas | igual + `.test` | `correo-institucional.test.ts` |

> **Si vienes de Angular:** el equivalente de los `.spec.ts` que genera el CLI de Angular son
> aquí los `.test.ts(x)`. React no tiene un generador que los cree, así que el archivo se
> escribe a mano junto al que prueba. Vitest reconoce `.test` y `.spec` indistintamente; el
> proyecto usa **`.test`** para no acabar con dos convenciones conviviendo.

## Commits

**Conventional Commits**, validados por el hook `commit-msg`. Un commit mal formado se rechaza
antes de crearse.

```
<tipo>(<alcance>): <descripción en imperativo, minúscula, sin punto final>
```

| Tipos | `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert` |
| --- | --- |
| **Alcances** | `auth` `perfil` `gustos` `descubrir` `pwa` `ui` `db` `ci` `docs` `deps` `agents` |

El verbo va en **infinitivo**, en minúscula y sin punto final:

```
feat(perfil): agregar selector de centro universitario
fix(auth): rechazar correos con más de 6 dígitos
chore(deps): actualizar vite a 7.4
docs(agents): aclarar la regla de idioma para booleanos
```

`agregar`, no `agrega` ni `agregado`. La regla completa —cuerpo, viñetas por área, cambios que
rompen compatibilidad— está en [`.agents/AGENTS.md`](../.agents/AGENTS.md#convenciones-de-commits),
y `.gitmessage` la tiene resumida como plantilla al escribir el commit.

## Ramas y PRs

- **`main`** está protegida y no acepta push directo. **`dev`** es la rama de integración y la
  que se usa a diario.
- Ramas de trabajo: `<tipo>/<descripción-corta>` — `feat/registro-correo`, `fix/manifest-ios`.
  Salen de `dev` y vuelven a `dev`.
- Cuando `dev` está listo, se abre una PR `dev → main`. Ahí los checks `calidad` y `seguridad`
  son obligatorios.
- Una PR por unidad de trabajo con sentido propio; la plantilla incluye el checklist.
- El CI corre en push a `dev` (feedback rápido) y en la PR hacia `main` (la puerta real).
- **Los agentes de IA no commitean ni hacen push.** Es una regla dura del proyecto: dejan los
  cambios en el árbol de trabajo y la persona decide.

## Código

- Prohibido `any`, y prohibido silenciarlo con `eslint-disable`. Si el tipo no se conoce,
  `unknown` y se estrecha.
- Componentes de función con hooks; nada de componentes de clase.
- El feedback al usuario nunca es `alert()` ni `console.log`.
- El estilo se escribe con clases de Tailwind. Los tokens (colores, espaciados) se declaran una
  sola vez en `frontend/src/styles/index.css`. Si una combinación se repite tres veces, se
  extrae a un componente, no a una clase CSS nueva.
- Todo input, select y botón lleva `id` y `aria-label`: sirve para accesibilidad y para las
  pruebas.
- Nada de opciones de catálogo escritas a mano en un componente: se derivan de la definición
  única (base de datos + tipos generados).

## Documentación

- Los patrones nuevos se documentan en `.agents/rules/structure.md` **en el mismo cambio** que
  los introduce.
- Las decisiones con alternativas reales se registran como ADR en [`adr/`](adr/), usando
  [`adr/000-plantilla.md`](adr/000-plantilla.md).
