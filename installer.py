#!/usr/bin/env python3
import os
import sys
import subprocess
import shutil
import tempfile
import venv
from pathlib import Path
from datetime import datetime

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

RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
NC = "\033[0m"

INSTALL_ROOT.mkdir(parents=True, exist_ok=True)
LOG_FH = open(LOG_FILE, "a", encoding="utf-8")

def log(msg):
    LOG_FH.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    LOG_FH.flush()

def info(msg):
    print(f"{BLUE}[INFO]{NC} {msg}")
    log(f"INFO: {msg}")

def success(msg):
    print(f"{GREEN}[OK]{NC} {msg}")
    log(f"OK: {msg}")

def warn(msg):
    print(f"{YELLOW}[WARN]{NC} {msg}")
    log(f"WARN: {msg}")

def error(msg):
    print(f"{RED}[ERROR]{NC} {msg}")
    log(f"ERROR: {msg}")
    sys.exit(1)

def run(cmd, cwd=None, check=True):
    log(f"RUN: {' '.join(cmd)}")
    p = subprocess.run(cmd, cwd=cwd)
    if check and p.returncode != 0:
        error(f"Command failed: {' '.join(cmd)}")
    return p.returncode

def which(cmd):
    return shutil.which(cmd) is not None

info("Starting GooeyBuilder installation")

for c in ("python3", "git", "curl"):
    if not which(c):
        error(f"{c} is required but not installed")

if sys.version_info < (3, 8):
    error("Python 3.8+ required")

success("System requirements OK")

if not VENV_DIR.exists():
    info("Creating Python virtual environment")
    try:
        venv.EnvBuilder(with_pip=True).create(VENV_DIR)
    except Exception:
        error("Failed to create virtual environment")

activate_script = VENV_DIR / "bin" / "activate"
python_bin = VENV_DIR / "bin" / "python"

if not activate_script.exists():
    error("Virtual environment corrupted")

info("Upgrading pip/setuptools/wheel")
run([str(python_bin), "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"])
success("Virtual environment ready")

info("Installing GooeyGUI")

tmp_dir = Path(tempfile.mkdtemp())
installer_path = tmp_dir / "installer.py"

run(["curl", "-fsSL", INSTALLER_URL, "-o", str(installer_path)])

if not installer_path.exists() or installer_path.stat().st_size == 0:
    error("Failed to download GooeyGUI installer")

creationflags = 0
if os.name == "nt":
    creationflags = subprocess.CREATE_NEW_PROCESS_GROUP

subprocess.Popen(
    [str(python_bin), str(installer_path)],
    stdin=subprocess.DEVNULL,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    start_new_session=(os.name != "nt"),
    creationflags=creationflags
)

success("GooeyGUI installer launched")

if (BUILDER_DIR / ".git").exists():
    info("Updating GooeyBuilder")
    run(["git", "fetch", "origin"], cwd=BUILDER_DIR)
    run(["git", "reset", "--hard", "origin/main"], cwd=BUILDER_DIR)
else:
    info("Cloning GooeyBuilder")
    run(["git", "clone", BUILDER_REPO, str(BUILDER_DIR)])

if not (BUILDER_DIR / "main.py").exists():
    error("main.py missing in GooeyBuilder")

reqs = BUILDER_DIR / "requirements.txt"
if reqs.exists():
    info("Installing Python dependencies")
    run([str(python_bin), "-m", "pip", "install", "-r", str(reqs)])
else:
    warn("No requirements.txt found")

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

path_entries = os.environ.get("PATH", "").split(":")
if str(BIN_DIR) not in path_entries:
    warn(f"{BIN_DIR} not in PATH")
    for rc in (HOME / ".bashrc", HOME / ".zshrc"):
        if rc.exists():
            line = f'export PATH="$PATH:{BIN_DIR}"'
            content = rc.read_text()
            if line not in content:
                rc.write_text(content + "\n" + line + "\n")
    warn(f'export PATH="$PATH:{BIN_DIR}"')

if which("gbuilder"):
    success("gbuilder installed successfully")
else:
    warn("gbuilder not found in PATH yet")

success("Installation complete")

print()
print("Installed locations:")
print(f"  App:   {BUILDER_DIR}")
print(f"  Venv:  {VENV_DIR}")
print(f"  Bin:   {WRAPPER}")
print()
print("Run with:")
print("  gbuilder")
