# CSVibe

CSVibe is a lightweight web application for quickly visualizing CSV data. Upload your CSV file and watch as it’s processed asynchronously—complete with real-time status updates—then explore interactive charts and key statistics (mean, median, min, max) rendered with Plotly.js.

---

## Installation & Run Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/asphodel42/CSVibe.git
   cd CSVibe
   ```

2. **Set up the Python environment**

   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate
   pip install -r requirements.txt
   ```

3. **Run the Flask server**

   ```bash
   python app.py
   ```

4. **Open in browser**
   Visit `http://localhost:5000` to access the app.

---

## Implementation Overview

The backend is built with Flask and uses a simple threading model to process CSV uploads without blocking incoming requests. Each upload spawns a worker thread that reads the file in chunks via pandas, validates that the required `index` and `result` columns exist, and calculates summary statistics (mean, median, min, max). Intermediate status updates (`processing`, `calculating`, `rendering`, `done`) are streamed to the frontend over Server-Sent Events (SSE).

On the frontend, vanilla JavaScript manages a two-panel upload interface—complete with drag-and-drop and a modal loader for status feedback. Once processing completes, the user is redirected to the plot page, where the app fetches the computed results JSON, populates a statistics block, and draws an interactive `scattergl` chart using Plotly.js. Non-blocking toast notifications handle errors and informative messages consistently across the application.

Configuration, styling, and scripts are organized under `frontend/static` and `frontend/templates`, while core logic and dependencies live in `backend`. Simply follow the steps above to deploy locally and start visualizing CSV data in minutes.
