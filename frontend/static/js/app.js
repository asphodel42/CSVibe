const BurgerBtn = document.querySelector(".burger-btn");
const Nav = document.querySelector("nav");

BurgerBtn.addEventListener("click", () => {
  BurgerBtn.classList.toggle("active");
  Nav.classList.toggle("active");
});

function showToast(message, type = "error", duration = 3000) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  void toast.offsetWidth;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
}
