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

const speed=1;

let direction = {
    up: false,
    down: false,
    left: false,
    right: false
}

class MainCharacter{
    constructor(link, xPos, yPos){
        this.xPos=xPos;
        this.yPos=yPos;
        this.width= CHARACTER_WIDTH;
        this.height= CHARACTER_HEIGHT;

        this.image = new Image();
        this.image.src = link;

        //sprite image
        this.frameHeight= 32;//height of single frame
        this.frameWidth= 32;//width of single frame
        this.numFrames= 16;//total number of frames
        this.frameIndex= 0;
        this.framesPerRow= 4;
        this.directionRow=0;
        
        this.frameCounter=0;//to count the frame

        //outside draw() so image is drawn once fully loaded and not repeatedly everytime function is called
        this.image.onload = () => {
            this.draw();
        };
    }


    draw(){
        
        
        if (this.image.complete) {
            // Calculate the position of the current frame in the sprite sheet
            const sx = (this.frameIndex % this.framesPerRow) * this.frameWidth;git//X position in sprite sheet
            const sy = this.directionRow* this.frameHeight;//Y position based on the movement direction
            
            // Draw the current frame from the sprite sheet
            ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, this.xPos, this.yPos, this.width, this.height);
        }


    }

    move(){

        if (direction.up){
            this.directionRow = 2; //the 3rd row of sprite sheet
            this.yPos -= speed;
        }else if (direction.down){
            this.directionRow = 0; //the 1st row of sprite sheet
            this.yPos += speed;
        } else if (direction.right){
            this.directionRow = 3; //the 4th row of the sprite sheet
            this.xPos += speed;

        } else if (direction.left){
            this.directionRow = 1; //the 2nd row of the sprite sheet
            this.xPos -= speed;
        }

        
        if (direction.up || direction.down || direction.left || direction.right) {
            this.frameCounter++;
            if (this.frameCounter == 10){// cycle through based on counter
                this.frameIndex = (this.frameIndex + 1) % this.framesPerRow;// Cycle through 4 frames
                this.frameCounter=0;
            }
            
        }

        
        //to prioritize certain movement
        if (direction.up) this.yPos-= speed;
        else if (direction.down) this.yPos+=speed;
        else if (direction.left) this.xPos-=speed;
        else if (direction.right) this.xPos+=speed;


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
    player = new MainCharacter("assets/sprites/bearSprites.png", CHARACTER_WIDTH, CHARACTER_HEIGHT);
    

    requestAnimationFrame(gameLoop);//start loop 
    window.addEventListener('keydown',keyMovementDown);//for keydown events
    window.addEventListener('keyup',keyMovementUp);//for keyup events
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
    player.move();
    drawScreen();
    requestAnimationFrame(gameLoop);//request for the next frame
}

//handles the action due to key presses down
function keyMovementDown(event){
    

    switch(event.key){
        case 'w'://move up
            direction.up= true;
            break;
        case 'a'://move left
            direction.left= true;
            break;
        case 's'://move down
            direction.down= true;
            break;
        case 'd'://move right
            direction.right= true;
            break;
    }
}

//handles the action due to key presses up
function keyMovementUp(event){

    switch(event.key){
        case 'w'://stop moving up
            direction.up=false;
            break;
        case 'a'://stop moving left
            direction.left=false;
            break;
        case 's'://stop moving down
            direction.down=false;
            break;
        case 'd'://stop moving right
            direction.right=false;
            break;
    }
}