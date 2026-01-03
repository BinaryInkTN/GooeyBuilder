#!/usr/bin/env python3
import atexit
import os
import shutil
import subprocess
import sys
import tempfile
import venv
from datetime import datetime
from pathlib import Path

APP_NAME = "GUIIDE"
HOME = Path.home()
XDG_DATA_HOME = Path(os.environ.get("XDG_DATA_HOME", HOME / ".local" / "share"))
INSTALL_ROOT = XDG_DATA_HOME / "gooey"
BUILDER_DIR = INSTALL_ROOT / "GUIIDE"
VENV_DIR = INSTALL_ROOT / "venv"
BIN_DIR = HOME / ".local" / "bin"
WRAPPER = BIN_DIR / "gbuilder"
LOG_FILE = INSTALL_ROOT / "installer.log"
BUILDER_REPO = "https://github.com/BinaryInkTN/GooeyBuilder.git"
INSTALLER_URL = (
    "https://raw.githubusercontent.com/BinaryInkTN/GooeyGUI/main/installer.py"
)
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
NC = "\033[0m"

if os.name == "nt":
    import ctypes

    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

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
    log(f"RUN: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    try:
        if capture_output:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                check=False,
            )
        else:
            result = subprocess.run(
                cmd, cwd=cwd, capture_output=True, text=True, check=False
            )

        if capture_output:
            if result.stdout:
                log(f"STDOUT: {result.stdout.strip()}")
            if result.stderr:
                log(f"STDERR: {result.stderr.strip()}")

        if check and result.returncode != 0:
            error_msg = (
                f"Command failed: {' '.join(cmd) if isinstance(cmd, list) else cmd}\n"
            )
            error_msg += f"Exit code: {result.returncode}\n"
            if result.stdout:
                error_msg += f"Stdout: {result.stdout[-500:]}\n"
            if result.stderr:
                error_msg += f"Stderr: {result.stderr[-500:]}\n"
            raise subprocess.CalledProcessError(
                result.returncode, cmd, result.stdout, result.stderr
            )
        return result
    except subprocess.CalledProcessError as e:
        raise e
    except FileNotFoundError as e:
        error(f"Command not found: {cmd[0] if isinstance(cmd, list) else cmd}")


def which(cmd):
    return shutil.which(cmd) is not None


def check_requirements():
    info("Checking system requirements")
    required_commands = ["python3", "git", "curl"]
    missing = []
    for cmd in required_commands:
        if not which(cmd):
            missing.append(cmd)
    if missing:
        error(f"Missing requirements: {', '.join(missing)}")
    if sys.version_info < (3, 8):
        error("Python 3.8+ required")
    success("System requirements OK")


def create_virtual_environment():
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

    info("Setting up pip")
    try:
        check_result = subprocess.run(
            [str(python_bin), "-m", "pip", "--version"],
            capture_output=True,
            text=True,
            check=False,
        )

        if check_result.returncode != 0:
            subprocess.run(
                [str(python_bin), "-m", "ensurepip", "--upgrade"],
                capture_output=True,
                text=True,
                check=False,
            )

        subprocess.run(
            [str(python_bin), "-m", "pip", "install", "--upgrade", "pip"],
            capture_output=True,
            text=True,
            check=False,
        )

        for package in ["setuptools", "wheel"]:
            subprocess.run(
                [str(python_bin), "-m", "pip", "install", "--upgrade", package],
                capture_output=True,
                text=True,
                check=False,
            )

    except Exception as e:
        warn(f"Error during pip setup: {str(e)[:200]}")

    success("Virtual environment ready")
    return python_bin


def launch_gooeygui_installer(python_bin):
    info("Downloading GooeyGUI installer")
    tmp_dir = Path(tempfile.mkdtemp())
    installer_path = tmp_dir / "installer.py"

    try:
        result = subprocess.run(
            ["curl", "-fsSL", INSTALLER_URL, "-o", str(installer_path)],
            capture_output=True,
            text=True,
            check=False,
        )

        if not installer_path.exists() or installer_path.stat().st_size == 0:
            warn("Failed to download GooeyGUI installer")
            return False

        print()
        print(f"{YELLOW}╔══════════════════════════════════════════════════════╗{NC}")
        print(f"{YELLOW}║         STARTING GOOEYGUI INSTALLATION              ║{NC}")
        print(f"{YELLOW}╚══════════════════════════════════════════════════════╝{NC}")
        print()
        print(f"{BLUE}The GooeyGUI installer will now run.{NC}")
        print()

        atexit.register(lambda: shutil.rmtree(tmp_dir, ignore_errors=True))

        result = subprocess.run(
            [str(python_bin), str(installer_path)],
            check=False,
        )

        print()
        if result.returncode == 0:
            success("GooeyGUI installer completed successfully")
            return True
        else:
            warn(f"GooeyGUI installer exited with code {result.returncode}")
            return False

    except Exception as e:
        warn(f"Failed to launch GooeyGUI installer: {e}")
        return False


