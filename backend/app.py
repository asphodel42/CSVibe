from flask import Flask, Response, render_template, request, jsonify
from worker import start_worker, TASKS
from werkzeug.utils import secure_filename
import os
import json
import time
import uuid


app = Flask(__name__, template_folder='../frontend/templates',
            static_folder='../frontend/static')

UPLOAD_FOLDER = 'backend/tmp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Render the main landing page
@app.route('/')
def index():
    return render_template('index.html')


# Render the "About" information page
@app.route('/about')
def about():
    return render_template('about.html')


# Render the page where the chart will be displayed
@app.route('/plot')
def plot():
    return render_template('plot.html')


# Handle CSV file upload, start background processing, and return a task ID
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify(success=False, message="No file part"), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify(success=False, message="No selected file"), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify(success=False, message="Only .csv files allowed"), 400

    filename = secure_filename(file.filename)

    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    task_id = str(uuid.uuid4())
    TASKS[task_id] = {"status": "queued"}
    start_worker(task_id, filename, UPLOAD_FOLDER)

    return jsonify(success=True, task_id=task_id)


# Stream server-sent events for task status updates to the client
@app.route('/stream/<task_id>')
def stream(task_id):
    def event_stream():
        prev_status = None
        while True:
            task = TASKS.get(task_id)
            if not task:
                yield f"data: {{\"status\": \"not_found\"}}\n\n"
                break
            status = task.get("status", "")
            if status != prev_status:
                msg = {k: v for k, v in task.items()}
                yield f"data: {json.dumps(msg)}\n\n"
                prev_status = status
            if status in ("done", "error", "not_found"):
                break
            time.sleep(1)
    return Response(event_stream(), mimetype="text/event-stream")


# Return the final JSON result for a completed task or an error/status
@app.route('/result/<task_id>')
def result(task_id):
    result_path = os.path.join(UPLOAD_FOLDER, f"{task_id}_result.json")
    if os.path.exists(result_path):
        with open(result_path) as f:
            return jsonify(json.load(f))
    task = TASKS.get(task_id)
    if task and "error" in task:
        return jsonify(success=False, error=task["error"]), 400
    return jsonify(success=False, error="Result not found"), 404


# Run the Flask development server
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
