## Qué cambia

<!-- Una o dos frases. Si cierra un issue: "Cierra #123". -->

## Por qué

<!-- El problema o la necesidad que resuelve. -->

## Cómo probarlo

<!-- Pasos concretos para verlo funcionando. -->

## Comprobaciones

- [ ] `npm run lint` sin problemas
- [ ] `npm run typecheck` sin errores
- [ ] `npm test` en verde
- [ ] `npm run build` compila
- [ ] Si toqué migraciones: `supabase db reset` aplica y **las tablas nuevas tienen RLS con sus políticas**
- [ ] Si toqué la PWA: probado con `npm run build && npm run preview` (no solo en `dev`)
- [ ] Si cambié convenciones: actualicé `.agents/` y ejecuté `bash scripts/sync-agents.sh`
- [ ] Ningún secreto en el diff
