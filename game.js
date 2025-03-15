const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

let bird = {
  x: 50,
  y: 200,
  width: 40,
  height: 40,
  velocity: 0,
  gravity: 0.25,
  maxFallSpeed: 5,
}; // Reduced gravity and max fall speed
let pipes = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;
let isGameStarted = false;
let difficultyFactor = 1; // Starts with the easiest difficulty

// Load sounds
let jumpSound = new Audio("jump.mp3");
let hitSound = new Audio("hit.mp3");
let pointSound = new Audio("point.mp3");

// Load images
let birdImage = new Image();
birdImage.src = "m2.png"; // Replace with actual path
let bambooImage = new Image();
bambooImage.src = "m3.png"; // Replace with actual path

// Display high score
document.getElementById("highScore").innerText = `High Score: ${highScore}`;

function drawBird() {
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  pipes.forEach((pipe) => {
    ctx.drawImage(bambooImage, pipe.x, 0, pipe.width, pipe.top); // Top pipe
    ctx.drawImage(
      bambooImage,
      pipe.x,
      canvas.height - pipe.bottom,
      pipe.width,
      pipe.bottom
    ); // Bottom pipe
  });
}

function updateGame() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply gravity and velocity, with a cap on the falling speed
  bird.velocity += bird.gravity;
  if (bird.velocity > bird.maxFallSpeed) bird.velocity = bird.maxFallSpeed; // Prevent falling too fast
  bird.y += bird.velocity;

  if (bird.y + bird.height >= canvas.height) {
    hitSound.play();
    endGame();
  }

  // Pipe movement and collision detection
  pipes.forEach((pipe, index) => {
    pipe.x -= 1; // Reduced speed of pipe movement (makes it easier)

    // If pipe goes off screen, remove it and update score
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
      score++;
      pointSound.play();
      document.getElementById("score").innerText = `Score: ${score}`;
    }

    // Collision check with pipes
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      hitSound.play();
      endGame();
    }
  });

  // Increase the difficulty of the pipes over time
  difficultyFactor = 1 + Math.floor(score / 10); // Increase difficulty as score increases

  // Create new pipes if needed
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    let pipeHeight = Math.floor(Math.random() * (200 + difficultyFactor)) + 50; // Increase pipe height over time
    pipes.push({
      x: canvas.width,
      width: 50,
      top: pipeHeight,
      bottom: canvas.height - pipeHeight - 150,
    });
  }

  drawBird();
  drawPipes();
  requestAnimationFrame(updateGame);
}

function jump() {
  if (gameOver) return;

  if (!isGameStarted) {
    isGameStarted = true;
    updateGame(); // Start the game once the player jumps
  }

  bird.velocity = -6; // Reduced jump force for easier play
  jumpSound.play();
}

function endGame() {
  gameOver = true;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
    document.getElementById("highScore").innerText = `High Score: ${score}`;
  }
  alert(`Game Over! Your Score: ${score}`);
  location.reload(); // Reload the game
}

// Event listener for jumping
document.addEventListener("keydown", jump);

// Wait for images to load before starting the game
birdImage.onload = function () {
  bambooImage.onload = function () {
    // The game is only started once the images are loaded
    if (!isGameStarted) {
      document.getElementById("score").innerText = "Score: 0"; // Initial score
    }
  };
};
