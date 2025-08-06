let player, cursors, logos, score = 0, lives = 3, timeLeft = 30;
let scoreTextEl, timeTextEl, livesTextEl;
let dropTimer, timerEvent, bgm, gameStarted = false;
let selectedSkin, highScore = localStorage.getItem('ethos_highscore') || 0;
let leftPressed = false, rightPressed = false;

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: window.innerHeight,
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 200 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'background.png');
  this.load.image('player', 'player.png');
  this.load.image('player2', 'player2.png');
  this.load.image('player3', 'player3.png');
  this.load.image('ethos', 'ethos1.png');
  this.load.audio('bgm', 'bgm.mp3');
  this.load.audio('catch', 'catch.wav');
}

function create() {
  this.add.image(240, config.height / 2, 'background').setDisplaySize(480, config.height);
  bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
  this.catchSound = this.sound.add('catch');

  selectedSkin = document.getElementById('skinSelect').value.replace('.png', '');
  player = this.physics.add.sprite(240, config.height - 100, selectedSkin).setScale(0.1);
  player.setCollideWorldBounds(true);

  logos = this.physics.add.group();
  cursors = this.input.keyboard.createCursorKeys();
  scoreTextEl = document.getElementById('scoreText');
  livesTextEl = document.getElementById('livesText');
  timeTextEl = document.getElementById('timeText');

  this.physics.add.overlap(player, logos, catchLogo, null, this);

  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: () => {
      if (!gameStarted) return;
      timeLeft--;
      timeTextEl.textContent = timeLeft;
      if (timeLeft <= 0) levelUp.call(this);
    },
    loop: true
  });

  dropTimer = this.time.addEvent({
    delay: 1200,
    callback: () => {
      if (!gameStarted) return;
      const x = Phaser.Math.Between(30, 450);
      const obj = logos.create(x, 0, 'ethos');
      obj.setVelocityY(150 + (score / 10));
      obj.setScale(0.1);
    },
    loop: true
  });

  // Tombol HP
  document.getElementById('leftBtn').addEventListener('touchstart', () => leftPressed = true);
  document.getElementById('leftBtn').addEventListener('touchend', () => leftPressed = false);
  document.getElementById('rightBtn').addEventListener('touchstart', () => rightPressed = true);
  document.getElementById('rightBtn').addEventListener('touchend', () => rightPressed = false);

  document.getElementById('startButton').onclick = () => {
    selectedSkin = document.getElementById('skinSelect').value.replace('.png', '');
    player.setTexture(selectedSkin);
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    bgm.play();
  };
}

function update() {
  if (!gameStarted) return;

  if (cursors.left.isDown || leftPressed) {
    player.setVelocityX(-250);
  } else if (cursors.right.isDown || rightPressed) {
    player.setVelocityX(250);
  } else {
    player.setVelocityX(0);
  }

  logos.getChildren().forEach(obj => {
    if (obj.y > config.height) {
      obj.destroy();
      lives--;
      livesTextEl.textContent = lives;
      if (lives <= 0) gameOver.call(this);
    }
  });
}

function catchLogo(player, obj) {
  obj.destroy();
  score += 10;
  scoreTextEl.textContent = score;
  this.catchSound.play();
}

function levelUp() {
  timeLeft = 30;
  dropTimer.delay = Math.max(400, dropTimer.delay - 100);
}

function gameOver() {
  gameStarted = false;
  bgm.stop();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ethos_highscore', highScore);
  }
  document.getElementById('highScoreDisplay').textContent = highScore;
  document.getElementById('gameOverScreen').style.display = 'flex';
}
