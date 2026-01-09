import inspect
import os
import shutil
import subprocess
import sys
import tempfile
import time
import traceback

import eel
import eel.browsers

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, "web")
os.makedirs(WEB_DIR, exist_ok=True)

try:
    eel.init(WEB_DIR)
except Exception as e:
    print(f"[FATAL] Failed to init Eel: {e}")
    sys.exit(1)

_frontend_ready = False
_console_buffer = []


def _format_console_line(payload):
    caller = inspect.stack()[2].function

    if isinstance(payload, dict):
        msg_type = payload.get("type", "stdout").upper()
        line = payload.get("line", "")
        pid = payload.get("process_id", "")
        return f"[{msg_type}][PID:{pid}][{caller}] {line}"

    return f"[INFO][{caller}] {str(payload)}"


def js_console(payload):
    global _frontend_ready

    try:
        if _frontend_ready:
            eel.jsConsoleOutput(payload["line"])
    except Exception as e:
        print(f"[JS_CONSOLE_ERROR] {e}")


@eel.expose
def frontend_ready():
    global _frontend_ready
    _frontend_ready = True
    return True


@eel.expose
def execute_app(c_code):
    process_id = str(int(time.time() * 1000))
    temp_dir = None
    try:
        js_console(
            {
                "type": "system",
                "line": "Starting execution",
                "process_id": process_id,
            }
        )
        print(c_code)
        temp_dir = tempfile.mkdtemp()
        c_file = os.path.join(temp_dir, "gui_app.c")
        exe_file = os.path.join(temp_dir, "gui_app")

        with open(c_file, "w") as f:
            f.write(c_code)

        compile_cmd = [
            "gcc",
            c_file,
            "-o",
            exe_file,
            "-lGooeyGUI-1",
            "-lGLPS",
            "-I/usr/local/include/Gooey",
            "-I/usr/local/include/GLPS",
            "-L/usr/local/lib",
        ]

        compile_proc = subprocess.run(
            compile_cmd,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=temp_dir,
        )

        if compile_proc.returncode != 0:
            js_console(
                {
                    "type": "error",
                    "line": "Compilation failed",
                    "process_id": process_id,
                }
            )

            for line in compile_proc.stdout.splitlines():
                js_console(
                    {
                        "type": "stderr",
                        "line": line,
                        "process_id": process_id,
                    }
                )

            return {"success": False}

        run_proc = subprocess.run(
            [exe_file],
            capture_output=True,
            text=True,
            cwd=temp_dir,
            env=os.environ.copy(),
        )

        for line in run_proc.stdout.splitlines():
            js_console(
                {
                    "type": "stdout",
                    "line": line,
                    "process_id": process_id,
                }
            )

        for line in run_proc.stderr.splitlines():
            js_console(
                {
                    "type": "stderr",
                    "line": line,
                    "process_id": process_id,
                }
            )

        exit_type = "exit" if run_proc.returncode == 0 else "error"
        js_console(
            {
                "type": exit_type,
                "line": f"Program exited with code {run_proc.returncode}",
                "process_id": process_id,
            }
        )

        return {
            "success": run_proc.returncode == 0,
            "exit_code": run_proc.returncode,
        }

    except subprocess.TimeoutExpired:
        js_console(
            {
                "type": "error",
                "line": "Program execution timed out",
                "process_id": process_id,
            }
        )
        return {"success": False}

    except Exception as e:
        js_console(
            {
                "type": "error",
                "line": f"Unexpected error: {e}",
                "process_id": process_id,
            }
        )
        traceback.print_exc()
        return {"success": False}

    finally:
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)


@eel.expose
def test_connection():
    js_console("Python backend connected")
    return {"status": "ok"}


@eel.expose
def console_log_simple(message, msg_type="stdout", process_id=""):
    js_console(
        {
            "type": msg_type,
            "line": message,
            "process_id": process_id,
        }
    )


if __name__ == "__main__":
    print("Starting GooeyGUI Designer")

    chrome_args = [
        "--disable-background-networking",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-sync",
        "--no-first-run",
        "--password-store=basic",
        "--use-mock-keychain",
    ]

    try:
        eel.start(
            "index.html",
            size=(1200, 800),
            port=5050,
            mode="chrome",
            host="localhost",
            block=True,
            cmdline_args=chrome_args,
        )

    except Exception as e:
        print(f"[WARN] Chrome failed: {e}")
        eel.start(
            "index.html",
            size=(1200, 800),
            port=5050,
            mode="default",
            host="localhost",
            block=True,
        )
