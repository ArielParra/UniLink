# supabase — esquema, migraciones y stack local

Toda la persistencia, la autenticación y el almacenamiento de UniLink viven aquí. **No hay
backend propio**, así que las políticas de RLS de esta carpeta son la única frontera real de
seguridad de los datos: una regla aplicada solo en el cliente es una sugerencia.

## Puesta en marcha local

```bash
supabase start     # arranca PostgreSQL, Auth, Storage y Studio en contenedores
supabase status    # muestra API URL y anon key -> cópialas a frontend/.env
supabase stop
```

## Trabajar con el esquema

```bash
supabase migration new <nombre>   # crea supabase/migrations/<fecha>_<nombre>.sql
supabase db reset                 # recrea la BD aplicando todas las migraciones + seed.sql
supabase gen types typescript --local > ../frontend/src/lib/database.types.ts
```

## Reglas para cada migración

1. Toda tabla nueva se crea **con `ENABLE ROW LEVEL SECURITY` y sus políticas en la misma
   migración**. Sin políticas, la tabla queda inaccesible (o peor, accesible) sin que nadie
   lo note hasta producción.
2. Los campos de catálogo (centro universitario, categoría de gusto) llevan su restricción en
   la base de datos; no son texto libre.
3. Las migraciones no se editan una vez aplicadas en un entorno compartido: se corrigen con una
   migración nueva.
4. Tras cambiar el esquema, regenera los tipos y commitea el resultado.
5. `supabase db reset` que termina bien prueba que la migración **aplica**, no que las políticas
   sean correctas. Pruébalas explícitamente con distintos usuarios.

## Qué no va aquí

Ninguna credencial. `config.toml` se versiona; `supabase/.env` y las claves de servicio, no.
