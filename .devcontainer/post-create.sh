#!/usr/bin/env bash
# ==============================================================================
# post-create.sh — se ejecuta una vez, al crear el devcontainer
# ==============================================================================
# Deja el entorno listo: dependencias de la web, CLI de Supabase y hooks de git.
# Ningún paso es imprescindible para que el contenedor arranque: si algo falla
# (por ejemplo, sin red), avisa y sigue en lugar de dejar el contenedor a medias.
# ==============================================================================

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}" || exit 1

echo "=== [UniLink] Preparando el devcontainer ==="

# --- 1. Dependencias de la aplicación web ---
echo "--> Instalando dependencias de frontend/"
if ! (cd frontend && npm ci); then
  echo "AVISO: 'npm ci' falló. Ejecuta 'cd frontend && npm install' a mano." >&2
fi

# --- 2. CLI de Supabase ---
# No se instala con npm global a propósito: Supabase distribuye binarios.
if command -v supabase > /dev/null 2>&1; then
  echo "--> Supabase CLI ya presente: $(supabase --version 2>/dev/null || echo desconocida)"
else
  echo "--> Instalando Supabase CLI"
  ARCH="$(dpkg --print-architecture)"
  URL="$(curl -fsSL https://api.github.com/repos/supabase/cli/releases/latest \
    | grep -o "https://[^\"]*_linux_${ARCH}\.deb" | head -1)"

  if [ -n "${URL}" ] && curl -fsSL "${URL}" -o /tmp/supabase.deb; then
    sudo dpkg -i /tmp/supabase.deb && rm -f /tmp/supabase.deb
    echo "--> Supabase CLI instalada: $(supabase --version 2>/dev/null || echo desconocida)"
  else
    echo "AVISO: no se pudo instalar la CLI de Supabase automáticamente." >&2
    echo "       Instálala siguiendo https://supabase.com/docs/guides/local-development" >&2
  fi
fi

# --- 3. ShellCheck (lo usa el hook de pre-commit) ---
if ! command -v shellcheck > /dev/null 2>&1; then
  echo "--> Instalando ShellCheck"
  sudo apt-get update -qq && sudo apt-get install -y -qq shellcheck \
    || echo "AVISO: ShellCheck no se instaló; el hook se omitirá con un aviso." >&2
fi

# --- 4. Hooks de calidad ---
echo "--> Instalando hooks de pre-commit"
bash scripts/setup-dev-hooks.sh || echo "AVISO: los hooks no quedaron instalados." >&2

# --- 5. Variables de entorno de la web ---
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "--> Creado frontend/.env desde la plantilla (hay que completarlo)"
fi

cat <<'FIN'

=== Listo ===
Siguientes pasos:
  supabase start            # levanta la base de datos local
  supabase status           # copia API URL y anon key a frontend/.env
  cd frontend && npm run dev

FIN
