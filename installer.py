#!/usr/bin/env python3
import os
import sys
import subprocess
import shutil
import tempfile
import venv
from pathlib import Path
from datetime import datetime
import atexit

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

# Color codes for Windows if needed
if os.name == "nt":
    import ctypes
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

# Setup logging
INSTALL_ROOT.mkdir(parents=True, exist_ok=True)
LOG_FH = open(LOG_FILE, "a", encoding="utf-8")
atexit.register(LOG_FH.close)

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
    LOG_FH.close()
    sys.exit(1)

def run(cmd, cwd=None, check=True, capture_output=False):
    """Run a command and return the result."""
    log(f"RUN: {' '.join(cmd) if isinstance(cmd, list) else cmd}")

    try:
        if capture_output:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                encoding='utf-8',
                check=check
            )
        else:
            result = subprocess.run(cmd, cwd=cwd, check=check)
        return result
    except subprocess.CalledProcessError as e:
        if check:
            error(f"Command failed: {' '.join(cmd) if isinstance(cmd, list) else cmd}\nError: {e}")
        else:
            raise e
    except FileNotFoundError as e:
        error(f"Command not found: {cmd[0] if isinstance(cmd, list) else cmd}")

def which(cmd):
    return shutil.which(cmd) is not None

def check_requirements():
    """Check system requirements."""
    info("Checking system requirements")

    required_commands = {
        "python3": "Python 3 is required",
        "git": "Git is required to clone repositories",
        "curl": "Curl is required to download files"
    }

    missing = []
    for cmd, description in required_commands.items():
        if not which(cmd):
            missing.append(f"{cmd}: {description}")

    if missing:
        error(f"Missing requirements:\n" + "\n".join(missing))

    if sys.version_info < (3, 8):
        error("Python 3.8+ required")

    success("System requirements OK")

def create_virtual_environment():
    """Create or update the Python virtual environment."""
    if not VENV_DIR.exists():
        info("Creating Python virtual environment")
        try:
            venv.EnvBuilder(with_pip=True).create(VENV_DIR)
            success(f"Virtual environment created at {VENV_DIR}")
        except Exception as e:
            error(f"Failed to create virtual environment: {e}")
    else:
        info("Virtual environment already exists")

    python_bin = VENV_DIR / "bin" / "python"
    if os.name == "nt":
        python_bin = VENV_DIR / "Scripts" / "python.exe"

    if not python_bin.exists():
        error(f"Python binary not found in virtual environment: {python_bin}")

    # Upgrade pip and setuptools
    info("Upgrading pip/setuptools/wheel")
    try:
        run([str(python_bin), "-m", "pip", "install", "--upgrade",
             "pip", "setuptools", "wheel"], capture_output=True)
        success("Virtual environment ready")
    except Exception as e:
        warn(f"Failed to upgrade pip/setuptools: {e}")

    return python_bin

def launch_gooeygui_installer(python_bin):
    """Launch the GooeyGUI installer."""
    info("Downloading GooeyGUI installer")

    tmp_dir = Path(tempfile.mkdtemp())
    installer_path = tmp_dir / "installer.py"

    try:
        run(["curl", "-fsSL", INSTALLER_URL, "-o", str(installer_path)],
            capture_output=True)

        if not installer_path.exists() or installer_path.stat().st_size == 0:
            warn("Failed to download GooeyGUI installer or file is empty")
            return

        info("Launching GooeyGUI installer")

        # Clean up temporary directory
        atexit.register(lambda: shutil.rmtree(tmp_dir, ignore_errors=True))

        # Launch installer in background
        if os.name == "nt":
            subprocess.Popen(
                [str(python_bin), str(installer_path)],
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                close_fds=True
            )
        else:
            subprocess.Popen(
                [str(python_bin), str(installer_path)],
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True
            )

        success("GooeyGUI installer launched in background")

    except Exception as e:
        warn(f"Failed to launch GooeyGUI installer: {e}")

def install_gooeybuilder(python_bin):
    """Install or update GooeyBuilder."""
    BUILDER_DIR.mkdir(parents=True, exist_ok=True)

    if (BUILDER_DIR / ".git").exists():
        info("Updating GooeyBuilder")
        try:
            run(["git", "fetch", "origin"], cwd=BUILDER_DIR, capture_output=True)
            run(["git", "reset", "--hard", "origin/main"], cwd=BUILDER_DIR, capture_output=True)
            success("GooeyBuilder updated")
        except Exception as e:
            warn(f"Failed to update GooeyBuilder: {e}")
    else:
        info("Cloning GooeyBuilder")
        try:
            run(["git", "clone", BUILDER_REPO, str(BUILDER_DIR)], capture_output=True)
            success("GooeyBuilder cloned")
        except Exception as e:
            error(f"Failed to clone GooeyBuilder: {e}")

    # Verify main.py exists
    if not (BUILDER_DIR / "main.py").exists():
        error("main.py missing in GooeyBuilder repository")

    # Install dependencies
    reqs = BUILDER_DIR / "requirements.txt"
    if reqs.exists():
        info("Installing Python dependencies")
        try:
            run([str(python_bin), "-m", "pip", "install", "-r", str(reqs)],
                capture_output=True)
            success("Dependencies installed")
        except Exception as e:
            warn(f"Failed to install some dependencies: {e}")
    else:
        warn("No requirements.txt found")

