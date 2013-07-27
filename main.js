"use strict";

var pieceRadius = 40;
var cellSize = 96;
var gridOffsetX = 16;
var gridOffsetY = 28;
var pieceOffsetX = 8 + pieceRadius + gridOffsetX;
var pieceOffsetY = 8 + pieceRadius + gridOffsetY;

var canvas, context2d, players, grid;

window.onload = init;
function init() {
	canvas = document.getElementById("canvas");
	context2d = canvas.getContext("2d");
	
	players = [{},{},{},{}];	// array of 4 empty objects
	
	players[0].img = document.getElementById("athens");
	players[1].img = document.getElementById("sparta");
	players[2].img = document.getElementById("mesene");
	players[3].img = document.getElementById("thebes");
	
	players[0].pieces = [{x: 9, y:9, r:3}, {x: 9, y:10, r:3}, {x: 9, y:11, r:3}, {x:10, y:10, r:0}, {x:10, y:11, r:0}, {x:11, y:11, r:1}];
	players[1].pieces = [{x: 5, y:6, r:0}, {x: 4, y: 6, r:0}, {x: 3, y: 6, r:0}, {x: 4, y: 7, r:1}, {x: 3, y: 7, r:1}, {x: 3, y: 8, r:2}];
	players[2].pieces = [{x:11, y:5, r:1}, {x:11, y: 4, r:1}, {x:11, y: 3, r:1}, {x:10, y: 4, r:2}, {x:10, y: 3, r:2}, {x: 9, y: 3, r:3}];
	players[3].pieces = [{x:15, y:8, r:2}, {x:16, y: 8, r:2}, {x:17, y: 8, r:2}, {x:16, y: 7, r:3}, {x:17, y: 7, r:3}, {x:17, y: 6, r:0}];
	
/*	grid = new Array(21);
	for (var i = 0; i < 21; ++i) {
		grid[i] = new Array(15);
		for (var j = 0; j < 15; ++j) {
			grid[i][j] = {};
		}
	}
*/	
	draw();
	
	canvas.addEventListener('mousedown', mouseDown, true);	// TODO: not sure about true or false
}

function draw() {
	context2d.clearRect(0, 0, canvas.width, canvas.height);
	
/*	// alignment grid for testing
	for (var i = 0; i < 22; ++i) {
		context2d.moveTo(i * cellSize + gridOffsetX, 0);
		context2d.lineTo(i * cellSize + gridOffsetX, canvas.height);
	}
	for (var i = 0; i < 16; ++i) {
		context2d.moveTo(0, i * cellSize + gridOffsetY);
		context2d.lineTo(canvas.width, i * cellSize + gridOffsetY);
	}
*/	
	for (var i = 0; i < 4; ++i) {
		for (var j = 0; j < 6; ++j) {
			context2d.save();
			context2d.translate(players[i].pieces[j].x * cellSize + pieceOffsetX, players[i].pieces[j].y * cellSize + pieceOffsetY);
			context2d.rotate(players[i].pieces[j].r * Math.PI/2);
			context2d.drawImage(players[i].img, -pieceRadius, -pieceRadius);
			context2d.restore();
		}
	}
	
	context2d.stroke();
}

/*
.....................
.....................
.....................
...ooooooLKJoooooo...
...oooooooKJoooooo...
...ooooooooJoooooo...
...EEE.........ooM...
...FFo.........oPP...
...Goo.........OOO...
...ooooooDoooooooo...
...ooooooDAooooooo...
...ooooooDABoooooo...
.....................
.....................
.....................
*/
