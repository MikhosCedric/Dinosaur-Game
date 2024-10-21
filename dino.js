import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./update.js";

const dinoElem = document.querySelector("[data-dino]");
const JUMP_SPEED = 0.4;
const GRAVITY = 0.0015;
const FALL_SPEED = 0.01;
const DINO_FRAME_COUNT = 2;
const FRAME_TIME = 100;
let gameSound = new Audio("audio/press_sound.mp3");
gameSound.volume = 0.5;
let Collisionsound = new Audio("audio/hit_sound.mp3");
Collisionsound.volume = 0.5;

let isJumping;
let isFallingFast;
let dinoFrame;
let currentFrameTime;
let yVelocity;
export function setupDino() {
  isJumping = false;
  isFallingFast = false;
  dinoFrame = 0;
  currentFrameTime = 0;
  yVelocity = 0;
  setCustomProperty(dinoElem, "--bottom", 0);
  document.removeEventListener("keydown", onJump);
  document.addEventListener("keydown", onJump);
}

export function updateDino(delta, speedScale) {
  handleRun(delta, speedScale);
  handleJump(delta);
}

export function getDinoRect() {
  const rect = dinoElem.getBoundingClientRect();
  return {
    top: rect.top + 10,
    left: rect.left + 100,
    bottom: rect.bottom - 10,
    right: rect.right - 100,
  };
}

export function setDinoLose() {
  dinoElem.src = "images/raptor-dead.png";
  Collisionsound.play();
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    dinoElem.src = `images/raptor-idle1.png`;
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT;
    dinoElem.src = `images/raptor-run-${dinoFrame}.png`;
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

function handleJump(delta) {
  if (isJumping) {
    dinoElem.src = `images/raptor-jump.png`;
  }

  if (!isJumping) return;

  incrementCustomProperty(dinoElem, "--bottom", yVelocity * delta);

  if (getCustomProperty(dinoElem, "--bottom") <= 0) {
    setCustomProperty(dinoElem, "--bottom", 0);
    isJumping = false;
    isFallingFast = false;
  }

  yVelocity -= (isFallingFast ? FALL_SPEED : GRAVITY) * delta;
}

function onJump(e) {
  if (e.code !== "Space") return;

  if (isJumping && !isFallingFast) {
    isFallingFast = true;
  } else if (!isJumping) {
    yVelocity = JUMP_SPEED;
    isJumping = true;
    gameSound.play();
  }
}
