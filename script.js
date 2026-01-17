const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");
const highScoreEl = document.querySelector("#highScore");
const timeEl = document.querySelector("#time");
const fpsEl = document.querySelector("#fps");

const overlay = document.querySelector("#overlay");
const retryBtn = document.querySelector("#retryBtn");

const finalScore = document.querySelector("#finalScore");
const finalHighScore = document.querySelector("#finalHighScore");
const finalTime = document.querySelector("#finalTime");



const cellSize = 30; 
const SNAKE_STEP_TIME = 100; 


let cols, rows;
let snake, apple;
let dx, dy, nextDx, nextDy;
let canTurn = true;

let score = 0;
let seconds = 0;
let gameRunning = true;

let highScore = localStorage.getItem("highScore") || 0;
highScoreEl.textContent = highScore;


let fpsSmooth = 120;
let fpsPenaltyFrames = 0; 


function resize() {
  const board = document.querySelector(".board");
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);
}
window.addEventListener("resize", resize);
resize();



function resetGame() {
  snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
  dx = 1;
  dy = 0;
  nextDx = dx;
  nextDy = dy;

  score = 0;
  seconds = 0;
  gameRunning = true;

  scoreEl.textContent = 0;
  timeEl.textContent = "00:00";
  overlay.classList.remove("active");

  spawnApple();
}
resetGame();



document.addEventListener("keydown", (e) => {
  if (!canTurn || !gameRunning) return;

  const key = e.key.toLowerCase();
  let turned = false;

  if ((key === "arrowup" || key === "w") && dy === 0) {
    nextDx = 0;
    nextDy = -1;
    turned = true;
  }
  if ((key === "arrowdown" || key === "s") && dy === 0) {
    nextDx = 0;
    nextDy = 1;
    turned = true;
  }
  if ((key === "arrowleft" || key === "a") && dx === 0) {
    nextDx = -1;
    nextDy = 0;
    turned = true;
  }
  if ((key === "arrowright" || key === "d") && dx === 0) {
    nextDx = 1;
    nextDy = 0;
    turned = true;
  }

  if (turned) {
    fpsPenaltyFrames = 6; 
    canTurn = false;
  }
});



setInterval(() => {
  if (!gameRunning) return;

  seconds++;
  timeEl.textContent =
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");
}, 1000);



let lastTime = performance.now();
let lastMoveTime = 0;

function loop(now) {
  const delta = now - lastTime;
  lastTime = now;

  let realFPS = 1000 / delta;

  if (fpsPenaltyFrames > 0) {
    realFPS -= 6; 
    fpsPenaltyFrames--;
  }

  fpsSmooth = fpsSmooth * 0.75 + realFPS * 0.25;
  fpsEl.textContent = "FPS: " + Math.max(0, Math.round(fpsSmooth));

  if (gameRunning && now - lastMoveTime >= SNAKE_STEP_TIME) {
    update();
    lastMoveTime = now;
  }

  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


function update() {
  canTurn = true;
  dx = nextDx;
  dy = nextDy;

  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
  };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= cols ||
    head.y >= rows ||
    snake.some((p) => p.x === head.x && p.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score++;
    scoreEl.textContent = score;
    spawnApple();
  } else {
    snake.pop();
  }
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, rows * cellSize);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(cols * cellSize, y * cellSize);
    ctx.stroke();
  }

  drawApple();
  drawSnake();
}


function drawSnake() {
  ctx.fillStyle = "#f0f0f0";
  snake.forEach((part) => {
    ctx.fillRect(part.x * cellSize, part.y * cellSize, cellSize, cellSize);
  });
}


function drawApple() {
  const cx = apple.x * cellSize + cellSize / 2;
  const cy = apple.y * cellSize + cellSize / 2;
  const r = cellSize / 2 - 2;

  // Body
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy - r - 5);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = "#43a047";
  ctx.beginPath();
  ctx.ellipse(cx + 5, cy - r - 4, 5, 3, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
}


function spawnApple() {
  apple = {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
  };
}


function gameOver() {
  gameRunning = false;

  highScore = Math.max(highScore, score);
  localStorage.setItem("highScore", highScore);
  highScoreEl.textContent = highScore;

  finalScore.textContent = score;
  finalHighScore.textContent = highScore;
  finalTime.textContent = timeEl.textContent;

  overlay.classList.add("active");
}


retryBtn.onclick = resetGame;
