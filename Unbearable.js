'use strict';

const SCREEN_WIDTH = window.innerWidth - (window.innerWidth % 15);
const SCREEN_HEIGHT = window.innerHeight - (window.innerHeight % 15);
const CHARACTER_WIDTH = SCREEN_WIDTH / 15;
const CHARACTER_HEIGHT = CHARACTER_WIDTH;


var player;
var enemies = [3];
var canvas;
var ctx;
var oldTimeStamp;
class MainCharacter{
    constructor(link, xPos, yPos){
        this.xPos=xPos;
        this.yPos=yPos;

        this.image = new Image();
        this.image.src = link;
    }

    draw(){
        ctx.drawImage(this.image,this.xPos,this.yPos,50,50);
        this.image.onload = () => {
            this.draw();
        };
    }
}

class Enemy {
    //img path should be determined by type
    constructor(type, xPos, yPos,speed) {
        this.type = type;
        this.xPos = xPos;
        this.yPos = yPos;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.speed = speed;
        this.image = new Image();
        this.width = CHARACTER_WIDTH;
        this.height = CHARACTER_HEIGHT;
        switch(type) {
            case "default":
                this.imgPath = "pacmanGhost.png";
        }
        this.image.src = "./assets/sprites/"+this.imgPath;
        this.image.onload = () => {
            this.draw();
        };
    }
    draw() {
        ctx.drawImage(this.image,this.xPos,this.yPos,this.width,this.height);
    }
    //the enemy chooses which direction it will move in
    chooseMove(){
        let choice = Math.floor(Math.random() * (4) + 1);
        switch(choice) {
            //move north
            case 1:
                this.ySpeed = this.speed;
                this.xSpeed = 0;
                break;
            //move south
            case 2:
                this.ySpeed = -this.speed;
                this.xSpeed = 0;
                break;
            //move east
            case 3:
                this.xSpeed = this.speed;
                this.ySpeed = 0; 
                break;
            //move west
            default:
                this.xSpeed = -this.speed;
                this.ySpeed = 0;
        };
    }
    move(){
        this.xPos += this.xSpeed;
        this.yPos += this.ySpeed;
        //if out of bounds, reset location (player gets stuck at walls)
        if(this.xPos > SCREEN_WIDTH) {
            this.xPos = SCREEN_WIDTH;
        }
        if(this.xPos < CHARACTER_WIDTH) {
            this.xPos = CHARACTER_WIDTH;
        }
        if(this.yPos > SCREEN_HEIGHT){
            this.yPos = SCREEN_HEIGHT;
        }
        if(this.yPos < CHARACTER_HEIGHT){
            this.yPos = CHARACTER_HEIGHT;
        }
    }
}

function drawEnemies() {
    enemies.forEach((e)=>e.draw());
}

function moveEnemies(){
    enemies.forEach((e)=>e.move());
}

function chooseEnemiesMove(){
    enemies.forEach((e)=> e.chooseMove());
}
function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    player = new MainCharacter("assets/sprites/TheBear.png", 50, 50);
    enemies[0] = new Enemy("default", 10,10,5);
    enemies[1] = new Enemy("default", 10,50,5);
    enemies[2] = new Enemy("default", 50,10,5);
    drawEnemies();
    requestAnimationFrame(onTimerTick);
}

function onTimerTick(timestamp) {
    drawScreen();
    window.requestAnimationFrame(onTimerTick);
}

let loops = 0;
function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    player.draw();
    loops++;
    //every 10 loops, enemies choose a new direction
    if(loops == 50) {
        chooseEnemiesMove();
        loops = 0;
    }
    moveEnemies();
    drawEnemies();
}

setUp();
drawScreen();
