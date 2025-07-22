from flask import Flask, render_template

app = Flask(__name__, template_folder='../frontend/templates',
            static_folder='../frontend/static')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/plot')
def plot():
    return render_template('plot.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
