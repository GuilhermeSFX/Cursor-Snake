// --- Telas ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const btnStart = document.getElementById('btn-start');
const scoreElement = document.getElementById('score');
const soundEat = document.getElementById('sound-eat');
const soundGameOver = document.getElementById('sound-gameover');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScore = document.getElementById("final-score");
const btnRestartOver = document.getElementById("btn-restart-over");

// --- Variáveis do jogo ---
let snake = [];
let snakeLength = 5;
let snakeSpeed = 3;
let mousePos = { x: width / 2, y: height / 2 };
let apples = [];
let obstacles = [];
let score = 0;
let gameInterval;
const segmentSize = 14;

// --- Cor da cobrinha ---
let snakeColor = "#00ff66";
const colorButtons = document.querySelectorAll(".color-btn");
colorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    snakeColor = btn.getAttribute("data-color");
    colorButtons.forEach(b => b.style.border = "2px solid #fff");
    btn.style.border = "3px solid #000";
  });
});

// --- Skin da cabeça ---
let headSkin = new Image();
headSkin.src = "img/pou.png"; // padrão
const skinOptions = document.querySelectorAll(".skin-option");

skinOptions.forEach(option => {
  option.addEventListener("click", () => {
    skinOptions.forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    headSkin.src = option.dataset.src;
  });
});

// --- Iniciar jogo ---
btnStart.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  initGame();
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});

function randomPos(min = 30) {
  let pos;
  let safe = false;
  while (!safe) {
    pos = {
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20
    };
    let d = Math.hypot(snake[0]?.x - pos.x || 0, snake[0]?.y - pos.y || 0);
    if (d > min) safe = true;
  }
  return pos;
}

function spawnApples() {
  while (apples.length < 3) apples.push({ ...randomPos(), size: 10 });
}

function spawnObstacles() {
  obstacles = [];
  for (let i = 0; i < 5; i++) {
    obstacles.push({
      ...randomPos(60),
      size: 15,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    });
  }
}

let obstacleSpeed = 4;
function moveObstacles() {
  obstacles.forEach(o => {
    o.x += o.vx * obstacleSpeed;
    o.y += o.vy * obstacleSpeed;

    if (o.x < o.size || o.x > width - o.size) o.vx *= -1;
    if (o.y < o.size || o.y > height - o.size) o.vy *= -1;
  });
}

function initGame() {
  snake = [{ x: width / 2, y: height / 2 }];
  snakeLength = 5;
  score = 0;
  scoreElement.textContent = score;
  apples = [];
  spawnApples();
  spawnObstacles();
  clearInterval(gameInterval);
  gameInterval = setInterval(update, 20);
}

function update() {
  let head = { ...snake[0] };
  let dx = mousePos.x - head.x;
  let dy = mousePos.y - head.y;
  let dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 1) {
    head.x += (dx / dist) * snakeSpeed;
    head.y += (dy / dist) * snakeSpeed;
  }

  snake.unshift(head);
  while (snake.length > snakeLength) snake.pop();

  // Parede
  if (head.x < 0 || head.x > width || head.y < 0 || head.y > height) return gameOver();

  // Comer maçã
  for (let i = apples.length - 1; i >= 0; i--) {
    let a = apples[i];
    if (Math.abs(head.x - a.x) < segmentSize && Math.abs(head.y - a.y) < segmentSize) {
      apples.splice(i, 1);
      snakeLength += 2;
      score++;
      scoreElement.textContent = score;
      soundEat.currentTime = 0;
      soundEat.play();
    }
  }

  if (apples.length === 0) spawnApples();
  moveObstacles();

  // Obstáculos
  for (let o of obstacles) {
    for (let seg of snake) {
      if (seg.x + segmentSize / 2 > o.x - o.size &&
          seg.x - segmentSize / 2 < o.x + o.size &&
          seg.y + segmentSize / 2 > o.y - o.size &&
          seg.y - segmentSize / 2 < o.y + o.size) {
        return gameOver();
      }
    }
  }

  // Colisão com o próprio corpo
  for (let i = 5; i < snake.length; i++) {
    if (Math.abs(head.x - snake[i].x) < segmentSize / 2 &&
        Math.abs(head.y - snake[i].y) < segmentSize / 2) {
      return gameOver();
    }
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // Obstáculos
  ctx.fillStyle = "#555";
  obstacles.forEach(o => ctx.fillRect(o.x - o.size, o.y - o.size, o.size * 2, o.size * 2));

  // Maçãs
  ctx.fillStyle = "#ff4444";
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 10;
  apples.forEach(a => {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Cobrinha
  snake.forEach((seg, index) => {
    if (index === 0) {
      // Cabeça com imagem
      if (headSkin.complete && headSkin.naturalWidth > 0) {
        ctx.drawImage(
          headSkin,
          seg.x - segmentSize / 2,
          seg.y - segmentSize / 2,
          segmentSize,
          segmentSize
        );
      } else {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, segmentSize / 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = snakeColor;
      ctx.fillRect(
        seg.x - segmentSize / 2,
        seg.y - segmentSize / 2,
        segmentSize,
        segmentSize
      );
    }
  });
}

function gameOver() {
  clearInterval(gameInterval);
  finalScore.textContent = score;
  gameOverOverlay.classList.remove("hidden");

  soundGameOver.currentTime = 0;
  soundGameOver.play();
}

btnRestartOver.addEventListener("click", () => {
  gameOverOverlay.classList.add("hidden");
  initGame();
});
