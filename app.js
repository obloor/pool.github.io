let gameActive = false;
let toySpawnInterval;
let score = 0;
let lastTimeStamp = 0;
let tick = 0;
let gameStartTime;
const gameDuration = 60 * 1000; 
let balls = [];
let index = 0;
let timeLeft = 60;
let timerInterval;
let elapsedTime = 0;

const backgroundMusic = new Audio("./assets/water-noises-241049.mp3");
const happySound = new Audio("./assets/90s-game-ui-6-185099.mp3");
const gameFinished = new Audio("./assets/game-over-classic-206486.mp3");
const sadSound = new Audio("./assets/game-over-arcade-6435.mp3");
backgroundMusic.loop = true;

let Slider = document.getElementById("Slider");
backgroundMusic.volume = Slider.value;
happySound.volume = Slider.value;
sadSound.volume = Slider.value;
gameFinished.volume = Slider.value;

Slider.addEventListener("input", function() {
    backgroundMusic.volume = this.value;
    happySound.volume = this.value;
    sadSound.volume = this.value;
    gameFinished.volume = this.value;
});

backgroundMusic.addEventListener("play", () => {
    backgroundMusic.volume = Slider.value;
});

const backgroundImage = new Image();
backgroundImage.src = "./assets/athlete-athletic-blue-water-california-8686119.jpeg";

function start() {
    if (gameActive) return; 
    gameActive = true;
    timeLeft = 60; 
    elapsedTime = 0;
    score = 0;
    gameStartTime = Date.now();
    backgroundMusic.play();
    updateScore();
    updateTimer();
    balls = []; 
    initializeBalls(); 
    toySpawnInterval = setInterval(randomBallLaunch, 2000);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) end();
    }, 1000);

    window.requestAnimationFrame(run);
}

function restart() {
    clearInterval(toySpawnInterval);
    balls = []; 
    score = 0; 
    gameActive = false;
    character.position = [canvas.width / 2, canvas.height / 2];
    initializeBalls();
    start();
}

function end() {
    if (!gameActive) return; 
    gameActive = false;   
    clearInterval(toySpawnInterval);
    clearInterval(timerInterval); 
    backgroundMusic.pause();
    gameFinished.play();
    alert("Game Over! You collected " + score + " toys.");
}

function initializeBalls() {
    const colors = ["green", "red", "blue", "yellow", "orange", "white", "black", "purple", "pink", "gray"];
    const canvasWidth = 1280; 
    const canvasHeight = 720; 

    for (let i = 0; i < 50; i++) {
        let x, y;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: 
                x = -20;
                y = Math.random() * canvasHeight;
                break;
            case 1: 
                x = canvasWidth + 20;
                y = Math.random() * canvasHeight;
                break;
            case 2: 
                x = Math.random() * canvasWidth;
                y = -20;
                break;
            case 3: 
                x = Math.random() * canvasWidth;
                y = canvasHeight + 20;
                break;
        }
        balls.push(new Ball(x, y, 20, colors[i % colors.length]));
    }
}

function randomBallLaunch() {
    const availableBalls = balls.filter(ball => ball.state === "ready");
    if (availableBalls.length === 0) return;

    const spawnCount = 1; 
    
    for (let i = 0; i < Math.min(spawnCount, availableBalls.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableBalls.length);
        const ball = availableBalls[randomIndex];
        const destinationX = Math.random() * (canvas.width - ball.radius * 2) + ball.radius;
        const destinationY = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
        ball.launch(destinationX, destinationY);
    }
}

window.addEventListener("load", () => {
    load();
    initializeBalls();
    document.getElementById("startButton").addEventListener("click", start);
    document.getElementById("restartButton").addEventListener("click", restart);
});

const characterSpriteSheet = new Image();
characterSpriteSheet.src = "./assets/spritesheet (2).png";
characterSpriteSheet.onload = load;
backgroundMusic.loop = true;
// canvas and context, not const as we don't set the value until document ready
let canvas;
let context;
let character;
const awaitLoadCount = 3;
let loadCount = 0;

function updateScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.innerHTML = 'Score: ' + score; 
}

function updateTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timeRemaining = Math.max(0, (gameDuration - elapsedTime) / 1000);
    timerDisplay.innerHTML = 'Time: ' + Math.ceil(timeRemaining);
}

window.addEventListener("load", () => {
    load();
    document.getElementById("startButton").addEventListener("click", start);
    document.getElementById("restartButton").addEventListener("click", restart);
});

