const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variable
const cellSize = 100;
const cellGap = 3;
let numberOfResource = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
let chosenDefender = 1;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resource = [];

// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked:false
}
canvas.addEventListener('mousedown',() => {
    mouse.clicked = true;
})

canvas.addEventListener('mouseup',() => {
    mouse.clicked = false;
})

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', () => {
    mouse.y = undefined;
    mouse.y = undefined;
})
// game board
const controllBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        if(y !== 100 && y !== 500){
            for (let x = 0; x < canvas.width; x += cellSize) {
                gameGrid.push(new Cell(x, y));
            }
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

// projectiles
const projectil1 = new Image();
projectil1.src = './img/Projectile_1.png';
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 150;
        this.power = 20;
        this.speed = 5;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 64;
        this.spriteHeight = 128;
        this.maxFrame = 5;
        this.minFrame = 0;
    }
    update() {
        this.x += this.speed;
        if(frame % 18 === 0){
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.drawImage(projectil1,this.frameX * this.spriteWidth,this.frameY,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height);
        ctx.fill();
    }
}
function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].draw();
        projectiles[i].update();

        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// defenders
const defender1 = new Image();
defender1.src = './img/plant.png';
const defender2 = new Image();
defender2.src = './img/plant2.png';
class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 128;
        this.spriteHeight = 130;
        this.minFrame = 0;
        this.maxFrame = 8;
        this.chosenDefender = chosenDefender;
    }
    draw() {
        ctx.fillStyle = 'gold';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x, this.y);
        if(this.chosenDefender === 1){
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, this.frameY, this.spriteWidth, this.spriteHeight, this.x - 45, this.y - 100, this.width + 100, this.height + 100);
        }else if (this.chosenDefender === 2){
            ctx.drawImage(defender2,  this.frameX * this.spriteWidth, this.frameY, this.spriteWidth, this.spriteHeight, this.x - 45, this.y - 100, this.width + 100, this.height + 100);
        }
    }
    update() {
        if (frame % 8 === 0) {
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if(this.frameX === this.maxFrame) this.shootNow = true;
        }
        if(this.chosenDefender === 1){
            if (this.shooting) {
                this.minFrame = 8;
                this.maxFrame = 16;
            } else {
                this.minFrame = 0;
                this.maxFrame = 7;
            }
        }else if (this.chosenDefender === 2){
            if (this.shooting) {
                this.minFrame = 7;
                this.maxFrame = 16;
            } else {
                this.minFrame = 0;
                this.maxFrame = 6;
            }
        }
        if (this.shooting && this.shootNow) {
            projectiles.push(new Projectile(this.x, this.y - 50));
            this.shootNow = false;
        }
    }
}
function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 0.2
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85,
}

const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85,
}



function chooseDefender() {
    let card1stroke = 'gold';
    let card2stroke = 'black';
    if(collision(mouse,card1) && mouse.clicked){
        chosenDefender = 1;
    }else if (collision(mouse,card2) && mouse.clicked){
        chosenDefender = 2;
    }
    if(chosenDefender === 1) {
        card1stroke = 'gold';
        card2stroke = 'black'
    }else if(chosenDefender === 2){
        card1stroke = 'black';
        card2stroke = 'gold'
    }else{
        card1stroke = 'black';
        card2stroke = 'black';
    }

    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1, 18, 42, 128, 130, 0, 0, 128, 130);
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.drawImage(defender2, 18 , 42, 128, 130, 90, 0, 128 , 130);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
}

// Floating Messages
const floatingMessages = [];
class FloatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.5) this.opacity -= 0.5;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + "px Arial";
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages() {
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

// enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = './img/Monster1.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = './img/Monster2.png';
enemyTypes.push(enemy2);

class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 7;
        this.spriteWidth = 292;
        this.spriteHeight = 410;
    }
    update() {
        this.x -= this.movement;
        if (frame % 10 === 0) {
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 30, this.y);
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;
            floatingMessages.push(new FloatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'black'));
            floatingMessages.push(new FloatingMessage('+' + gainedResources, 250, 50, 30, 'gold'));
            numberOfResource += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.push(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame % enemiesInterval === 0) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        if(verticalPosition !== 103 && verticalPosition !== 503) enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50;
    }
}
// resources
const amounts = [20, 30, 40];
class Resource {
    constructor() {
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize + 0.6;
        this.height = cellSize + 0.6;
        this.amounts = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(this.amounts, this.x + 15, this.y + 15);
    }
}
function handleResources() {
    if (frame % 500 === 0 && score < winningScore) {
        resource.push(new Resource())
    }
    for (let i = 0; i < resource.length; i++) {
        resource[i].draw();
        if (resource[i] && mouse.x && mouse.y && collision(resource[i], mouse)) {
            numberOfResource += resource[i].amounts;
            floatingMessages.push(new FloatingMessage('+' + resource[i].amounts, resource[i].x, resource[i].y, 30, 'black'));
            floatingMessages.push(new FloatingMessage('+' + resource[i].amounts, 250, 50, 30, 'gold'));
            resource.splice(i, 1);
            i--;
        }
    }
}
// utilities
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 180, 40);
    ctx.fillText('Resource: ' + numberOfResource, 180, 80);
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '90px Arial';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0) {
        gameOver = true;
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Arial';
        ctx.fillText('You Win With' + score + 'points!', 134, 34);
    }
}

canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize || gridPositionY === 103 || gridPositionY === 503) return;
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
            return;
    }
    let defenderCost = 100;
    if (numberOfResource >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResource -= defenderCost;
    } else {
        floatingMessages.push(new FloatingMessage("Need More Resources", mouse.x, mouse.y, 15, "blue"))
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, controllBar.width, controllBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate()

function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener('resize', () => {
    canvasPosition = canvas.getBoundingClientRect();
})