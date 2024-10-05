'use strict';

const SCREEN_WIDTH = 1500;
const SCREEN_HEIGHT = 800;

var canvas;
var ctx;
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
}

function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}


setUp();
drawScreen();