import os
import sys
import subprocess
import tempfile
import time
from typing import Dict, Any

def run_code(language: str, code: str, input_data: str = "", timeout_sec: int = 5) -> Dict[str, Any]:
    """
    Executes source code locally with timeout and captures output.
    Supports: python, c, cpp, java
    """
    temp_dir = tempfile.mkdtemp(prefix="codelock_exec_")
    lang = language.lower()

    try:
        if lang in ["python", "python3", "py"]:
            file_path = os.path.join(temp_dir, "solution.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            cmd = [sys.executable, file_path]
            return _execute_cmd(cmd, input_data, timeout_sec)

        elif lang == "c":
            src_path = os.path.join(temp_dir, "solution.c")
            exe_path = os.path.join(temp_dir, "solution.exe" if os.name == 'nt' else "solution")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Compile step
            compile_cmd = ["gcc", src_path, "-o", exe_path]
            compile_res = _execute_cmd(compile_cmd, "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }

            # Run step
            return _execute_cmd([exe_path], input_data, timeout_sec)

        elif lang in ["cpp", "c++"]:
            src_path = os.path.join(temp_dir, "solution.cpp")
            exe_path = os.path.join(temp_dir, "solution.exe" if os.name == 'nt' else "solution")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Compile step
            compile_cmd = ["g++", src_path, "-o", exe_path]
            compile_res = _execute_cmd(compile_cmd, "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }

            # Run step
            return _execute_cmd([exe_path], input_data, timeout_sec)

        elif lang == "java":
            src_path = os.path.join(temp_dir, "Main.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Compile step
            compile_cmd = ["javac", src_path]
            compile_res = _execute_cmd(compile_cmd, "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }

            # Run step
            run_cmd = ["java", "-cp", temp_dir, "Main"]
            return _execute_cmd(run_cmd, input_data, timeout_sec)

        else:
            return {
                "stdout": "",
                "stderr": f"Unsupported language: {language}",
                "status": "RUNTIME_ERROR"
            }

    finally:
        # Clean up files
        try:
            for f in os.listdir(temp_dir):
                os.remove(os.path.join(temp_dir, f))
            os.rmdir(temp_dir)
        except Exception:
            pass

def _execute_cmd(cmd, input_data: str, timeout_sec: int) -> Dict[str, Any]:
    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate(input=input_data, timeout=timeout_sec)
        
        if proc.returncode != 0:
            return {
                "stdout": stdout.strip(),
                "stderr": stderr.strip(),
                "status": "RUNTIME_ERROR"
            }
        
        return {
            "stdout": stdout.strip(),
            "stderr": stderr.strip(),
            "status": "SUCCESS"
        }

    except subprocess.TimeoutExpired:
        proc.kill()
        return {
            "stdout": "",
            "stderr": f"Execution Timed Out (Limit: {timeout_sec}s)",
            "status": "TIMEOUT"
        }
    except FileNotFoundError as e:
        return {
            "stdout": "",
            "stderr": f"Compiler/Interpreter not found on server system: {e}",
            "status": "COMPILE_ERROR"
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Execution Exception: {str(e)}",
            "status": "RUNTIME_ERROR"
        }
