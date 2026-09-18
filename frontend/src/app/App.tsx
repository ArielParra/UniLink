/**
 * Cascarón de la aplicación.
 *
 * Placeholder deliberado: existe para que Vite tenga un punto de entrada real y
 * el checklist de verificación pueda ejecutarse. Se sustituye por el enrutado y
 * las pantallas en la sesión de implementación.
 */
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-5 px-6 py-12">
      <h1 className="text-marca-700 text-4xl font-bold tracking-tight">UniLink</h1>

      <p className="text-texto-suave text-lg">
        Conecta con estudiantes de tu universidad a partir de intereses en común.
      </p>

      <p className="border-borde bg-superficie-2 text-texto-suave rounded-lg border p-4 text-sm">
        Esqueleto del proyecto: todavía no hay funcionalidad. Las convenciones y el punto de
        partida están en <code className="font-mono">docs/00_ONBOARDING.md</code>.
      </p>
    </main>
  );
}
