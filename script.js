// --- Telas ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const scoreElement = document.getElementById('score');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const gameOverDiv = document.getElementById("game-over");
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
let snakeColor = "#00ff66"; // padrão
const colorButtons = document.querySelectorAll(".color-btn");
colorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    snakeColor = btn.getAttribute("data-color");
    // Destaque visual do botão selecionado
    colorButtons.forEach(b => b.style.border = "2px solid #fff");
    btn.style.border = "3px solid #000";
  });
});

// --- Iniciar telas ---
btnStart.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  initGame();
});



// --- Mouse ---
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});

// --- Funções de posicionamento ---
function randomPos(min = 30) {
  let pos;
  let safe = false;
  while (!safe) {
    pos = { x: Math.random() * (width - 40) + 20, y: Math.random() * (height - 40) + 20 };
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

let obstacleSpeed = 5;
function moveObstacles() {
  obstacles.forEach(o => {
    o.x += o.vx * obstacleSpeed;
    o.y += o.vy * obstacleSpeed;

    // colisão com bordas
    if (o.x < o.size) { o.x = o.size; o.vx *= -1; }
    if (o.x > width - o.size) { o.x = width - o.size; o.vx *= -1; }
    if (o.y < o.size) { o.y = o.size; o.vy *= -1; }
    if (o.y > height - o.size) { o.y = height - o.size; o.vy *= -1; }
  });
}

// --- Inicialização ---
function initGame() {
  snake = [{ x: width / 2, y: height / 2 }];
  snakeLength = 5;
  score = 0;
  scoreElement.textContent = score;
  apples = [];
  spawnApples();
  spawnObstacles(); // obstáculos iniciam já em movimento
  clearInterval(gameInterval);
  gameInterval = setInterval(update, 20);
}

// --- Atualização do jogo ---
function update() {
  let head = { ...snake[0] };

  // Movimento em direção ao mouse
  let dx = mousePos.x - head.x;
  let dy = mousePos.y - head.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 1) {
    head.x += (dx / dist) * snakeSpeed;
    head.y += (dy / dist) * snakeSpeed;
  }

  snake.unshift(head);
  while (snake.length > snakeLength) snake.pop();

  // Colisão com parede
  if (head.x - segmentSize / 2 < 0 || head.x + segmentSize / 2 > width ||
      head.y - segmentSize / 2 < 0 || head.y + segmentSize / 2 > height) {
    return gameOver();
  }

  // Comer maçã
  for (let i = apples.length - 1; i >= 0; i--) {
    let a = apples[i];
    if (Math.abs(head.x - a.x) < segmentSize && Math.abs(head.y - a.y) < segmentSize) {
      apples.splice(i, 1);
      snakeLength += 2;
      score++;
      scoreElement.textContent = score;
    }
  }

  // Reaparecer maçãs
  if (apples.length === 0) spawnApples();

  // Obstáculos em movimento constante
  moveObstacles();

  // Colisão com obstáculos
  for (let o of obstacles) {
    for (let seg of snake) {
      if (seg.x + segmentSize/2 > o.x - o.size &&
          seg.x - segmentSize/2 < o.x + o.size &&
          seg.y + segmentSize/2 > o.y - o.size &&
          seg.y - segmentSize/2 < o.y + o.size) {
        return gameOver();
      }
    }
  }

  // Colisão consigo mesma
  for (let i = 5; i < snake.length; i++) {
    if (Math.abs(head.x - snake[i].x) < segmentSize / 2 &&
        Math.abs(head.y - snake[i].y) < segmentSize / 2) {
      return gameOver();
    }
  }

  draw();
}

// --- Desenho ---
function draw() {
  ctx.clearRect(0, 0, width, height);

  // Obstáculos
  ctx.fillStyle = "#555";
  obstacles.forEach(o => ctx.fillRect(o.x - o.size, o.y - o.size, o.size * 2, o.size * 2));

  // Maçãs
  apples.forEach(a => {
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Cobrinha com cor selecionada
  ctx.fillStyle = snakeColor;
  snake.forEach(seg => ctx.fillRect(seg.x - segmentSize / 2, seg.y - segmentSize / 2, segmentSize, segmentSize));
}





btnRestartOver.addEventListener("click", () => {
  gameOverDiv.classList.add("hidden");
  initGame();
});

function gameOver() {
  clearInterval(gameInterval);
  finalScore.textContent = score;
  gameOverDiv.classList.remove("hidden");
}
