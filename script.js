
const noButton = document.getElementById("noButton");
const yesButton = document.getElementById("yesButton");

const codeScreen = document.getElementById("codeScreen");
const secretCode = document.getElementById("secretCode");
const checkCode = document.getElementById("checkCode");
const codeMessage = document.getElementById("codeMessage");

// Тугмаи «Не хочу» мегурезад
function moveNoButton() {
  const padding = 16;

  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;

  const maxX = Math.max(
    padding,
    window.innerWidth - buttonWidth - padding
  );

  const maxY = Math.max(
    padding,
    window.innerHeight - buttonHeight - padding
  );

  const x = padding + Math.random() * Math.max(0, maxX - padding);
  const y = padding + Math.random() * Math.max(0, maxY - padding);

  noButton.style.position = "fixed";
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
  noButton.style.zIndex = "1000";
}

noButton.addEventListener("pointerenter", moveNoButton);

noButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });

noButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

// Тугмаи «Дальше» экрани рамзро мекушояд
yesButton.addEventListener("click", () => {
  codeScreen.hidden = false;
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    secretCode.focus();
  }, 100);
});

// Санҷиши рамзи махфӣ
function verifyCode() {
  const enteredCode = secretCode.value.trim();

  if (enteredCode !== "01042025") {
    codeMessage.textContent =
      "Неверный код. Попробуй ещё раз ❤️";

    secretCode.value = "";
    secretCode.focus();
    return;
  }

  // Пешгирӣ аз пахши такрорӣ
  if (document.body.classList.contains("burst-active")) {
    return;
  }

  document.body.classList.add("burst-active");
  checkCode.disabled = true;
  secretCode.disabled = true;

  codeMessage.textContent =
    "Для тебя начинается что-то особенное… ❤️";

  // Cinematic transition
const transition = document.createElement("div");
transition.className = "cinematic-transition";
transition.setAttribute("aria-hidden", "true");

const light = document.createElement("div");
light.className = "cinematic-light";

transition.appendChild(light);
document.body.appendChild(transition);

requestAnimationFrame(() => {
  transition.classList.add("active");
  codeScreen.classList.add("leaving");
});

setTimeout(() => {
  sessionStorage.setItem("cinematicTransition", "1");
  window.location.href = "next.html";
}, 1400);
}

checkCode.addEventListener("click", verifyCode);

secretCode.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    verifyCode();
  }
});

checkCode.addEventListener("click", verifyCode);

secretCode.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    verifyCode();
  }
});
