const BurgerBtn = document.querySelector(".burger-btn");
const Nav = document.querySelector("nav");

BurgerBtn.addEventListener("click", () => {
  BurgerBtn.classList.toggle("active");
  Nav.classList.toggle("active");
});

TESTER = document.getElementById("tester");

Plotly.newPlot(
  TESTER,
  [
    {
      x: [1, 2, 3, 4, 5],
      y: [1, 2, 4, 8, 16],
    },
  ],
  {
    margin: { t: 0 },
  },
  { showSendToCloud: true }
);

console.log(Plotly.BUILD);
