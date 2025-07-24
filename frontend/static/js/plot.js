const downloadPlotBtn = document.getElementById("download-plot");
const loadPlotBtn = document.getElementById("load-plot");
const axisSwapBtn = document.querySelector(".axis-swap-btn");
const axisNameX = document.querySelector("#axis-x-name p");
const axisNameY = document.querySelector("#axis-y-name p");
const modal = document.getElementById("loader-modal");
const loaderText = document.getElementById("loader-text");

let currentPlotData = null;
let flipped = false;

// ——— Loader helpers  ———
function showLoader(msg = "Rendering chart…") {
  loaderText.textContent = msg;
  modal.classList.remove("hidden");
}
function hideLoader() {
  modal.classList.add("hidden");
}

// ——— Download button handler ———
function downloadPlotHandler() {
  downloadPlotBtn.addEventListener("click", () => {
    if (!currentPlotData) return;
    Plotly.downloadImage("plot", {
      format: "png",
      filename: currentPlotData.filename.replace(".csv", ""),
    });
  });
}

// ——— Axis-swap button handler ———
function changeAxisHandler() {
  axisSwapBtn.addEventListener("click", () => {
    if (!currentPlotData) return;
    flipped = !flipped;
    const x = flipped
      ? currentPlotData.data.result
      : currentPlotData.data.index;
    const y = flipped
      ? currentPlotData.data.index
      : currentPlotData.data.result;

    axisNameX.textContent = flipped ? "result" : "index";
    axisNameY.textContent = flipped ? "index" : "result";

    Plotly.react(
      "plot",
      [
        {
          x,
          y,
          mode: "lines+markers",
          type: "scattergl",
          marker: { color: "#476a8a" },
        },
      ],
      {
        xaxis: { title: { text: flipped ? "result" : "index" } },
        yaxis: { title: { text: flipped ? "index" : "result" } },
      },
      { responsive: true }
    );
  });
}

// ——— Render the chart and stats ———
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

  const MAX_POINTS = 50000;
  const xs = data.data.index;
  const ys = data.data.result;
  let xPlot = xs,
    yPlot = ys;

  if (xs.length > MAX_POINTS) {
    const step = Math.ceil(xs.length / MAX_POINTS);
    xPlot = [];
    yPlot = [];
    for (let i = 0; i < xs.length; i += step) {
      xPlot.push(xs[i]);
      yPlot.push(ys[i]);
    }
  }

  const trace = {
    type: "scattergl",
    mode: "lines+markers",
    x: xPlot,
    y: yPlot,
    marker: { color: "#476a8a", size: 3, opacity: 0.6 },
    line: { width: 1 },
  };

  const layout = {
    xaxis: { title: { text: "index" } },
    yaxis: { title: { text: "result" } },
  };

  Plotly.newPlot("plot", [trace], layout, { responsive: true });

  downloadPlotHandler();
  changeAxisHandler();
}

// ——— “Load new file” button handler ———
loadPlotBtn.addEventListener("click", () => {
  window.location.href = "/";
});

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const isExample = params.has("example");

  if (isExample) {
    const preset = sessionStorage.getItem("csvExample");
    if (!preset) {
      showToast("No example data found", "error");
      return;
    }
    const data = JSON.parse(preset);
    showLoader("Rendering example…");
    renderChart(data);
    const plotDiv = document.getElementById("plot");
    plotDiv.on("plotly_afterplot", () => hideLoader());
    return;
  }
  showLoader("Rendering chart…");

  const taskId = params.get("task");
  if (!taskId) {
    showToast("No task ID provided", "error");
    hideLoader();
    return;
  }

  fetch(`/result/${taskId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch result");
      return res.json();
    })
    .then((data) => {
      renderChart(data);

      const plotDiv = document.getElementById("plot");
      const onAfter = () => {
        hideLoader();
        plotDiv.removeListener("plotly_afterplot", onAfter);
      };
      plotDiv.on("plotly_afterplot", onAfter);
    })
    .catch((err) => {
      hideLoader();
      console.error("Error fetching result:", err);
      showToast("Error fetching result: " + err.message, "error");
    });
});