def install_GUIIDE(python_bin):
    BUILDER_DIR.mkdir(parents=True, exist_ok=True)

    if (BUILDER_DIR / ".git").exists():
        info("Updating GUIIDE")
        subprocess.run(
            ["git", "fetch", "origin"],
            cwd=BUILDER_DIR,
            capture_output=True,
            text=True,
            check=False,
        )
        subprocess.run(
            ["git", "reset", "--hard", "origin/main"],
            cwd=BUILDER_DIR,
            capture_output=True,
            text=True,
            check=False,
        )
        success("GUIIDE updated")
    else:
        info("Cloning GUIIDE")
        subprocess.run(
            ["git", "clone", BUILDER_REPO, str(BUILDER_DIR)],
            capture_output=True,
            text=True,
            check=False,
        )
        success("GUIIDE cloned")

    if not (BUILDER_DIR / "main.py").exists():
        error("main.py missing in GUIIDE repository")

    reqs = BUILDER_DIR / "requirements.txt"
    if reqs.exists():
        info("Installing Python dependencies")
        result = subprocess.run(
            [str(python_bin), "-m", "pip", "install", "-r", str(reqs)],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0:
            success("Dependencies installed")
        else:
            warn("Failed to install some dependencies")
    else:
        warn("No requirements.txt found")


def create_wrapper(python_bin):
    info(f"Creating gbuilder command in {BIN_DIR}")
    BIN_DIR.mkdir(parents=True, exist_ok=True)

    if os.name == "nt":
        wrapper_content = f"""@echo off
"{python_bin}" "{BUILDER_DIR / "main.py"}" %*
"""
        wrapper_path = BIN_DIR / "gbuilder.bat"
    else:
        wrapper_content = f"""#!/usr/bin/env bash
exec "{python_bin}" "{BUILDER_DIR / "main.py"}" "$@"
"""
        wrapper_path = BIN_DIR / "gbuilder"

    try:
        wrapper_path.write_text(wrapper_content, encoding="utf-8")

        if os.name != "nt":
            wrapper_path.chmod(0o755)

        success(f"Wrapper created at {wrapper_path}")

        if os.name != "nt":
            path_entries = os.environ.get("PATH", "").split(":")
            if str(BIN_DIR) not in path_entries:
                warn(f"{BIN_DIR} is not in your PATH")

                shell_configs = []
                shell = os.environ.get("SHELL", "")

                if "zsh" in shell:
                    shell_configs = [HOME / ".zshrc"]
                elif "bash" in shell:
                    shell_configs = [HOME / ".bashrc", HOME / ".bash_profile"]

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
                                    f.write(f"\n{export_line}\n")
                        except Exception:
                            pass

        return wrapper_path

    except Exception as e:
        error(f"Failed to create wrapper: {e}")


def main():
    print(f"{BLUE}=== GUIIDE Installer ==={NC}")
    print()

    try:
        check_requirements()

        python_bin = create_virtual_environment()

        print()
        print(f"{BLUE}╔══════════════════════════════════════════════════════╗{NC}")
        print(f"{BLUE}║       Step 1: Installing GooeyGUI                    ║{NC}")
        print(f"{BLUE}╚══════════════════════════════════════════════════════╝{NC}")
        print()

        gooeygui_installed = launch_gooeygui_installer(python_bin)

        print()
        print(f"{BLUE}╔══════════════════════════════════════════════════════╗{NC}")
        print(f"{BLUE}║       Step 2: Installing GUIIDE                ║{NC}")
        print(f"{BLUE}╚══════════════════════════════════════════════════════╝{NC}")
        print()

        install_GUIIDE(python_bin)

        wrapper_path = create_wrapper(python_bin)

        print()
        print(f"{GREEN}╔══════════════════════════════════════════════════════╗{NC}")
        print(f"{GREEN}║           INSTALLATION COMPLETE                     ║{NC}")
        print(f"{GREEN}╚══════════════════════════════════════════════════════╝{NC}")
        print()
        print("Installed locations:")
        print(f"  {BLUE}Application:{NC} {BUILDER_DIR}")
        print(f"  {BLUE}Virtual Env:{NC} {VENV_DIR}")
        print(f"  {BLUE}Wrapper:{NC}     {wrapper_path}")
        print()

        if gooeygui_installed:
            print(f"{GREEN}✓ GooeyGUI was successfully installed{NC}")

        print()
        print("To run GUIIDE:")

        if os.name == "nt":
            print("  1. Open a new Command Prompt or PowerShell")
            print("  2. Type: gbuilder")
        else:
            print("  1. Open a new terminal")
            print("  2. Type: gbuilder")

        print()
        print(
            f"If 'gbuilder' doesn't work, try: {python_bin} {BUILDER_DIR / 'main.py'}"
        )
        print()

        if os.name != "nt":
            test_result = subprocess.run(
                ["which", "gbuilder"], capture_output=True, text=True, check=False
            )
            if test_result.returncode == 0:
                success("gbuilder command is ready to use!")

    except KeyboardInterrupt:
        print()
        warn("Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        error(f"Unexpected error: {e}")


if __name__ == "__main__":
    main()
