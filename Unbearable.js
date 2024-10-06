'use strict';

let initWidth = Math.floor(window.innerWidth * 0.9);
let initHeight = Math.floor(window.innerHeight * 0.9);

const SCREEN_WIDTH = Math.floor(initWidth - (initWidth % 14));
const SCREEN_HEIGHT = Math.floor(initHeight - (initHeight % 14));

var CHARACTER_WIDTH;
var CHARACTER_HEIGHT;

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

console.log("screen: " + SCREEN_WIDTH + ", " + SCREEN_HEIGHT);
console.log("character: " + CHARACTER_WIDTH + ", " + CHARACTER_HEIGHT);


document.querySelector('#game').style.width=`${SCREEN_WIDTH}px`;
document.querySelector('#game').style.height=`${SCREEN_HEIGHT}px`;

var player;
var enemies = [3];
var canvas;
var ctx;
var map;

var oldTimeStamp;


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

    move(){
        
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

class Map{
    constructor(tiles){
        this.tiles = [];
        for(let i = 0; i < tiles.length; i++)
            this.tiles[i] = tiles[i];
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
function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    map = new Map(makeTiles());

    enemies[0] = new Enemy("default", 10,10,1);
    enemies[1] = new Enemy("default", 10,50,1);
    enemies[2] = new Enemy("default", 50,10,1);
    drawEnemies();


    player = new MainCharacter("assets/sprites/TheBear.png", CHARACTER_WIDTH, CHARACTER_HEIGHT);
    


    requestAnimationFrame(gameLoop);//start loop 
    window.addEventListener('keydown',keyMovementDown);//for keydown events
    window.addEventListener('keyup',keyMovementUp);//for keyup events

}


let loops = 0;
function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    map.draw();

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