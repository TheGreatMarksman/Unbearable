'use strict';

const SCREEN_WIDTH = 1500;
const SCREEN_HEIGHT = 800;

var player;
var canvas;
var ctx;

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
            // Call draw once the image is loaded
            this.draw();
        };
    }
}

class Enemy {
    //img path should be determined by type
    constructor(type, xPos, yPos) {
        this.type = type;
        this.xPos = xPos;
        this.yPos = yPos;
    }

}
function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    player = new MainCharacter("assets/sprites/TheBear.png", 50, 50);
}

function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    player.draw();
}


setUp();
drawScreen();