// 复古贪吃蛇 - 可调速度
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const scoreEl = document.getElementById('score');
  const hiscoreEl = document.getElementById('hiscore');
  const speedInput = document.getElementById('speed');
  const speedLabel = document.getElementById('speedLabel');
  const startPauseBtn = document.getElementById('startPause');
  const resetBtn = document.getElementById('reset');
  const headerEl = document.querySelector('.site-header');
  const footerEl = document.querySelector('.site-footer');
  const layoutEl = document.querySelector('.game-layout');
  const panelEl = document.querySelector('.game-panel');

  // 网格参数（逻辑像素）
  const COLS = 24;
  const ROWS = 24;
  const CELL = 24; // canvas 内部单元格像素
  const BORDER = 2; // 蛇体描边宽度
  const W = COLS * CELL;
  const H = ROWS * CELL;
  canvas.width = W;
  canvas.height = H;

  // 颜色
  const COLORS = {
    bg: '#152115',
    grid: '#1f381f',
    snake: '#7CFF7C',
    snakeDark: '#2b7a2b',
    food: '#e74c3c',
    foodLight: '#ffd7d2',
  };

  // 状态
  let snake, dir, nextDir, food, score, hiscore, running, dead;
  let lastTime = 0;
  let accumulator = 0;
  let stepMs = speedToMs(+speedInput.value); // 每步间隔（毫秒）

  function resetGame() {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    // 让蛇的头部精确居中，向右延伸一格
    snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = spawnFood();
    score = 0;
    updateScore();
    dead = false;
    accumulator = 0; // 清零累积时间，避免恢复时瞬移
    overlayMessage('按“开始”或空格键 开始游戏');
    pause();
  }

  function updateScore() {
    scoreEl.textContent = String(score);
    hiscore = Math.max(getHiScore(), score);
    setHiScore(hiscore);
    hiscoreEl.textContent = String(hiscore);
  }

  function getHiScore() {
    const v = localStorage.getItem('snake-hiscore');
    return v ? Number(v) : 0;
  }
  function setHiScore(v) {
    localStorage.setItem('snake-hiscore', String(v));
  }

  function spawnFood() {
    while (true) {
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      if (!snake || !snake.some((s) => s.x === x && s.y === y)) {
        return { x, y };
      }
    }
  }

  // 速度映射：滑块1-10 → 每步毫秒（更大更快）
  function speedToMs(val) {
    // 非线性映射：慢端更细腻，快端更刺激
    // 1 → 260ms，10 → 60ms
    const min = 60;
    const max = 260;
    const t = (val - 1) / 9; // 0..1
    const eased = 1 - Math.pow(1 - t, 1.6);
    return Math.round(max - eased * (max - min));
  }

  function speedLabelText(val) {
    const v = Number(val);
    if (v <= 2) return '很慢';
    if (v <= 4) return '慢';
    if (v <= 6) return '中';
    if (v <= 8) return '快';
    return '很快';
  }

  function overlayMessage(text) {
    overlay.textContent = text;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function start() {
    if (dead) resetGame();
    running = true;
    accumulator = 0; // 开始前清零，确保节奏一致
    hideOverlay();
    startPauseBtn.textContent = '暂停';
  }
  function pause() {
    running = false;
    startPauseBtn.textContent = '开始';
  }
  function toggleRun() {
    running ? pause() : start();
  }

  function steer(nx, ny) {
    // 禁止直接反向
    if (nx === -dir.x && ny === -dir.y) return;
    nextDir = { x: nx, y: ny };
  }

  // 游戏循环
  function frame(time) {
    const dt = time - lastTime;
    lastTime = time;

    if (running && !dead) {
      // 仅在运行时累积时间，避免暂停时“瞬移”到墙
      accumulator += dt;
      let steps = 0;
      while (accumulator >= stepMs && steps < 5) {
        tick();
        accumulator -= stepMs;
        steps++;
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // 撞墙
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      return gameOver();
    }
    // 撞自己
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      return gameOver();
    }

    snake.unshift(head);
    // 吃到食物
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      food = spawnFood();
    } else {
      snake.pop();
    }
  }

  function gameOver() {
    dead = true;
    pause();
    overlayMessage('游戏结束 · 空格键重新开始');
  }

  // 绘制
  function draw() {
    // 背景
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // 网格
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= COLS; x++) {
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, H);
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(W, y * CELL + 0.5);
    }
    ctx.stroke();

    // 食物（像素苹果）
    drawFood(food.x, food.y);

    // 蛇
    for (let i = snake.length - 1; i >= 0; i--) {
      drawSnakeCell(snake[i].x, snake[i].y, i === 0);
    }
  }

  // 让游戏区域在“第一屏”内自适应
  function fitToViewport() {
    // 暂时释放宽度以测量真实可用宽度
    panelEl.style.width = 'auto';
    canvas.style.width = '100%';

    const layoutCS = getComputedStyle(layoutEl);
    const vpad = parseFloat(layoutCS.paddingTop) + parseFloat(layoutCS.paddingBottom);
    const availableHeight = window.innerHeight - headerEl.offsetHeight - footerEl.offsetHeight - vpad - 8; // 余量

    // 网格第一列（游戏面板）的可用宽度
    const availableWidth = panelEl.clientWidth; // 在 auto 时读取

    const size = Math.max(360, Math.min(availableHeight, availableWidth));
    panelEl.style.width = size + 'px';
    canvas.style.width = size + 'px';
  }

  function drawFood(cx, cy) {
    const x = cx * CELL;
    const y = cy * CELL;
    const p = Math.round(CELL * 0.15);
    const s = CELL - p * 2;
    // 身体
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(x + p, y + p, s, s);
    // 高光
    const hl = Math.max(2, Math.round(CELL * 0.12));
    ctx.fillStyle = COLORS.foodLight;
    ctx.fillRect(x + p + 2, y + p + 2, hl, hl);
  }

  function drawSnakeCell(cx, cy, isHead) {
    const x = cx * CELL;
    const y = cy * CELL;
    // 外框（深色描边）
    ctx.fillStyle = COLORS.snakeDark;
    ctx.fillRect(x, y, CELL, CELL);
    // 内部（亮绿）
    ctx.fillStyle = COLORS.snake;
    ctx.fillRect(x + BORDER, y + BORDER, CELL - BORDER * 2, CELL - BORDER * 2);

    if (isHead) {
      // 简单“眼睛”
      const eye = Math.max(2, Math.round(CELL * 0.12));
      ctx.fillStyle = '#0b1f0b';
      const ex = dir.x !== 0 ? (dir.x > 0 ? x + CELL - BORDER - eye - 2 : x + BORDER + 2) : x + (CELL >> 1) - eye;
      const ey = dir.y !== 0 ? (dir.y > 0 ? y + CELL - BORDER - eye - 2 : y + BORDER + 2) : y + (CELL >> 1) - eye;
      ctx.fillRect(ex, ey, eye, eye);
    }
  }

  // 输入
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W': steer(0, -1); break;
      case 'ArrowDown':
      case 's':
      case 'S': steer(0, 1); break;
      case 'ArrowLeft':
      case 'a':
      case 'A': steer(-1, 0); break;
      case 'ArrowRight':
      case 'd':
      case 'D': steer(1, 0); break;
      case ' ': // 空格
        if (dead) { resetGame(); start(); }
        else toggleRun();
        e.preventDefault();
        break;
    }
  });

  // 触摸/拖动控制（简易）
  let touchStart = null;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      steer(dx > 0 ? 1 : -1, 0);
    } else {
      steer(0, dy > 0 ? 1 : -1);
    }
    touchStart = null;
  });

  // 控件
  speedLabel.textContent = speedLabelText(speedInput.value);
  speedInput.addEventListener('input', () => {
    const v = Number(speedInput.value);
    speedLabel.textContent = speedLabelText(v);
    stepMs = speedToMs(v);
  });
  startPauseBtn.addEventListener('click', () => {
    if (dead) { resetGame(); start(); }
    else toggleRun();
  });
  resetBtn.addEventListener('click', () => {
    resetGame();
  });

  // 初次渲染 & 循环
  resetGame();
  fitToViewport();
  requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(frame); });

  // 监听尺寸变化，保证无需滚动即可完整显示
  window.addEventListener('resize', fitToViewport);
  // 当侧栏或字体变化引起布局变化时也自适应
  new ResizeObserver(fitToViewport).observe(layoutEl);
})();
