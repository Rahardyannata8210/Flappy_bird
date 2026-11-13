//board
let board;
let boardWidth = 1500;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipa
let pipeArr = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics (DIKEMBALIKAN KE KECEPATAN NORMAL / STANDAR)
let velocityX = -3;     // Kecepatan pipa ke kiri (normal)
let velocityY = 0;      
let gravity = 0.4;      // Gravitasi standar Flappy Bird
let jumpStrength = -7;  // Kekuatan lompat standar

let gameOver = false;
let score = 0;

// Variabel pengunci FPS agar kecepatan konsisten di semua monitor
let lastTime = 0;
let fpsInterval = 1000 / 60; // 60 FPS

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Munculkan pipa setiap 1.5 detik (normal)
    document.addEventListener("keydown", moveBird);
}

function update(timestamp) {
    requestAnimationFrame(update);

    let elapsed = timestamp - lastTime;
    if (elapsed < fpsInterval) {
        return;
    }
    lastTime = timestamp - (elapsed % fpsInterval);

    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipa
    for (let i = 0; i < pipeArr.length; i++) {
        let pipe = pipeArr[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

      if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipa
    while (pipeArr.length > 0 && pipeArr[0].x < -pipeWidth) {
        pipeArr.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px Sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4; // Celah pipa standar

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArr.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArr.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = jumpStrength;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            velocityY = 0;
            pipeArr = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}