def create_wrapper(python_bin):
    """Create the gbuilder wrapper script."""
    info(f"Creating gbuilder command in {BIN_DIR}")

    BIN_DIR.mkdir(parents=True, exist_ok=True)

    # Determine the activate script path based on OS
    if os.name == "nt":
        activate_script = VENV_DIR / "Scripts" / "activate.bat"
        wrapper_content = f"""@echo off
call "{activate_script}"
python "{BUILDER_DIR / "main.py"}" %*
"""
        wrapper_ext = ".bat"
        wrapper_path = BIN_DIR / "gbuilder.bat"
    else:
        activate_script = VENV_DIR / "bin" / "activate"
        wrapper_content = f"""#!/usr/bin/env bash
set -e
source "{activate_script}"
exec python "{BUILDER_DIR / "main.py"}" "$@"
"""
        wrapper_ext = ""
        wrapper_path = BIN_DIR / "gbuilder"

    try:
        wrapper_path.write_text(wrapper_content, encoding="utf-8")

        if os.name != "nt":
            wrapper_path.chmod(0o755)

        success(f"Wrapper created at {wrapper_path}")

        # Add to PATH if not already there
        if os.name == "nt":
            # On Windows, we rely on the .bat extension being in PATHEXT
            pass
        else:
            path_entries = os.environ.get("PATH", "").split(":")
            if str(BIN_DIR) not in path_entries:
                warn(f"{BIN_DIR} is not in your PATH")

                # Try to update shell config
                shell_configs = []
                shell = os.environ.get("SHELL", "")

                if "zsh" in shell:
                    shell_configs = [HOME / ".zshrc"]
                elif "bash" in shell:
                    shell_configs = [HOME / ".bashrc", HOME / ".bash_profile"]

                # Also check common files
                common_configs = [HOME / ".bashrc", HOME / ".zshrc", HOME / ".profile"]
                for config in common_configs:
                    if config.exists() and config not in shell_configs:
                        shell_configs.append(config)

                export_line = f'export PATH="$PATH:{BIN_DIR}"'

                for rc in shell_configs:
                    if rc.exists():
                        try:
                            content = rc.read_text(encoding="utf-8")
                            if export_line not in content:
                                with open(rc, "a", encoding="utf-8") as f:
                                    f.write(f"\n# Added by GooeyBuilder installer\n")
                                    f.write(f"{export_line}\n")
                                info(f"Added {BIN_DIR} to PATH in {rc}")
                        except Exception as e:
                            warn(f"Could not update {rc}: {e}")

        return wrapper_path

    except Exception as e:
        error(f"Failed to create wrapper: {e}")

def main():
    """Main installation function."""
    print(f"{BLUE}=== GooeyBuilder Installer ==={NC}")
    print()

    try:
        # Check requirements
        check_requirements()

        # Create virtual environment
        python_bin = create_virtual_environment()

        # Launch GooeyGUI installer
        launch_gooeygui_installer(python_bin)

        # Install GooeyBuilder
        install_gooeybuilder(python_bin)

        # Create wrapper
        wrapper_path = create_wrapper(python_bin)

        # Final message
        print()
        print(f"{GREEN}=== Installation Complete ==={NC}")
        print()
        print("Installed locations:")
        print(f"  Application: {BUILDER_DIR}")
        print(f"  Virtual Env: {VENV_DIR}")
        print(f"  Wrapper:     {wrapper_path}")
        print()
        print("To run GooeyBuilder:")

        if os.name == "nt":
            print("  1. Open a new Command Prompt or PowerShell")
            print("  2. Type: gbuilder")
        else:
            print("  1. Open a new terminal or run: source ~/.bashrc (or ~/.zshrc)")
            print("  2. Type: gbuilder")

        print()
        print(f"If 'gbuilder' doesn't work, try: {python_bin} {BUILDER_DIR / 'main.py'}")
        print()

        # Test if command is available
        if os.name != "nt":
            test_result = run(["which", "gbuilder"], check=False, capture_output=True)
            if test_result.returncode == 0:
                success("gbuilder command is ready to use!")
            else:
                warn("You may need to restart your terminal or run: source ~/.bashrc")

    except KeyboardInterrupt:
        print()
        warn("Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        error(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
