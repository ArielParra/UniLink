# ADR-001 · Verificación del correo institucional

- **Estado:** propuesta — **decisión abierta, hay que cerrarla antes de implementar el registro**
- **Fecha:** 2026-09-03
- **Decide:** el equipo de UniLink

## Contexto

El acceso a UniLink está limitado a estudiantes de la UAA, identificados por un correo con el
formato `al<6 dígitos>@edu.uaa.mx`. Hay que distinguir dos comprobaciones que se confunden con
facilidad:

1. **Formato** — que el correo tenga esa forma. Es trivial y se resuelve con una validación,
   aplicada tanto en el cliente (feedback inmediato) como del lado de Supabase (obligatoriedad).
2. **Titularidad** — que la persona posea realmente ese buzón. Sin esto, cualquiera puede
   registrarse como `al000000@edu.uaa.mx`. Es lo que esta decisión tiene que resolver.

Restricciones: no hay backend propio; el MVP debe salir pronto; los datos son de estudiantes
reales, así que una cuenta falsa no es un problema teórico.

## Alternativas

### Opción A — Correo de verificación de Supabase Auth

Registro con correo y contraseña; Supabase envía el enlace de confirmación y la sesión no se
activa hasta que se pulsa. El dominio se restringe con una validación del lado del servidor
(hook de autenticación o restricción sobre la tabla de perfiles).

**A favor:** funciona con lo que ya está en el stack, sin dependencias externas; no requiere
que la universidad tenga nada configurado; el buzón local (Inbucket) permite probarlo sin
enviar correos de verdad.

**En contra:** el envío de correo por defecto de Supabase tiene límites bajos y no sirve para
producción — hay que configurar un SMTP propio (Resend, SendGrid…), lo que añade una cuenta,
un dominio verificado y un coste. Los correos de verificación caen en spam con facilidad, y en
un dominio institucional eso puede significar que no lleguen. Hay que gestionar contraseñas
(recuperación incluida).

### Opción B — Google OAuth restringido al dominio

Si el correo institucional de la UAA es Google Workspace, se inicia sesión con Google y se
aceptan únicamente las cuentas cuyo correo pertenezca a `edu.uaa.mx`.

**A favor:** la titularidad la garantiza Google, sin correos que puedan perderse; sin
contraseñas que gestionar ni recuperar; menos fricción en el registro (un toque) y menos
superficie de ataque.

**En contra:** **depende de que el correo institucional sea efectivamente Google Workspace** —
si es Microsoft 365, esta opción se convierte en Azure AD y cambia el proveedor. Requiere dar
de alta la aplicación en Google Cloud. La restricción de dominio hay que aplicarla igualmente
del lado del servidor: el parámetro `hd` de Google es una sugerencia de interfaz, no una
garantía, y confiar solo en él es un fallo de seguridad conocido.

### Opción C — Ambas

Google como camino principal y correo con contraseña como alternativa.

**A favor:** cubre a quien no pueda usar Google. **En contra:** dos flujos de registro, dos
caminos de recuperación y el doble de superficie que probar, en un MVP.

## Qué hay que averiguar antes de decidir

1. **¿El correo `@edu.uaa.mx` es Google Workspace o Microsoft 365?** Es el dato que decide.
2. ¿Los correos automáticos de remitentes externos llegan a las bandejas institucionales o los
   filtra el servidor de la universidad?
3. ¿El proyecto puede permitirse un servicio de envío de correo (dominio propio incluido)?

## Decisión

Pendiente.

## Consecuencias (comunes a cualquier opción)

- La restricción de dominio **debe aplicarse del lado de Supabase**, nunca solo en el cliente:
  una validación en un input no impide un `signUp` hecho con una petición directa.
- El formato se define una sola vez en `frontend/src/lib/auth/correo-institucional.ts` y se
  reutiliza desde la UI, el esquema de validación y la comprobación del servidor.
- Cambiar de opción más adelante afecta a las cuentas ya creadas: migrar de contraseña a OAuth
  (o al revés) sobre usuarios existentes es un trabajo con aristas. Conviene cerrar esta
  decisión **antes** de que haya usuarios reales.