function load() {
    loadCount++;
    console.log("load " + loadCount);
    if (loadCount >= awaitLoadCount) {
        init();
    }
}

// initialise canvas and game elements
function init() {
    console.log("init");
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    
    character = new Character(
        characterSpriteSheet,
        [64, 64],
        [ 
            [ // Walk up track
                [390, 0], [455, 0]
            ],
            [ // Walk down track 
                [0, 0], [64, 0]
            ],
            [ // Walk left track
                [128, 0], [192, 0]
            ],
            [ // Walk right track 
                [260, 0], [325, 0]
            ],
        ], 
        1
    );
    character.init(); 

    document.addEventListener("keydown", doKeyDown);
    document.addEventListener("keyup", doKeyUp);

    setInterval(randomBallLaunch, 2000);
    window.requestAnimationFrame(run);
}

function run(timeStamp) {
    if (!gameActive) return;

    tick = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    elapsedTime += tick;

    character.update(tick);
    update(); 
    draw(); 

    updateTimer();
    updateScore();

    if (elapsedTime >= gameDuration) {
        end();
        return;
    }
    window.requestAnimationFrame(run);
}

function update() {
    balls.forEach((ball) => {
        ball.update(tick);
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); 
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); 
    character.draw(context); 
    balls.forEach((ball) => ball.draw(context));
}

function Ball(X, Y, radius, colour) {
    return {
        position: { x: X, y: Y },
        radius: radius,
        originalRadius: radius, 
        colour: colour,
        origin: { x: X, y: Y },
        target: null,
        launchTime: 1000,
        stayTime: 5000,
        returnTime: 5000,
        launchTimeDelta: 0,
        stayTimeDelta: 0,
        returnTimeDelta: 0,
        state: "ready",

        update: function (tick) {
            switch (this.state) {
                case "launch":
                    this.launchTimeDelta += tick;
                    if (this.launchTimeDelta >= this.launchTime) {
                        this.state = "stay";
                        this.launchTimeDelta = 0;
                        this.finalRadius = this.radius; 
                    } else {
                        let progress = this.launchTimeDelta / this.launchTime;
                        this.position = lerpVector(this.origin, this.target, easeOut(progress));
                        this.radius = this.originalRadius * (1 - 0.5 * progress);
                    }
                    break;
                case "stay":
                    this.stayTimeDelta += tick;
                    if (this.stayTimeDelta >= this.stayTime) {
                        this.state = "return";
                        this.stayTimeDelta = 0;
                    }
                    break;
                case "return":
                    this.returnTimeDelta += tick;
                    if (this.returnTimeDelta >= this.returnTime) {
                        this.state = "ready";
                        this.position = { ...this.origin };
                        this.returnTimeDelta = 0;
                        this.radius = this.originalRadius; 
                    } else {
                        let progress = this.returnTimeDelta / this.returnTime;
                        this.position = lerpVector(this.target, this.origin, easeIn(progress));
                        this.radius = lerp(this.finalRadius, this.originalRadius, easeIn(progress));
                    }
                    break;
            }
        },
        
        draw: function (context) {
            const gradient = context.createRadialGradient(
                this.position.x, 
                this.position.y, 
                0,              
                this.position.x, 
                this.position.y, 
                this.radius     
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 255)'); 
            gradient.addColorStop(1, this.colour); 
            context.fillStyle = gradient; 
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
        },

        launch: function (destinationX, destinationY) {
            this.target = { x: destinationX, y: destinationY };
            this.state = "launch";
        },
    };
}

function lerp(origin, destination, time) {
    return origin + (destination - origin) * time;
}

function lerpVector(origin, destination, time) {
    let position = {
        x: lerp(origin.x, destination.x, time),
        y: lerp(origin.y, destination.y, time)
    };
    return position;
}

// Easing functions. See here: https://easings.net/
function easeOut(time) {
    return 1 - Math.pow(1 - time, 3);
}

