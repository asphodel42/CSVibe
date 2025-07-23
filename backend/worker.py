import threading
import pandas as pd
import os
import json


TASKS = {}  # Dictionary to hold task statuses


def process_csv(task_id, filename, upload_folder):
    try:
        TASKS[task_id] = {"status": "processing"}
        path = os.path.join(upload_folder, filename)
        df = pd.read_csv(path)
        if not {'index', 'result'}.issubset(df.columns):
            TASKS[task_id] = {"status": "error",
                              "error": "Missing required columns: index, result"}
            return
        TASKS[task_id] = {"status": "calculating"}
        stats = {
            "mean": df["result"].mean(),
            "median": df["result"].median(),
            "min": df["result"].min(),
            "max": df["result"].max(),
        }
        TASKS[task_id] = {"status": "rendering"}
        output = {
            "filename": filename,
            "stats": stats,
            "data": {
                "index": df["index"].tolist(),
                "result": df["result"].tolist(),
            },
        }
        with open(os.path.join(upload_folder, f"{task_id}_result.json"), "w") as f:
            json.dump(output, f)
        TASKS[task_id] = {"status": "done"}
    except Exception as e:
        TASKS[task_id] = {"status": "error", "error": str(e)}


def start_worker(task_id, filename, upload_folder):
    thread = threading.Thread(target=process_csv, args=(
        task_id, filename, upload_folder))
    thread.start()
