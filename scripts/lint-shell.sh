#!/usr/bin/env bash
# Analiza los scripts de shell con ShellCheck.
#
# Usa el binario del sistema en vez de la imagen Docker del hook oficial: bajo
# podman con SELinux, montar el repositorio reetiqueta el árbol de trabajo
# (`container_file_t`) y las siguientes ejecuciones dejan de poder leer los
# archivos. En CI la comprobación se hace igualmente y sin excepciones.
set -euo pipefail

if ! command -v shellcheck > /dev/null 2>&1; then
  echo "AVISO: shellcheck no está instalado; el análisis se omite."
  echo "       Instálalo con: sudo dnf install ShellCheck  ·  sudo apt install shellcheck"
  echo "       (El pipeline lo comprueba de todos modos.)"
  exit 0
fi

exec shellcheck --severity=warning --exclude=SC1091 "$@"
