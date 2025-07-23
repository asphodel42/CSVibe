plot = document.getElementById("plot");

var trace = {
  type: "line",
  x: [1, 2, 3, 4, 5],
  y: [1, 2, 4, 8, 16],
};

var data = [trace];
var layout = {
  title: "Sample Plot",
};
var config = {
  responsive: true,
};
Plotly.newPlot(plot, data, layout, config);

console.log(Plotly.BUILD);
