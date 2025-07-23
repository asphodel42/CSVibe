const downloadPlotBtn = document.getElementById("download-plot");
const loadPlotBtn = document.getElementById("load-plot");
const axisSwapBtn = document.querySelector(".axis-swap-btn");
const axisNameX = document.querySelector("#axis-x-name p");
const axisNameY = document.querySelector("#axis-y-name p");

let currentPlotData = null;
let flipped = false;

function downloadPlotHandler(data) {
  downloadPlotBtn.addEventListener("click", () => {
    if (!data) return;
    Plotly.downloadImage("plot", {
      format: "png",
      filename: data.filename.replace(".csv", ""),
    });
  });
}

function changeAxisHandler(data) {
  axisSwapBtn.addEventListener("click", () => {
    flipped = !flipped;
    const x = flipped ? data.data.result : data.data.index;
    const y = flipped ? data.data.index : data.data.result;
    axisNameX.textContent = flipped ? "result" : "index";
    axisNameY.textContent = flipped ? "index" : "result";
    Plotly.react("plot", [{ x, y, mode: "lines+markers", type: "scattergl" }], {
      xaxis: { title: flipped ? "result" : "index" },
      yaxis: { title: flipped ? "index" : "result" },
    });
  });
}

function renderChart(data) {
  currentPlotData = data;

  document.querySelector("#file-name h1").textContent = data.filename;

  document.getElementById("graph-mean-value").textContent =
    data.stats.mean.toFixed(2);
  document.getElementById("graph-median-value").textContent =
    data.stats.median.toFixed(2);
  document.getElementById("graph-min-value").textContent =
    data.stats.min.toFixed(2);
  document.getElementById("graph-max-value").textContent =
    data.stats.max.toFixed(2);

  const trace = {
    type: "scattergl",
    mode: "lines+markers",
    x: data.data.index,
    y: data.data.result,
    marker: { color: "#476a8a" },
  };

  const layout = {
    title: `Plot for ${data.filename}`,
    xaxis: { title: "index" },
    yaxis: { title: "result" },
  };

  Plotly.newPlot("plot", [trace], layout, { responsive: true });
  downloadPlotHandler(data);
  changeAxisHandler(data);
}

loadPlotBtn.addEventListener("click", () => {
  window.location.href = "/";
});

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get("task");
  if (!taskId) {
    showToast("No task ID provided", "error");
    return;
  }
  fetch(`/result/${taskId}`)
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch result");
      return r.json();
    })
    .then(renderChart)
    .catch((err) => {
      console.error("Error fetching result:", err);
      showToast("Error fetching result", "error");
    });
});
