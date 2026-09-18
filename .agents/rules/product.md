---
trigger: always_on
---

# UniLink — Producto y dominio

Aplicación para que estudiantes de una misma universidad se conecten entre sí a partir de
intereses en común. Público inicial: alumnado de la Universidad Autónoma de Aguascalientes
(UAA), identificado por su correo institucional.

## Alcance del MVP

| Bloque | Qué entra | Qué NO entra todavía |
| --- | --- | --- |
| Registro | Alta con correo institucional `al<6 dígitos>@edu.uaa.mx` y verificación de que el correo es real | Recuperación de cuenta avanzada, invitaciones |
| Perfil | Nombre, foto de perfil, centro universitario, gustos por categoría (3 por categoría) | Biografía larga, enlaces a redes, verificación de identidad |
| Descubrimiento | Encontrar personas con gustos en común | Chat, grupos, eventos, notificaciones push |
| PWA | Instalable; tutorial de instalación por plataforma | Modo offline completo, sincronización en segundo plano |

**Fuera de alcance explícito del MVP:** mensajería, moderación automatizada, panel de
administración, aplicación nativa.

## Reglas de dominio

### Correo institucional

El formato aceptado es `al` seguido de **exactamente 6 dígitos**, seguido de `@edu.uaa.mx`
(por ejemplo `al123456@edu.uaa.mx`). Es la única puerta de entrada: define quién es
estudiante de la universidad y, por tanto, quién puede usar la aplicación.

Dos comprobaciones distintas que no hay que confundir:

1. **Formato** — que el correo tenga la forma correcta. Se valida en el cliente (para dar
   feedback inmediato) y **también** del lado de Supabase, que es donde la regla se vuelve
   obligatoria.
2. **Titularidad** — que la persona posea de verdad ese buzón. Es lo que resuelve el correo de
   verificación o el proveedor de identidad.

El mecanismo concreto de verificación (correo de Supabase vs. Google OAuth restringido al
dominio) está **sin decidir**: ver `docs/adr/001-verificacion-correo-institucional.md`.

### Gustos por categoría

Cada persona registra **3 gustos por categoría** (música, cine, deportes, etc.). En el MVP los
gustos son texto o selección simple, pero el modelo de datos debe permitir que más adelante un
gusto provenga de una API externa (Spotify, TMDB…) sin migrar los datos existentes: un gusto
guarda de qué categoría es, cómo se muestra y —opcionalmente— de qué fuente externa procede y
con qué identificador.

### Centro universitario

La UAA se organiza en centros académicos. Es un **catálogo cerrado**: se modela como conjunto
de valores restringidos, nunca como texto libre. Un campo de catálogo se define en un único
lugar y se propaga a la base de datos (con su restricción) y al frontend (con sus etiquetas
legibles) — nunca se escribe a mano un arreglo de opciones dentro de un componente.

## Glosario (español → inglés)

| Español | Inglés | Notas |
| --- | --- | --- |
| perfil | profile | Datos públicos de una persona dentro de la app |
| gusto / interés | interest | Elemento concreto dentro de una categoría |
| categoría | category | Agrupador de gustos (música, cine, deportes…) |
| centro universitario | academic center | Catálogo cerrado de la UAA |
| correo institucional | institutional email | `al<6 dígitos>@edu.uaa.mx` |
| coincidencia / afinidad | match / affinity | Gustos compartidos entre dos perfiles |
| estudiante | student | Persona usuaria de la app |

## Restricciones transversales

- **Datos de personas reales.** Son estudiantes identificables: correo institucional, nombre y
  fotografía. Cada tabla nueva empieza por decidir quién puede leerla, y esa decisión se escribe
  como política de RLS, no como filtro en el cliente.
- **Sin i18n.** Un único locale español.
- **Accesibilidad.** Los controles llevan `id` y `aria-label`; el contraste y el foco visible no
  son opcionales.
- **Móvil primero.** La mayoría del uso será desde el teléfono; el escritorio invita a instalar
  la app desde el móvil.
