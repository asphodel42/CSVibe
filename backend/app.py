from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder='../frontend/templates',
            static_folder='../frontend/static')

UPLOAD_FOLDER = 'backend/tmp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/plot')
def plot():
    return render_template('plot.html')


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify(success=False, message="No file part"), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, message="No selected file"), 400
    if not file.filename.lower().endswith('.csv'):
        return jsonify(success=False, message="Only .csv files allowed"), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)
    return jsonify(success=True, message="File uploaded")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
