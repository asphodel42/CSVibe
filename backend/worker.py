import threading
import pandas as pd
import os
import json


TASKS = {}  # Dictionary to hold task statuses


def process_csv(task_id, filename, upload_folder):
    try:
        TASKS[task_id] = {"status": "processing"}
        path = os.path.join(upload_folder, filename)

        chunksize = 100_000
        stats_accum = {
            "count": 0,
            "sum": 0.0,
            "values": [],
            "min": None,
            "max": None
        }

        index_all = []
        result_all = []

        # Читаємо CSV чанками
        for chunk in pd.read_csv(path, chunksize=chunksize):
            if not {'index', 'result'}.issubset(chunk.columns):
                TASKS[task_id] = {
                    "status": "error",
                    "error": "Missing required columns: index, result"
                }
                return
            vals = chunk["result"]
            stats_accum["count"] += len(vals)
            stats_accum["sum"] += vals.sum()
            stats_accum["values"].extend(vals.tolist())
            stats_accum["min"] = min(
                vals.min(), stats_accum["min"]) if stats_accum["min"] is not None else vals.min()
            stats_accum["max"] = max(
                vals.max(), stats_accum["max"]) if stats_accum["max"] is not None else vals.max()

            index_all.extend(chunk["index"].tolist())
            result_all.extend(vals.tolist())

        TASKS[task_id] = {"status": "calculating"}

        mean = stats_accum["sum"] / \
            stats_accum["count"] if stats_accum["count"] > 0 else 0
        median = pd.Series(stats_accum["values"]).median()

        stats = {"mean": mean, "median": median,
                 "min": stats_accum["min"], "max": stats_accum["max"]}

        TASKS[task_id] = {"status": "rendering"}

        output = {
            "filename": filename,
            "stats": stats,
            "data": {
                "index": index_all,
                "result": result_all,
            }
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
