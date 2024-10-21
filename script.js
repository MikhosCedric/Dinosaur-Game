import { updateGround, setupGround } from "./ground.js";
import { updateclouds, setupclouds } from "./clouds.js";
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js";
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js";

const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;
const SPEED_SCALE_INCREASE = 0.00001;

const worldElem = document.querySelector("[data-world]");
const scoreElem = document.querySelector("[data-score]");
const highscoreElem = document.querySelector("[data-Highscore]");
const startScreenElem = document.querySelector("[data-start-screen]");

let lastTime;
let speedScale;
let score;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [
  { score: 0, time: "0.00" },
  { score: 0, time: "0.00" },
  { score: 0, time: "0.00" },
  { score: 0, time: "0.00" },
  { score: 0, time: "0.00" },
];
let startTime;

setPixelToWorldScale();
window.addEventListener("resize", setPixelToWorldScale);
document.addEventListener("keydown", handleStart, { once: true });

function update(time) {
  if (lastTime == null) {
    lastTime = time;
    startTime = time;
    window.requestAnimationFrame(update);
    return;
  }
  const delta = time - lastTime;

  updateclouds(delta, speedScale);
  updateGround(delta, speedScale);
  updateDino(delta, speedScale);
  updateCactus(delta, speedScale);
  updateSpeedScale(delta);
  updateScore(delta);
  if (checkLose()) return handleLose(time);

  lastTime = time;
  window.requestAnimationFrame(update);
}

function checkLose() {
  const dinoRect = getDinoRect();
  return getCactusRects().some((rect) => isCollision(rect, dinoRect));
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE;
}

function updateScore(delta) {
  score += delta * 0.01;
  scoreElem.textContent = Math.floor(score);
}

function handleStart() {
  lastTime = null;
  speedScale = 1;
  score = 0;
  setupclouds();
  setupGround();
  setupDino();
  setupCactus();
  startScreenElem.classList.add("hide");
  window.requestAnimationFrame(update);
}

function handleLose(time) {
  setDinoLose();
  updateLeaderboard(time);
  showSummaryPopup(time);
  setTimeout(() => {
    document.addEventListener("keydown", handleStart, { once: true });
    startScreenElem.classList.remove("hide");
  }, 100);
}

function updateLeaderboard(endTime) {
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);
  highScores.push({ score: Math.floor(score), time: elapsedTime });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5);
  localStorage.setItem("highScores", JSON.stringify(highScores));
  highscoreElem.innerHTML = `HI ${highScores[0].score}`;
  highscoreElem.innerHTML = `HI ${highScores[0].score}`;
}

function showSummaryPopup(endTime) {
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);
  const summaryElem = document.createElement("div");
  summaryElem.classList.add("summary-popup");
  summaryElem.innerHTML = `
    <div class="summary-content">
      <h2>Game Over</h2>
      <p>Current Score: ${Math.floor(score)}</p>
      <p>Time Elapsed: ${elapsedTime} seconds</p>
      <h3>Leaderboard</h3>
      <p>${highScores
        .map((entry) => `${entry.score} - ${entry.time}s`)
        .join("<br>")}</p>
      <button id="close-summary">Close</button>
    </div>
  `;
  document.body.appendChild(summaryElem);
  document.getElementById("close-summary").addEventListener("click", () => {
    document.body.removeChild(summaryElem);
    document.removeEventListener("keydown", handleClosePopup);
  });
  document.addEventListener("keydown", handleClosePopup);
}

function handleClosePopup(e) {
  if (e.code === "Space") {
    const summaryElem = document.querySelector(".summary-popup");
    if (summaryElem) {
      document.body.removeChild(summaryElem);
    }
  }
}

function setPixelToWorldScale() {
  let worldToPixelScale;
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH;
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
  }

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`;
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`;
}

// Initial highscore display
highscoreElem.innerHTML = `HI ${highScores[0].score}`;
