# frontend — aplicación web de UniLink

React + Vite + TypeScript + Tailwind CSS v4, instalable como PWA.

**En Vercel, `Root Directory` debe ser `frontend`.**

```bash
npm install        # primera vez: genera package-lock.json (commitéalo)
npm run dev        # http://localhost:5173
npm run lint       # debe reportar 0 problemas
npm run typecheck
npm test
npm run build && npm run preview   # única forma de probar la PWA de verdad
```

Antes de arrancar, copia `.env.example` a `.env` y complétalo con los valores que imprime
`supabase start` (ver `../supabase/README.md`).

La estructura de `src/` y las convenciones están en
[`../.agents/rules/structure.md`](../.agents/rules/structure.md).
