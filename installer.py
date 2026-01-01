#!/usr/bin/env python3
"""
GooeyGUI + GooeyBuilder Python Installer
"""

import os
import sys
import subprocess
import shutil
import tempfile
import venv
from pathlib import Path
from datetime import datetime

# ========================
# CONFIG
# ========================

APP_NAME = "GooeyBuilder"

HOME = Path.home()
XDG_DATA_HOME = Path(os.environ.get("XDG_DATA_HOME", HOME / ".local" / "share"))

INSTALL_ROOT = XDG_DATA_HOME / "gooey"
BUILDER_DIR = INSTALL_ROOT / "GooeyBuilder"
VENV_DIR = INSTALL_ROOT / "venv"
BIN_DIR = HOME / ".local" / "bin"
WRAPPER = BIN_DIR / "gbuilder"
LOG_FILE = INSTALL_ROOT / "installer.log"

BUILDER_REPO = "https://github.com/BinaryInkTN/GooeyBuilder.git"
INSTALLER_URL = "https://raw.githubusercontent.com/BinaryInkTN/GooeyGUI/main/installer.py"

# ========================
# COLORS
# ========================

RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
NC = "\033[0m"

# ========================
# LOGGING
# ========================

INSTALL_ROOT.mkdir(parents=True, exist_ok=True)
LOG_FH = open(LOG_FILE, "a", encoding="utf-8")

def log(msg: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    LOG_FH.write(f"[{timestamp}] {msg}\n")
    LOG_FH.flush()

def info(msg):    print(f"{BLUE}[INFO]{NC} {msg}");    log(f"INFO: {msg}")
def success(msg): print(f"{GREEN}[OK]{NC} {msg}");      log(f"OK: {msg}")
def warn(msg):    print(f"{YELLOW}[WARN]{NC} {msg}");   log(f"WARN: {msg}")
def error(msg):
    print(f"{RED}[ERROR]{NC} {msg}")
    log(f"ERROR: {msg}")
    sys.exit(1)

# ========================
# UTILS
# ========================

def run(cmd, cwd=None, check=True):
    log(f"RUN: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if check and result.returncode != 0:
        error(f"Command failed: {' '.join(cmd)}")
    return result.returncode

def which(cmd):
    return shutil.which(cmd) is not None

# ========================
# PRECHECKS
# ========================

info("Starting GooeyBuilder installation")

for cmd in ("python3", "git", "curl"):
    if not which(cmd):
        error(f"{cmd} is required but not installed")

if sys.version_info < (3, 8):
    error("Python 3.8+ required")

success("System requirements OK")

# ========================
# CREATE VENV
# ========================

if not VENV_DIR.exists():
    info("Creating Python virtual environment")
    try:
        venv.EnvBuilder(with_pip=True).create(VENV_DIR)
    except Exception:
        error(
            "Failed to create virtual environment.\n"
            "Install with:\n"
            "  sudo apt install python3-venv"
        )

activate_script = VENV_DIR / "bin" / "activate"
python_bin = VENV_DIR / "bin" / "python"

if not activate_script.exists():
    error("Virtual environment corrupted.\nTry:\n  rm -rf " + str(VENV_DIR))

info("Upgrading pip/setuptools/wheel")
run([str(python_bin), "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"])

success("Virtual environment ready")

# ========================
# INSTALL GooeyGUI
# ========================

info("Installing GooeyGUI")

tmp_dir = Path(tempfile.mkdtemp())
installer_path = tmp_dir / "installer.py"

run(["curl", "-fsSL", INSTALLER_URL, "-o", str(installer_path)])

if not installer_path.exists() or installer_path.stat().st_size == 0:
    error("Failed to download GooeyGUI installer")

ret = run([str(python_bin), str(installer_path)], check=False)
if ret != 0:
    warn("GooeyGUI installer returned non-zero")

shutil.rmtree(tmp_dir, ignore_errors=True)

# ========================
# CLONE / UPDATE BUILDER
# ========================

if (BUILDER_DIR / ".git").exists():
    info("Updating GooeyBuilder")
    run(["git", "fetch", "origin"], cwd=BUILDER_DIR)
    run(["git", "reset", "--hard", "origin/main"], cwd=BUILDER_DIR)
else:
    info("Cloning GooeyBuilder")
    run(["git", "clone", BUILDER_REPO, str(BUILDER_DIR)])

if not (BUILDER_DIR / "main.py").exists():
    error("main.py missing in GooeyBuilder")

# ========================
# INSTALL DEPENDENCIES
# ========================

reqs = BUILDER_DIR / "requirements.txt"
if reqs.exists():
    info("Installing Python dependencies")
    run([str(python_bin), "-m", "pip", "install", "-r", str(reqs)])
else:
    warn("No requirements.txt found")

# ========================
# CREATE LAUNCHER
# ========================

info("Creating gbuilder command")

BIN_DIR.mkdir(parents=True, exist_ok=True)

WRAPPER.write_text(
    f"""#!/usr/bin/env bash
set -e
source "{VENV_DIR}/bin/activate"
exec python "{BUILDER_DIR}/main.py" "$@"
""",
    encoding="utf-8"
)

WRAPPER.chmod(0o755)

# ========================
# PATH CHECK
# ========================

path_entries = os.environ.get("PATH", "").split(":")
if str(BIN_DIR) not in path_entries:
    warn(f"{BIN_DIR} not in PATH")

    for rc in (HOME / ".bashrc", HOME / ".zshrc"):
        if rc.exists():
            line = f'export PATH="$PATH:{BIN_DIR}"'
            content = rc.read_text()
            if line not in content:
                rc.write_text(content + "\n" + line + "\n")

    warn("Restart terminal or run:")
    warn(f'  export PATH="$PATH:{BIN_DIR}"')

# ========================
# FINAL TEST
# ========================

if which("gbuilder"):
    success("gbuilder installed successfully")
else:
    warn("gbuilder not found in PATH yet")

# ========================
# DONE
# ========================

success("Installation complete")

print()
print("Installed locations:")
print(f"  App:   {BUILDER_DIR}")
print(f"  Venv:  {VENV_DIR}")
print(f"  Bin:   {WRAPPER}")
print()
print("Run with:")
print("  gbuilder")
