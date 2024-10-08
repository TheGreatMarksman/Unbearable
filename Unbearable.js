'use strict';

let initWidth = Math.floor(window.innerWidth * 0.9);
let initHeight = Math.floor(window.innerHeight * 0.9);

const SCREEN_WIDTH = Math.floor(initWidth - (initWidth % 14));
const SCREEN_HEIGHT = Math.floor(initHeight - (initHeight % 14));

var CHARACTER_WIDTH;
var CHARACTER_HEIGHT;

let testPointRectColor = null;
let testHitBoxColor = null;

let tileWidth = Math.floor(SCREEN_WIDTH / 14);
let tileHeight = Math.floor(SCREEN_HEIGHT / 7);
if(tileWidth > tileHeight){
    CHARACTER_HEIGHT = tileHeight;
    CHARACTER_WIDTH = CHARACTER_HEIGHT
}
else{
    CHARACTER_WIDTH = tileWidth;
    CHARACTER_HEIGHT = CHARACTER_WIDTH;
}

// So objects will 'start' at xPos + CHARACTER_WIDTH/3 and end at xPos + CHARACTER_WIDTH/3
const OBJECT_LENGTH_OFFSET = Math.floor(CHARACTER_WIDTH / 3);


//console.log("screen: " + SCREEN_WIDTH + ", " + SCREEN_HEIGHT);
//console.log("character: " + CHARACTER_WIDTH + ", " + CHARACTER_HEIGHT);


document.querySelector('#game').style.width=`${SCREEN_WIDTH}px`;
document.querySelector('#game').style.height=`${SCREEN_HEIGHT}px`;

var loops = 0;
var player;
var enemies = [3];
var canvas;
var ctx;
var map;


var enemyAnimationCounter = 0;
var oldTimeStamp;



const speed=5;
const speedMain=2;


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
            if(map.isAvailablePosition(this.xPos + CHARACTER_WIDTH/2, this.yPos - speedMain)){
                this.yPos -= speedMain;
            }
        }else if (direction.down){
            this.directionRow = 0; //the 1st row of sprite sheet
            if(map.isAvailablePosition(this.xPos + CHARACTER_WIDTH/2, this.yPos + speedMain)){
                this.yPos += speedMain;
            }
        } else if (direction.right){
            this.directionRow = 3; //the 4th row of the sprite sheet
            if(map.isAvailablePosition(this.xPos + speedMain, this.yPos + CHARACTER_WIDTH/2)){
                this.xPos += speedMain;
            }
        } else if (direction.left){
            this.directionRow = 1; //the 2nd row of the sprite sheet
            if(map.isAvailablePosition(this.xPos - speedMain, this.yPos + CHARACTER_WIDTH/2)){
                this.xPos -= speedMain;
            }
        }

        
        if (direction.up || direction.down || direction.left || direction.right) {
            this.frameCounter++;
            if (this.frameCounter == 10){// cycle through based on counter
                this.frameIndex = (this.frameIndex + 1) % this.framesPerRow;// Cycle through 4 frames
                this.frameCounter=0;
            }
            
        }

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
            //console.log(`Hunger: ${player.hunger}`); // Log hunger for debugging
        }
    });
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
                break;
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
    checkCollisions() {
        //sens is is the sensitity of the collision detection - smaller sens == collision from farther away, vice versa
        var sens = 10;
        if(Math.abs(this.xPos - player.xPos + sens) <= CHARACTER_WIDTH && Math.abs(this.yPos - player.yPos + sens) <=CHARACTER_HEIGHT) {
            //console.log("collision with enemy");
            return true;
        }
        else {
            return false;
        }
    }
}

class Map{
    constructor(tiles){
        this.tiles = [];
        for(let i = 0; i < tiles.length; i++)
            this.tiles[i] = tiles[i];
    }
    
    isAvailablePosition(x, y){
        for(let i = 0; i < this.tiles.length; i++){
            let left = this.tiles[i].xPos + OBJECT_LENGTH_OFFSET;
            let right = this.tiles[i].xPos + OBJECT_LENGTH_OFFSET * 2;
            let top = this.tiles[i].yPos + OBJECT_LENGTH_OFFSET;
            let down = this.tiles[i].yPos + OBJECT_LENGTH_OFFSET * 2;
            if(x > left && x < right && y > top && y < down){
                console.log("x: " + x + " y: " + y + " left: " + left + " right: " + right
                    + " top: " + top + " down: " + down);
                testHitBoxColor = "blue";
                testPointRectColor = "red";
                return false;
            }
        }
        return true;
    }
    
    draw(){
        for(let i = 0; i < this.tiles.length; i++)
            this.tiles[i].draw();
    }
}

