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

        this.hunger=0;

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

class Item{
    constructor(link,xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = CHARACTER_WIDTH; // Apples are the same size as the character
        this.height = CHARACTER_HEIGHT;
        

        // Sprite image details (2x2 grid)
        this.frameHeight = 32; // height of a single frame
        this.frameWidth = 32;  // width of a single frame
        this.numFrames = 4;    // 2 frames per row
        this.frameIndex = 0;
        this.framesPerRow = 2; // 2 frames in each row

        this.frameCounter = 0; // To control animation speed

        this.image = new Image();
        this.image.src = link; // an item image

        this.image.onload = () => {
            this.draw();
        };
    }

    draw() {
        if (this.image.complete) {

            // Calculate the position of the current frame in the sprite sheet
            const sx = (this.frameIndex % this.framesPerRow) * this.frameWidth; // X position in sprite sheet
            const sy = Math.floor(this.frameIndex / this.framesPerRow) * this.frameHeight; // Y position based on frame row

            ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight,this.xPos, this.yPos,this.width,this.height);
        }
    }

    updateFrame() {
        this.frameCounter++;
        if (this.frameCounter >= 20) { // Adjust this value to control animation speed
            this.frameIndex = (this.frameIndex + 1) % this.numFrames; // Cycle through 4 frames
            this.frameCounter = 0;
        }
    }

}

let apples = []; // To store the apple objects

function generateApples(numApples) {
    // for (let i = 0; i < numApples; i++) {//loop through to display each apple
    //     let xPos = Math.floor(Math.random() * (SCREEN_WIDTH - CHARACTER_WIDTH));
    //     let yPos = Math.floor(Math.random() * (SCREEN_HEIGHT - CHARACTER_HEIGHT));
    //     apples.push(new Item("assets/sprites/appleSprites.png",xPos, yPos));// Add a new apple at a random position
    // }
    for (let i = 0; i < numApples; i++) {
        let xPos, yPos;
        let overlapping;

        // Ensure apples do not spawn overlapping the player or other apples
        do {
            overlapping = false;
            xPos = Math.floor(Math.random() * (SCREEN_WIDTH - CHARACTER_WIDTH));
            yPos = Math.floor(Math.random() * (SCREEN_HEIGHT - CHARACTER_HEIGHT));

            // Check overlap with player
            if (
                player &&
                player.xPos < xPos + CHARACTER_WIDTH &&
                player.xPos + player.width > xPos &&
                player.yPos < yPos + CHARACTER_HEIGHT &&
                player.yPos + player.height > yPos
            ) {
                overlapping = true;
                continue;
            }

            // Check overlap with existing apples
            for (let apple of apples) {
                if (
                    apple.xPos < xPos + CHARACTER_WIDTH &&
                    apple.xPos + apple.width > xPos &&
                    apple.yPos < yPos + CHARACTER_HEIGHT &&
                    apple.yPos + apple.height > yPos
                ) {
                    overlapping = true;
                    break;
                }
            }
        } while (overlapping);

        apples.push(new Item("assets/sprites/appleSprites.png", xPos, yPos)); // Ensure the correct image path
    }

}

function checkCollisionWithApples() {
    apples.forEach((apple, index) => {
        if (
            player.xPos < apple.xPos + apple.width &&
            player.xPos + player.width > apple.xPos &&
            player.yPos < apple.yPos + apple.height &&
            player.yPos + player.height > apple.yPos
        ) {
            // Collision detected, remove the apple and increase hunger
            apples.splice(index, 1); // Remove the apple from the array
            player.hunger++;// Increase hunger
            console.log(`Hunger: ${player.hunger}`); // Log hunger for debugging
        }
    });
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
    

    // Generate 4 apples
    generateApples(4);

    requestAnimationFrame(gameLoop);//start loop 
    window.addEventListener('keydown',keyMovementDown);//for keydown events
    window.addEventListener('keyup',keyMovementUp);//for keyup events
}

function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    player.draw();

    apples.forEach(apple => {
        apple.draw();
    });
}

let ghost = new Enemy("pacmanGhost", 10,10);
setUp();
drawScreen();
ghost.draw();


function gameLoop(){
    player.move();
    checkCollisionWithApples(); // Check if the player collides with any apples

    // Update apple animations
    apples.forEach(apple => {
        apple.updateFrame();
    });

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