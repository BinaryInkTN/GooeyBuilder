#!/usr/bin/env bash
# GooeyGUI + GooeyBuilder Production Installer
# Safe, isolated, no system Python pollution

set -Eeuo pipefail

########################
# CONFIG
########################
APP_NAME="GooeyBuilder"
INSTALL_ROOT="$HOME/.local/share/gooey"
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

trap 'error "Installation failed. Check log: $LOG_FILE"' ERR

########################
# PRECHECKS
########################
info "Starting Gooey installation"

for cmd in python3 git curl; do
    command -v "$cmd" &>/dev/null || error "$cmd is required but not installed"
done

python3 - <<EOF
import sys
assert sys.version_info >= (3,8), "Python 3.8+ required"
EOF

success "System requirements OK"
########################
# CREATE VENV
########################
if [[ ! -d "$VENV_DIR" ]]; then
    info "Creating Python virtual environment"

    if ! python3 -m venv "$VENV_DIR"; then
        error "Failed to create virtual environment.
Please install python3-venv:
  sudo apt install python3-venv
(or equivalent for your distro)"
    fi
fi

if [[ ! -f "$VENV_DIR/bin/activate" ]]; then
    error "Virtual environment is corrupted or incomplete.
Try deleting:
  rm -rf $VENV_DIR
and re-running the installer."
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

pip install --upgrade pip setuptools wheel
success "Virtual environment ready"

########################
# INSTALL GooeyGUI
########################
info "Installing GooeyGUI"

TMP_DIR="$(mktemp -d)"
curl -fsSL "$INSTALLER_URL" -o "$TMP_DIR/installer.py"
python "$TMP_DIR/installer.py" || warn "GooeyGUI installer returned non-zero"

rm -rf "$TMP_DIR"

########################
# CLONE / UPDATE BUILDER
########################
if [[ -d "$BUILDER_DIR/.git" ]]; then
    info "Updating GooeyBuilder"
    git -C "$BUILDER_DIR" pull --ff-only
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
    pip install -r "$BUILDER_DIR/requirements.txt"
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
        [[ -f "$rc" ]] && echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$rc"
    done
    warn "Restart terminal or run: export PATH=\"\$PATH:$BIN_DIR\""
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
echo "Location:"
echo "  App:   $BUILDER_DIR"
echo "  Venv:  $VENV_DIR"
echo "  Bin:   $WRAPPER"
echo ""
echo "Run with:"
echo "  gbuilder"
