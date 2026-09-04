#!/usr/bin/env bash
# Ejecuta ESLint sobre la aplicación web. Lo invoca el hook `frontend-lint`
# de pre-commit y puede ejecutarse a mano desde la raíz del repositorio.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [ ! -d "frontend/node_modules" ]; then
  echo "AVISO: frontend/node_modules no existe; el análisis se omite."
  echo "       Ejecuta 'cd frontend && npm install' para activarlo."
  exit 0
fi

cd frontend
npm run lint
