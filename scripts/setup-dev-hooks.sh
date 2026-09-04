#!/usr/bin/env bash
# ==============================================================================
# setup-dev-hooks.sh — instala los hooks de calidad y seguridad de UniLink
# ==============================================================================
# Registra en .git/hooks lo definido en .pre-commit-config.yaml.
# Uso:
#   bash scripts/setup-dev-hooks.sh          # instalar
#   bash scripts/setup-dev-hooks.sh --check  # solo validar la configuración
# ==============================================================================

set -euo pipefail

ROJO='\033[0;31m'
VERDE='\033[0;32m'
AMARILLO='\033[1;33m'
AZUL='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo -e "${AZUL}=== [UniLink] Hooks de calidad y seguridad (pre-commit) ===${NC}"

if [ ! -d ".git" ]; then
  echo -e "${ROJO}[ERROR] Este directorio no es la raíz de un repositorio Git.${NC}"
  exit 1
fi

if ! command -v pre-commit > /dev/null 2>&1; then
  echo -e "${AMARILLO}[AVISO] 'pre-commit' no está en el PATH.${NC}"
  if command -v pipx > /dev/null 2>&1; then
    echo -e "${AZUL}[INFO] Instalando con pipx...${NC}"
    pipx install pre-commit
  elif command -v pip3 > /dev/null 2>&1; then
    echo -e "${AZUL}[INFO] Instalando con pip3 --user...${NC}"
    pip3 install --user pre-commit
    export PATH="${HOME}/.local/bin:${PATH}"
  fi

  if ! command -v pre-commit > /dev/null 2>&1; then
    echo -e "${ROJO}[ERROR] No se pudo instalar 'pre-commit'. Instálalo manualmente:${NC}"
    echo "  pipx install pre-commit   ·   pip install pre-commit   ·   brew install pre-commit"
    exit 1
  fi
fi

echo -e "${VERDE}[OK] $(pre-commit --version)${NC}"

if [[ "${1:-}" == "--check" ]]; then
  pre-commit validate-config .pre-commit-config.yaml
  echo -e "${VERDE}[OK] .pre-commit-config.yaml es válido.${NC}"
  exit 0
fi

pre-commit install --install-hooks -t pre-commit -t commit-msg

# Plantilla de mensaje de commit: aparece al ejecutar `git commit` sin -m.
git config commit.template .gitmessage
echo -e "${VERDE}[OK] Plantilla de commit activada (.gitmessage)${NC}"

echo -e "${VERDE}=============================================================${NC}"
echo -e "${VERDE} Hooks instalados.${NC}"
echo -e "${VERDE}=============================================================${NC}"
echo -e "  Ejecutar todos manualmente: ${AMARILLO}pre-commit run --all-files${NC}"
echo -e "  Ejecutar uno concreto:      ${AMARILLO}pre-commit run gitleaks --all-files${NC}"
echo -e "  Actualizar versiones:       ${AMARILLO}pre-commit autoupdate${NC}"