class Tile{
    constructor(link, xPos, yPos){
        this.link = link;
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = CHARACTER_WIDTH;
        this.height = CHARACTER_HEIGHT;
        this.image = new Image();
        this.image.src = link;        
        this.image.onload = () => {
            this.draw();
        };
    }
    draw(){
        if (this.image.complete){
            ctx.drawImage(this.image, 0, 0, 32, 32, this.xPos,this.yPos,this.width,this.height);
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

function checkEnemyCollisions() {
    var shouldEnd = false;
    enemies.forEach((e) => {
        if(e.checkCollisions() == true) {
            //console.log("should end gameloop here.");
            shouldEnd = true;
        }
    });
    return shouldEnd;

}
function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    map = new Map(makeTiles());

   
    player = new MainCharacter("assets/sprites/bearSprites.png", 0, 0);


    enemies[0] = new Enemy("default", 1000,1000,1);
    enemies[1] = new Enemy("default", 1000,1000,1);
    enemies[2] = new Enemy("default", 1000,1100,1);

    drawEnemies();


    
 
    

    // Generate 4 apples
    generateApples(4);


    requestAnimationFrame(gameLoop);//start loop 
    window.addEventListener('keydown',keyMovementDown);//for keydown events
    window.addEventListener('keyup',keyMovementUp);//for keyup events

}



function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if(testHitBoxColor != null && testPointRectColor != null){
        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, 5, 5);
        ctx.fillStyle = "red";
        ctx.fillRect(left, top, OBJECT_LENGTH_OFFSET, OBJECT_LENGTH_OFFSET);
    }

    ctx.fillStyle = 'rgb(15, 205, 94)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    map.draw();

    player.draw();


    apples.forEach(apple => {
        apple.draw();
    });


    loops++;
    enemyAnimationCounter++;
    //every 10 loops, enemies choose a new direction
    drawEnemies();
}







setUp();
drawScreen();



setUp();
//drawScreen();

var gameEnd = false;
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
    checkCollisionWithApples(); // Check if the player collides with any apples

    // Update apple animations
    apples.forEach(apple => {
        apple.updateFrame();
    });

    drawScreen();
    //if colliding with an enemy, break out of the gameloop
    if(checkEnemyCollisions() == true) {
        //console.log("setting gameEnd to true");
        gameEnd = true;
    }
    //console.log("gameEnd value: " + gameEnd);
    if(!gameEnd) {
        requestAnimationFrame(gameLoop);//request for the next frame
    }
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

function makeTiles(){
    let tiles = [];

    let grassPicture = "assets/sprites/grassSprites.png";
    let treePicture = "assets/sprites/treeSprites.png";
    let waterPicture = "assets/sprites/waterSprites.png";
    let cavePicture = "assets/sprites/caveSprites.png";
    // Each mapString line is two rows of the map
    // mapString: 0: grass, 1: tree, 3: water, 4: cave
    let mapString = "00010000000000";
    mapString += "01010101111010";
    mapString += "00000100133010";
    mapString += "01110140101010";
    mapString += "01300000001000";
    mapString += "01311101101110";
    mapString += "00000000100000";    
    
    /*
    let mapString = "000000001011111110001000101010041011101033333000101110000000";
    mapString += "011010001011111011100000101010000010001000101010001113331000";
    mapString += "010110001110100000000043111110010010000100000101110001013331000";
    mapString += "0101101100111000000001013131000000010010000000111111010101010";
    mapString += "011011010330100100001010101010000000000330100101101010000010";
    mapString += "011110010000110101101011011110 033311110400010100000001000000";
    mapString += "033300000100010111111101003333 033311110111000000000101103333";
    mapString += "000000010000000333330000003333";
    */
    // this one's shorter because there's an odd number of rows (15)

    for(let i = 0; i < mapString.length; i++){
        if(mapString.charAt(i) == 0){
            tiles.push(new Tile(grassPicture, toTileX(i) * CHARACTER_WIDTH, toTileY(i) * CHARACTER_WIDTH));
        }
        else if(mapString.charAt(i) == 1){
            tiles.push(new Tile(treePicture, toTileX(i) * CHARACTER_WIDTH, toTileY(i) * CHARACTER_WIDTH));
        }
        else if(mapString.charAt(i) == 3){
            tiles.push(new Tile(waterPicture, toTileX(i) * CHARACTER_WIDTH, toTileY(i) * CHARACTER_WIDTH));
        }
        else if(mapString.charAt(i) == 4){
            tiles.push(new Tile(cavePicture, toTileX(i) * CHARACTER_WIDTH, toTileY(i) * CHARACTER_WIDTH));
        }
    }
    return tiles;
}

function toTileX(stringIndex){
    return (stringIndex % 14);
}

function toTileY(stringIndex){
    return (Math.floor(stringIndex / 14));
}