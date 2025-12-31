#!/usr/bin/env bash
# GooeyGUI + GooeyBuilder Installer

set -Eeuo pipefail

########################
# CONFIG
########################
APP_NAME="GooeyBuilder"

XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
INSTALL_ROOT="$XDG_DATA_HOME/gooey"
BUILDER_DIR="$INSTALL_ROOT/GooeyBuilder"
VENV_DIR="$INSTALL_ROOT/venv"
BIN_DIR="$HOME/.local/bin"
WRAPPER="$BIN_DIR/gbuilder"
LOG_FILE="$INSTALL_ROOT/installer.log"

BUILDER_REPO="https://github.com/BinaryInkTN/GooeyBuilder.git"
INSTALLER_URL="https://raw.githubusercontent.com/BinaryInkTN/GooeyGUI/main/installer.py"

########################
# COLORS
########################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

########################
# LOGGING
########################
mkdir -p "$INSTALL_ROOT"
exec > >(tee -a "$LOG_FILE") 2>&1

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

trap 'echo -e "${RED}[ERROR]${NC} Installation failed. Check log: $LOG_FILE"' ERR

########################
# PRECHECKS
########################
info "Starting GooeyBuilder installation"

for cmd in python3 git curl; do
    command -v "$cmd" &>/dev/null || error "$cmd is required but not installed"
done

python3 - <<'EOF'
import sys
if sys.version_info < (3, 8):
    raise SystemExit("Python 3.8+ required")
EOF

success "System requirements OK"

########################
# CREATE VENV
########################
if [[ ! -d "$VENV_DIR" ]]; then
    info "Creating Python virtual environment"
    python3 -m venv "$VENV_DIR" || error "Failed to create virtual environment.
Install with:
  sudo apt install python3-venv"
fi

[[ -f "$VENV_DIR/bin/activate" ]] || error "Virtual environment corrupted.
Try:
  rm -rf $VENV_DIR"

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

command -v python >/dev/null || error "Python missing inside venv"

python -m pip install --upgrade pip setuptools wheel
success "Virtual environment ready"

########################
# INSTALL GooeyGUI
########################
info "Installing GooeyGUI"

TMP_DIR="$(mktemp -d)"
curl -fsSL "$INSTALLER_URL" -o "$TMP_DIR/installer.py"

[[ -s "$TMP_DIR/installer.py" ]] || error "Failed to download GooeyGUI installer"

python "$TMP_DIR/installer.py" || warn "GooeyGUI installer returned non-zero"

rm -rf "$TMP_DIR"

########################
# CLONE / UPDATE BUILDER
########################
if [[ -d "$BUILDER_DIR/.git" ]]; then
    info "Updating GooeyBuilder"
    git -C "$BUILDER_DIR" fetch origin
    git -C "$BUILDER_DIR" reset --hard origin/main
else
    info "Cloning GooeyBuilder"
    git clone "$BUILDER_REPO" "$BUILDER_DIR"
fi

[[ -f "$BUILDER_DIR/main.py" ]] || error "main.py missing in GooeyBuilder"

########################
# INSTALL DEPENDENCIES
########################
if [[ -f "$BUILDER_DIR/requirements.txt" ]]; then
    info "Installing Python dependencies"
    python -m pip install -r "$BUILDER_DIR/requirements.txt"
else
    warn "No requirements.txt found"
fi

########################
# CREATE LAUNCHER
########################
info "Creating gbuilder command"

mkdir -p "$BIN_DIR"

cat > "$WRAPPER" <<EOF
#!/usr/bin/env bash
set -e
source "$VENV_DIR/bin/activate"
exec python "$BUILDER_DIR/main.py" "\$@"
EOF

chmod +x "$WRAPPER"

########################
# PATH CHECK
########################
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    warn "$BIN_DIR not in PATH"

    for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
        [[ -f "$rc" ]] || continue
        grep -qxF "export PATH=\"\$PATH:$BIN_DIR\"" "$rc" || \
            echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$rc"
    done

    warn "Restart terminal or run:"
    warn "  export PATH=\"\$PATH:$BIN_DIR\""
fi

########################
# FINAL TEST
########################
command -v gbuilder &>/dev/null \
    && success "gbuilder installed successfully" \
    || warn "gbuilder not found in PATH yet"

########################
# DONE
########################
success "Installation complete"

echo ""
echo "Installed locations:"
echo "  App:   $BUILDER_DIR"
echo "  Venv:  $VENV_DIR"
echo "  Bin:   $WRAPPER"
echo ""
echo "Run with:"
echo "  gbuilder"
