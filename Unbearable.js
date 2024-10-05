'use strict';

const SCREEN_WIDTH = window.innerWidth - (window.innerWidth % 15);
const SCREEN_HEIGHT = window.innerHeight - (window.innerHeight % 15);
const CHARACTER_WIDTH = SCREEN_WIDTH / 15;
const CHARACTER_HEIGHT = CHARACTER_WIDTH;


var canvas;
var ctx;

function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    console.log(SCREEN_WIDTH + " " + SCREEN_HEIGHT);
    console.log(CHARACTER_WIDTH + " " + CHARACTER_HEIGHT);
}

function drawScreen(){
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

setUp();
drawScreen();