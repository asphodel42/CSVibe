const BurgerBtn = document.querySelector(".burger-btn");
const Nav = document.querySelector("nav");

BurgerBtn.addEventListener("click", () => {
  BurgerBtn.classList.toggle("active");
  Nav.classList.toggle("active");
});
