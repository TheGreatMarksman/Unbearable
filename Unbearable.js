'use strict';

let initWidth = Math.floor(window.innerWidth * 0.9);
let initHeight = Math.floor(window.innerHeight * 0.9);

const SCREEN_WIDTH = Math.floor(initWidth - (initWidth % 15));
const SCREEN_HEIGHT = Math.floor(initHeight - (initHeight % 15));
const CHARACTER_WIDTH = Math.floor(SCREEN_WIDTH / 15);
const CHARACTER_HEIGHT = CHARACTER_WIDTH;

document.querySelector('#game').style.width=`${SCREEN_WIDTH}px`;
document.querySelector('#game').style.height=`${SCREEN_HEIGHT}px`;

var player;
var canvas;
var ctx;

class MainCharacter{
    constructor(link, xPos, yPos){
        this.xPos=xPos;
        this.yPos=yPos;
        this.width= CHARACTER_WIDTH;
        this.height= CHARACTER_HEIGHT;

        this.image = new Image();
        this.image.src = link;

        //outside draw() so image is drawn once fully loaded and not repeatedly everytime function is called
        this.image.onload = () => {
            this.draw();
        };
    }

    draw(){
        
        if (this.image.complete){
            ctx.drawImage(this.image,this.xPos,this.yPos,this.width,this.height);
        }
        
    }

    move(dx,dy){//dx is change in x, dy is change in y
        console.log('xpos+width'+(this.xPos+this.width));
        console.log('screen width'+SCREEN_WIDTH); 
        console.log('character width'+CHARACTER_WIDTH);
        this.xPos+=dx;
        this.yPos+=dy;



        //make character stay within bound
        if(this.xPos<0) this.xPos=0;
        if(this.yPos<0) this.yPos=0;
        if(this.xPos + this.width > SCREEN_WIDTH) this.xPos= SCREEN_WIDTH-this.width;
        if(this.yPos + this.height > SCREEN_HEIGHT) this.yPos= SCREEN_HEIGHT- this.height;
    }


   
}

class Enemy {
    //img path should be determined by type
    constructor(type, xPos, yPos) {
        this.type = type;
        this.xPos = xPos;
        this.yPos = yPos;
        this.imgPath = "pacmanGhost.png";
    }
    draw() {
        let drawing = new Image();
        drawing.src = "./assets/sprites/" + this.imgPath;
        let x = this.xPos;
        let y = this.yPos;
        drawing.onload = function() {
            ctx.drawImage(drawing, x, y, 50, 50);
            //console.log(x+ " " + y);
        };
    }
}
function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    player = new MainCharacter("assets/sprites/TheBear.png", CHARACTER_WIDTH, CHARACTER_HEIGHT);
    //console.log(SCREEN_WIDTH + " " + SCREEN_HEIGHT);
    //console.log(CHARACTER_WIDTH + " " + CHARACTER_HEIGHT);

    requestAnimationFrame(gameLoop);//start loop 
    window.addEventListener('keydown',keyMovement);//for keydown events
}

function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    player.draw();
}
let ghost = new Enemy("pacmanGhost", 10,10);
setUp();
drawScreen();
ghost.draw();


function gameLoop(){
    drawScreen();
    requestAnimationFrame(gameLoop);//request for the next frame
}

//handles the action due to key presses
function keyMovement(event){
    const speed=6;

    switch(event.key){
        case 'w'://move up
            player.move(0,-speed);
            break;
        case 'a'://move left
            player.move(-speed,0);
            break;
        case 's'://move right
            player.move(0,speed);
            break;
        case 'd'://move down
            player.move(speed,0);
            break;
    }
}