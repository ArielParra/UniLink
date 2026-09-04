#!/usr/bin/env bash
# ==============================================================================
# sync-agents.sh — propaga la fuente canónica de instrucciones a la raíz
# ==============================================================================
# `.agents/AGENTS.md` es la única definición de las reglas del proyecto.
# Antigravity (y cualquier herramienta que siga la convención AGENTS.md) lee la
# copia de la raíz, así que ambas deben ser idénticas.
#
# Uso:
#   bash scripts/sync-agents.sh          # copia .agents/AGENTS.md -> AGENTS.md
#   bash scripts/sync-agents.sh --check  # falla si difieren (lo usa pre-commit)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANONICO="${ROOT_DIR}/.agents/AGENTS.md"
COPIA="${ROOT_DIR}/AGENTS.md"

if [ ! -f "${CANONICO}" ]; then
  echo "ERROR: no existe ${CANONICO}" >&2
  exit 1
fi

if [[ "${1:-}" == "--check" ]]; then
  if diff -q "${CANONICO}" "${COPIA}" > /dev/null 2>&1; then
    echo "OK: AGENTS.md coincide con .agents/AGENTS.md"
    exit 0
  fi
  echo "ERROR: AGENTS.md difiere de .agents/AGENTS.md (la fuente canónica)." >&2
  echo "       Edita .agents/AGENTS.md y ejecuta: bash scripts/sync-agents.sh" >&2
  diff "${CANONICO}" "${COPIA}" >&2 || true
  exit 1
fi

cp "${CANONICO}" "${COPIA}"
echo "OK: AGENTS.md actualizado desde .agents/AGENTS.md"
