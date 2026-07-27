import os
import sys
import subprocess
import tempfile
import time
from typing import Dict, Any

def run_code(language: str, code: str, input_data: str = "", timeout_sec: int = 5) -> Dict[str, Any]:
    """
    Executes source code locally with timeout and captures output.
    Supports: Python, C, C++, Java, JavaScript, TypeScript, Go, Rust, PHP, Ruby, C#
    """
    temp_dir = tempfile.mkdtemp(prefix="codelock_exec_")
    lang = language.lower().strip()

    try:
        # 1. Python
        if lang in ["python", "python3", "py"]:
            file_path = os.path.join(temp_dir, "solution.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            return _execute_cmd([sys.executable, file_path], input_data, timeout_sec)

        # 2. JavaScript (Node.js)
        elif lang in ["javascript", "js", "node"]:
            file_path = os.path.join(temp_dir, "solution.js")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            return _execute_cmd(["node", file_path], input_data, timeout_sec)

        # 3. TypeScript
        elif lang in ["typescript", "ts"]:
            file_path = os.path.join(temp_dir, "solution.ts")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            return _execute_cmd(["npx", "ts-node", file_path], input_data, timeout_sec)

        # 4. C Language
        elif lang == "c":
            src_path = os.path.join(temp_dir, "solution.c")
            exe_path = os.path.join(temp_dir, "solution.exe" if os.name == 'nt' else "solution")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_res = _execute_cmd(["gcc", src_path, "-o", exe_path], "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }
            return _execute_cmd([exe_path], input_data, timeout_sec)

        # 5. C++
        elif lang in ["cpp", "c++"]:
            src_path = os.path.join(temp_dir, "solution.cpp")
            exe_path = os.path.join(temp_dir, "solution.exe" if os.name == 'nt' else "solution")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_res = _execute_cmd(["g++", src_path, "-o", exe_path], "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }
            return _execute_cmd([exe_path], input_data, timeout_sec)

        # 6. Java
        elif lang == "java":
            src_path = os.path.join(temp_dir, "Main.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_res = _execute_cmd(["javac", src_path], "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }
            return _execute_cmd(["java", "-cp", temp_dir, "Main"], input_data, timeout_sec)

        # 7. Go (Golang)
        elif lang in ["go", "golang"]:
            file_path = os.path.join(temp_dir, "main.go")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            return _execute_cmd(["go", "run", file_path], input_data, timeout_sec)

        # 8. Rust
        elif lang in ["rust", "rs"]:
            src_path = os.path.join(temp_dir, "solution.rs")
            exe_path = os.path.join(temp_dir, "solution.exe" if os.name == 'nt' else "solution")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_res = _execute_cmd(["rustc", src_path, "-o", exe_path], "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"Rust Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }
            return _execute_cmd([exe_path], input_data, timeout_sec)

        # 9. PHP
        elif lang == "php":
            file_path = os.path.join(temp_dir, "solution.php")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            return _execute_cmd(["php", file_path], input_data, timeout_sec)

        # 10. Ruby
        elif lang == "ruby":
            file_path = os.path.join(temp_dir, "solution.rb")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            return _execute_cmd(["ruby", file_path], input_data, timeout_sec)

        # 11. C# (.NET)
        elif lang in ["csharp", "cs"]:
            src_path = os.path.join(temp_dir, "Program.cs")
            exe_path = os.path.join(temp_dir, "Program.exe")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_res = _execute_cmd(["csc", f"-out:{exe_path}", src_path], "", timeout_sec=10)
            if compile_res["status"] != "SUCCESS":
                return {
                    "stdout": "",
                    "stderr": f"C# Compilation Error:\n{compile_res['stderr']}",
                    "status": "COMPILE_ERROR"
                }
            return _execute_cmd([exe_path], input_data, timeout_sec)

        else:
            return {
                "stdout": "",
                "stderr": f"Unsupported programming language: {language}",
                "status": "RUNTIME_ERROR"
            }

    finally:
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
            "stderr": f"Compiler/Interpreter command '{cmd[0]}' not found on backend server system.",
            "status": "COMPILE_ERROR"
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Execution Exception: {str(e)}",
            "status": "RUNTIME_ERROR"
        }
