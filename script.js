const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const magnetButton = document.getElementById('magnet-btn');

const gridSize = 15;
const cellSize = canvas.width / gridSize;

let snake = [{ x: 7, y: 7 }];
let score = 0;
let mousePos = { x: 7, y: 7 };
let apples = [];
let obstacles = [];
let magnetActive = false;

// Gera posições aleatórias
function randomPos() {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
}

// Inicializa maçãs e obstáculos
function initGame() {
  apples = Array.from({ length: 3 }, randomPos);
  obstacles = Array.from({ length: 5 }, randomPos);
}
initGame();

// Atualiza posição do mouse
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  mousePos = {
    x: Math.floor(x / cellSize),
    y: Math.floor(y / cellSize)
  };
});

// Muda obstáculos a cada 15s
setInterval(() => {
  obstacles = Array.from({ length: 5 }, randomPos);
}, 15000);

// Ativa ímã (dura 5 segundos)
magnetButton.addEventListener('click', () => {
  if (magnetActive) return;
  magnetActive = true;
  magnetButton.disabled = true;
  setTimeout(() => {
    magnetActive = false;
    magnetButton.disabled = false;
  }, 5000);
});

// Atualiza jogo
function update() {
  const head = snake[0];
  let dx = mousePos.x - head.x;
  let dy = mousePos.y - head.y;
  if (dx !== 0) head.x += Math.sign(dx) * 0.2;
  if (dy !== 0) head.y += Math.sign(dy) * 0.2;

  // Colisão com maçã
  apples.forEach((apple, i) => {
    const dist = Math.hypot(apple.x - head.x, apple.y - head.y);
    const attraction = magnetActive ? 0.2 : 0;

    if (magnetActive && dist < 5) {
      apple.x -= (apple.x - head.x) * attraction;
      apple.y -= (apple.y - head.y) * attraction;
    }

    if (dist < 0.5) {
      score++;
      scoreElement.textContent = score;
      apples[i] = randomPos();
      snake.push({ ...snake[snake.length - 1] });
    }
  });

  // Crescimento
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i].x += (snake[i - 1].x - snake[i].x) * 0.3;
    snake[i].y += (snake[i - 1].y - snake[i].y) * 0.3;
  }
}

// Desenha tudo
function draw() {
  // Fundo xadrez
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#111' : '#222';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Obstáculos
  ctx.fillStyle = '#ff3333';
  obstacles.forEach(o => {
    ctx.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize);
  });

  // Maçãs
  ctx.fillStyle = '#ff0000';
  apples.forEach(a => {
    ctx.beginPath();
    ctx.arc(
      a.x * cellSize + cellSize / 2,
      a.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // Cobrinha
  ctx.fillStyle = '#00ff00';
  snake.forEach((s, i) => {
    const size = cellSize * (0.9 - i * 0.05);
    ctx.fillRect(
      s.x * cellSize + cellSize * 0.05,
      s.y * cellSize + cellSize * 0.05,
      size,
      size
    );
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