function easeIn(time) {
    return Math.pow(time, 3);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function doKeyDown(e) {
    e.preventDefault();
    if (character != undefined) { character.doKeyInput(e.key, true); }
}

function doKeyUp(e) {
    e.preventDefault();
    if (character != undefined) { character.doKeyInput(e.key, false); }
}

function Character(spritesheet, spriteSize, spriteFrames, spriteScale) {
    return {
        spriteSheet: spritesheet,
        spriteFrameSize: spriteSize,
        spriteFrames: spriteFrames,
        spriteScale: spriteScale,
        spriteCanvasSize: spriteSize,
        animationTrack: 0,
        animationFrame: 0,
        frameTime: 125,
        timeSinceLastFrame: 0,
        position: [0, 0],
        direction: [0, 0],
        velocity: 0.4,

        init() {
            this.spriteCanvasSize = [
                this.spriteFrameSize[0] * this.spriteScale,
                this.spriteFrameSize[1] * this.spriteScale
            ];
        },
        action(action) {
            if (action === this.lastAction) return;

            switch (action) {
                case "moveLeft":
                    this.animationTrack = 2;
                    this.animationFrame = 0;
                    this.direction[0] = -this.velocity;
                    break;
                case "moveRight":
                    this.animationTrack = 3;
                    this.animationFrame = 0;
                    this.direction[0] = this.velocity;
                    break;
                case "moveUp":
                    this.animationTrack = 0;
                    this.animationFrame = 0;
                    this.direction[1] = -this.velocity;
                    break;
                case "moveDown":
                    this.animationTrack = 1;
                    this.animationFrame = 0;
                    this.direction[1] = this.velocity;
                    break;
                case "noMoveHorizontal":
                    this.direction[0] = 0;
                    this.animationFrame = 0;
                    break;
                case "noMoveVertical":
                    this.direction[1] = 0;
                    this.animationFrame = 0;
                    break;
                default:
                    this.direction = [0, 0];
                    break;
            }
            this.lastAction = action;
        },

        collectToy() {
            let toyCollected = false;
            balls.forEach((toy, index) => {
                if (
                    toy.state !== "collected" &&
                    this.position[0] < toy.position.x + toy.radius &&
                    this.position[0] + this.spriteCanvasSize[0] > toy.position.x &&
                    this.position[1] < toy.position.y + toy.radius &&
                    this.position[1] + this.spriteCanvasSize[1] > toy.position.y
                ) {
                    happySound.play();
                    toy.state = "collected";
                    balls.splice(index, 1); 
                    score += 1; //
                    toyCollected = true;
                }
            });
            if (!toyCollected) {
                sadSound.play(); 
            }
        },

        update(tick) {
            this.timeSinceLastFrame += tick;
            if (this.timeSinceLastFrame >= this.frameTime) {
                this.timeSinceLastFrame = 0;

                if (this.direction[0] !== 0 || this.direction[1] !== 0) {
                    this.animationFrame = (this.animationFrame + 1) % this.spriteFrames[this.animationTrack].length;
                }
            }

            this.position[0] += this.direction[0] * tick;
            this.position[1] += this.direction[1] * tick;

            const gameArea = {
                left: 0,
                top: 0,
                right: canvas.width,
                bottom: canvas.height
            };

            if (this.position[0] < gameArea.left) this.position[0] = gameArea.left;
            
            if (this.position[0] + this.spriteCanvasSize[0] > gameArea.right) 
                {this.position[0] = gameArea.right - this.spriteCanvasSize[0];}
            
            if (this.position[1] < gameArea.top) this.position[1] = gameArea.top;
            
            if (this.position[1] + this.spriteCanvasSize[1] > gameArea.bottom) 
                {this.position[1] = gameArea.bottom - this.spriteCanvasSize[1];}
        },

        draw(context) {
            context.drawImage(
                this.spriteSheet,
                this.spriteFrames[this.animationTrack][this.animationFrame][0],
                this.spriteFrames[this.animationTrack][this.animationFrame][1],
                this.spriteFrameSize[0],
                this.spriteFrameSize[1],
                this.position[0],
                this.position[1],
                this.spriteCanvasSize[0],
                this.spriteCanvasSize[1]
            );
        },

        doKeyInput(e, isKeydown = true) {
            switch (e) {
                case "w":
                    if (isKeydown) this.action("moveUp");
                    else this.action("noMoveVertical");
                    break;
                case "a":
                    if (isKeydown) this.action("moveLeft");
                    else this.action("noMoveHorizontal");
                    break;
                case "s":
                    if (isKeydown) this.action("moveDown");
                    else this.action("noMoveVertical");
                    break;
                case "d":
                    if (isKeydown) this.action("moveRight");
                    else this.action("noMoveHorizontal");
                    break;
                case " ":
                    if (isKeydown) {
                        this.collectToy(); 
                    }
                    break;
                default:
                    if (!isKeydown) this.action("stop");
                    break;
            
            };
        }
    }
}