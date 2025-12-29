import os
import subprocess
import tempfile

import eel

eel.init("web")


@eel.expose
def execute_app(c_code):
    try:
        temp_dir = tempfile.mkdtemp()

        c_file_path = os.path.join(temp_dir, "gui_app.c")
        exe_path = os.path.join(temp_dir, "gui_app")

        with open(c_file_path, "w") as f:
            f.write(c_code)

        compile_cmd = [
            "gcc",
            c_file_path,
            "-o",
            exe_path,
            "-lGooeyGUI-1",
            "-lGLPS",
            "-I/usr/local/include/Gooey",
            "-I/usr/local/include/GLPS",
            "-L/usr/local/lib",
        ]

        compile_result = subprocess.run(
            compile_cmd, capture_output=True, text=True, cwd=temp_dir
        )

        run_result = subprocess.run(
            [exe_path],
            capture_output=True,
            text=True,
            cwd=temp_dir,
        )

        return {
            "success": True,
            "output": run_result.stdout,
            "return_code": run_result.returncode,
        }

    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Execution timed out after 10 seconds"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        import shutil

        try:
            shutil.rmtree(temp_dir)
        except:
            pass


if __name__ == "__main__":
    eel.start("index.html", size=(1200, 800), port=5050)
