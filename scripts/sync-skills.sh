#!/usr/bin/env bash
# ==============================================================================
# sync-skills.sh — restaura las skills de los agentes desde skills-lock.json
# ==============================================================================
# Los cuerpos de las skills NO se versionan, ni los enlaces que crea el CLI:
# solo se versiona skills-lock.json, que guarda de dónde viene cada skill y su
# hash. Este script las reinstala en un clon nuevo.
#
# **Cada dev elige sus agentes.** El script no impone ninguno: `npx skills`
# pregunta a qué agentes instalar (Claude Code, OpenCode, Antigravity…) y con
# qué método (enlace simbólico o copia). Quien prefiera no contestar cada vez
# puede pasar las opciones del CLI directamente a este script.
#
# Uso:
#   bash scripts/sync-skills.sh                     # interactivo: elige tú
#   bash scripts/sync-skills.sh -a claude-code -y   # sin preguntas
#   bash scripts/sync-skills.sh --list              # qué instalaría, sin instalar
#
# Añadir una skill nueva (actualiza el lockfile por sí solo):
#   npx skills add <owner/repo> --skill <nombre>
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK="${ROOT_DIR}/skills-lock.json"

cd "${ROOT_DIR}"

if [ ! -f "${LOCK}" ]; then
  echo "ERROR: no existe skills-lock.json" >&2
  exit 1
fi

if ! command -v python3 > /dev/null 2>&1; then
  echo "ERROR: se requiere python3 para leer el lockfile." >&2
  exit 1
fi

# Cada línea: "<nombre>\t<origen>"
mapfile -t ENTRADAS < <(python3 - "${LOCK}" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as fh:
    lock = json.load(fh)
for nombre, datos in sorted(lock.get("skills", {}).items()):
    print(f"{nombre}\t{datos.get('source', '')}")
PY
)

if [ "${#ENTRADAS[@]}" -eq 0 ]; then
  cat <<'VACIO'
El lockfile no tiene ninguna skill registrada todavía.

Las skills del proyecto están propuestas en docs/00_ONBOARDING.md, pendientes de
validar por el equipo. Para instalar una:

  npx skills add <owner/repo> --skill <nombre>

El CLI te preguntará a qué agentes instalarla y si prefieres enlaces o copias, y
escribirá la entrada en skills-lock.json. Commitea ese archivo; los cuerpos y los
enlaces están ignorados a propósito.
VACIO
  exit 0
fi

if [[ "${1:-}" == "--list" ]]; then
  printf '%s\n' "${ENTRADAS[@]}" | column -t -s "$(printf '\t')"
  exit 0
fi

# Todo lo que se pase a este script se reenvía tal cual a `npx skills add`
# (por ejemplo: -a claude-code -a opencode -y).
OPCIONES_CLI=("$@")

if [ "${#OPCIONES_CLI[@]}" -eq 0 ]; then
  echo "El CLI preguntará a qué agentes instalar cada skill."
  echo "Para evitarlo: bash scripts/sync-skills.sh -a <agente> -y"
  echo
fi

for entrada in "${ENTRADAS[@]}"; do
  nombre="${entrada%%$'\t'*}"
  origen="${entrada#*$'\t'}"
  if [ -z "${origen}" ]; then
    echo "AVISO: la skill '${nombre}' no declara origen; se omite." >&2
    continue
  fi
  echo "--> ${nombre} (${origen})"
  npx --yes skills add "${origen}" --skill "${nombre}" "${OPCIONES_CLI[@]}"
done

echo "OK: skills sincronizadas. Revisa 'git diff skills-lock.json' por si cambió algún hash."
