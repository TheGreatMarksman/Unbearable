'use strict';

let initWidth = Math.floor(window.innerWidth * 0.9);
let initHeight = Math.floor(window.innerHeight * 0.9);

const SCREEN_WIDTH = Math.floor(initWidth - (initWidth % 15));
const SCREEN_HEIGHT = Math.floor(initHeight - (initHeight % 15));
const CHARACTER_WIDTH = Math.floor(SCREEN_WIDTH / 15);
const CHARACTER_HEIGHT = CHARACTER_WIDTH;

document.querySelector('#game').style.width=`${SCREEN_WIDTH}px`;
document.querySelector('#game').style.height=`${SCREEN_HEIGHT}px`;

var loops = 0;
var player;
var enemies = [3];
var canvas;
var ctx;
var enemyAnimationCounter = 0;
var oldTimeStamp;


const speed=5;

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
            const sx = (this.frameIndex % this.framesPerRow) * this.frameWidth;//X position in sprite sheet
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
                this.imgPath = "blackBearSprites.png";
        }
        this.image.src = "./assets/sprites/"+this.imgPath;
        this.image.onload = () => {
            this.draw();
        };
    }
    draw() {
        //if moving east
        var frame = Math.floor(enemyAnimationCounter/10);
        if(this.xSpeed > 0) {
            ctx.drawImage(this.image,0 + frame * 32,32*3, 32,32, this.xPos,this.yPos, this.width,this.height);
        }
        if(this.xSpeed < 0){
            ctx.drawImage(this.image,0 + frame * 32,32, 32,32, this.xPos,this.yPos, this.width,this.height);
        }
        if(this.ySpeed < 0) {
            ctx.drawImage(this.image,0 + frame * 32,2*32, 32,32, this.xPos,this.yPos, this.width,this.height);
        }
        if(this.ySpeed > 0){
            ctx.drawImage(this.image,0 + frame * 32 ,0, 32,32, this.xPos,this.yPos, this.width,this.height);
        }
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
        if(this.xPos<0) this.xPos=0;
        if(this.yPos<0) this.yPos=0;
        if(this.xPos + this.width > SCREEN_WIDTH) this.xPos= SCREEN_WIDTH-this.width;
        if(this.yPos + this.height > SCREEN_HEIGHT) this.yPos= SCREEN_HEIGHT- this.height;
        
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

    player = new MainCharacter("assets/sprites/bearSprites.png", CHARACTER_WIDTH, CHARACTER_HEIGHT);


    enemies[0] = new Enemy("default", 10,10,1);
    enemies[1] = new Enemy("default", 10,50,1);
    enemies[2] = new Enemy("default", 50,10,1);
    drawEnemies();


    
 
    

    requestAnimationFrame(gameLoop);//start loop 
    window.addEventListener('keydown',keyMovementDown);//for keydown events
    window.addEventListener('keyup',keyMovementUp);//for keyup events

}



function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    player.draw();
    loops++;
    enemyAnimationCounter++;
    //every 10 loops, enemies choose a new direction
    drawEnemies(loops);
}

setUp();
drawScreen();



function gameLoop(){
    if(loops == 50) {
        chooseEnemiesMove();
        loops = 0;
    }
    if(enemyAnimationCounter == 30) {
        enemyAnimationCounter = 0;
    }
    moveEnemies();
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

