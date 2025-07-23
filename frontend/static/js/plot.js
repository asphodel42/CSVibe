function renderChart(data) {
  document.getElementById("file-name").children[0].textContent = data.filename;

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
}

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get("task");
  if (!taskId) {
    alert("No task specified");
    return;
  }
  fetch(`/result/${taskId}`)
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch result");
      return r.json();
    })
    .then(renderChart)
    .catch((err) => alert(err.message));
});
