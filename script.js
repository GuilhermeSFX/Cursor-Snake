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

// --- Variáveis do Jogo ---
let snake = [];
let snakeLength = 5;
let snakeSpeed = 3;
let mousePos = {x: width/2, y: height/2};
let apples = [];
let obstacles = [];
let score = 0;
let gameInterval;

// --- Configurações da cobrinha ---
const baseSegmentSize = 12;
let segmentSize = baseSegmentSize;

// --- Inicializar ---
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
  mousePos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
});

// --- Funções auxiliares ---
function randomPos(minDistFromHead = 30) {
  let pos;
  let safe = false;
  while(!safe){
    pos = {x: Math.random()*width, y: Math.random()*height};
    if(snake.length===0){ safe=true; break; }
    let d = Math.hypot(snake[0].x - pos.x, snake[0].y - pos.y);
    if(d >= minDistFromHead) safe = true;
  }
  return pos;
}

function spawnApples() {
  while(apples.length < 3){
    apples.push({...randomPos(), size:10});
  }
}

function spawnObstacles(){
  obstacles = [];
  for(let i=0;i<5;i++) obstacles.push({
    ...randomPos(50),
    size:15,
    vx:(Math.random()-0.5)*2,
    vy:(Math.random()-0.5)*2
  });
}

function moveObstacles(){
  obstacles.forEach(o=>{
    o.x += o.vx;
    o.y += o.vy;
    if(o.x<o.size || o.x>width-o.size) o.vx*=-1;
    if(o.y<o.size || o.y>height-o.size) o.vy*=-1;
  });
}

// --- Inicializar jogo ---
function initGame(){
  snake = [{x: width/2, y: height/2}];
  snakeLength = 5;
  segmentSize = baseSegmentSize;
  score = 0;
  scoreElement.textContent = score;
  apples = [];
  spawnApples();
  spawnObstacles();
  clearInterval(gameInterval);
  gameInterval = setInterval(update, 20);
}

// --- Atualizar ---
function update(){
  let head = snake[0];

  // Cabeça segue o mouse suavemente
  let dx = mousePos.x - head.x;
  let dy = mousePos.y - head.y;
  let dist = Math.sqrt(dx*dx + dy*dy);
  if(dist > snakeSpeed){
    head.x += dx/dist*snakeSpeed;
    head.y += dy/dist*snakeSpeed;
  }

  // Adiciona segmento
  snake.unshift({x: head.x, y: head.y});
  while(snake.length>snakeLength) snake.pop();

  // Colisão com parede
  if(head.x<0 || head.x>width || head.y<0 || head.y>height) return gameOver();

  // --- Comer maçã ---
  for(let i=apples.length-1;i>=0;i--){
    let a = apples[i];
    if(Math.abs(head.x - a.x)<segmentSize && Math.abs(head.y - a.y)<segmentSize){
      apples.splice(i,1);
      snakeLength++;
      segmentSize += 1.5;
      score++;
      scoreElement.textContent = score;
    }
  }

  if(apples.length===0){
    spawnApples();
    spawnObstacles();
  }

  // --- Colisão com obstáculos ---
  moveObstacles();
  for(let ob of obstacles){
    if(Math.abs(head.x - ob.x)<segmentSize+ob.size && Math.abs(head.y - ob.y)<segmentSize+ob.size)
      return gameOver();
  }

  // --- Colisão consigo mesma ---
  if(snake.length>5){
    let ignore = Math.floor(snakeLength/2);
    for(let i=ignore;i<snake.length;i++){
      let seg = snake[i];
      if(Math.abs(head.x - seg.x)<segmentSize && Math.abs(head.y - seg.y)<segmentSize)
        return gameOver();
    }
  }

  draw();
}

// --- Desenhar ---
function draw(){
  ctx.clearRect(0,0,width,height);

  // Obstáculos
  ctx.fillStyle = "#555";
  obstacles.forEach(o=>{
    ctx.fillRect(o.x-o.size, o.y-o.size, o.size*2, o.size*2);
  });

  // Maçãs
  ctx.fillStyle = "#FF5555";
  apples.forEach(a=>{
    ctx.fillRect(a.x-a.size, a.y-a.size, a.size*2, a.size*2);
  });

  // Cobrinha
  ctx.fillStyle = "#00ff00f3";
  snake.forEach(seg=>{
    ctx.fillRect(seg.x-segmentSize/2, seg.y-segmentSize/2, segmentSize, segmentSize);
  });
}

// --- Game Over ---
function gameOver(){
  clearInterval(gameInterval);
  alert("Game Over! Pontos: "+score);
  initGame();
}
