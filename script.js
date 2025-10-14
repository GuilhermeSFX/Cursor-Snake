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

// --- Iniciar telas ---
btnStart.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  initGame();
});

btnRestart.addEventListener('click', () => {
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
    // mover usando velocidade
    o.x += o.vx * obstacleSpeed;
    o.y += o.vy * obstacleSpeed;

    // colisão com as bordas e inverter direção
    if (o.x < o.size) {
      o.x = o.size;
      o.vx *= -1;
    }
    if (o.x > width - o.size) {
      o.x = width - o.size;
      o.vx *= -1;
    }
    if (o.y < o.size) {
      o.y = o.size;
      o.vy *= -1;
    }
    if (o.y > height - o.size) {
      o.y = height - o.size;
      o.vy *= -1;
    }
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
  spawnObstacles();
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

  // 🔥 Colisão com parede (corrigido)
  if (
    head.x - segmentSize / 2 < 0 ||
    head.x + segmentSize / 2 > width ||
    head.y - segmentSize / 2 < 0 ||
    head.y + segmentSize / 2 > height
  ) {
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

  if (apples.length === 0) {
    spawnApples();
    spawnObstacles();
  }

  // Colisão com obstáculos
  moveObstacles();
  for (let o of obstacles) {
  for (let seg of snake) {
    if (
      seg.x + segmentSize/2 > o.x - o.size &&
      seg.x - segmentSize/2 < o.x + o.size &&
      seg.y + segmentSize/2 > o.y - o.size &&
      seg.y - segmentSize/2 < o.y + o.size
    ) {
      return gameOver();
    }
  }
}

  // Colisão consigo mesma
  for (let i = 5; i < snake.length; i++) {
    if (Math.abs(head.x - snake[i].x) < segmentSize / 2 && Math.abs(head.y - snake[i].y) < segmentSize / 2)
      return gameOver();
  }

  draw();
}

// --- Desenho ---
function draw() {
  ctx.clearRect(0, 0, width, height);

  // Obstáculos
  ctx.fillStyle = "#555";
  obstacles.forEach(o => ctx.fillRect(o.x - o.size, o.y - o.size, o.size * 2, o.size * 2));

  // Maçãs com efeito visual
  apples.forEach(a => {
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Cobrinha quadrada
  ctx.fillStyle = "#00ff66";
  snake.forEach((seg) => {
    ctx.fillRect(seg.x - segmentSize / 2, seg.y - segmentSize / 2, segmentSize, segmentSize);
  });
}

// --- Game Over ---
function gameOver() {
  clearInterval(gameInterval);
  alert(`💀 Acabou pra VC! Pontos: ${score}`);
  initGame();
}
