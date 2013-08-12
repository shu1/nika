"use strict";

function playAudio(name) {
	switch (name) {
	case "pick":
		audio[0].play();
		break;
	case "drop":
		audio[1].play();
		break;
	case "move":
		audio[2].play();
		break;
	case "push":
		audio[3].play();
		break;
	case "rout":
		audio[4].play();
		break;
	case "raly":
		audio[5].play();
		break;
	}
	
	hudMan.audioText = name + " ";
}

window.onload = init;
function init() {
	generateGrid();

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	images = new Array(6);
	images[0] = document.getElementById("athens");
	images[1] = document.getElementById("sparta");
	images[2] = document.getElementById("mesene");
	images[3] = document.getElementById("thebes");
	images[4] = document.getElementById("shadow");
	images[5] = document.getElementById("board");

	audio = new Array(6);
	audio[0] = document.getElementById("pick");
	audio[1] = document.getElementById("drop");
	audio[2] = document.getElementById("move");
	audio[3] = document.getElementById("push");
	audio[5] = document.getElementById("rout");
	audio[4] = document.getElementById("raly");
	
	if ("ontouchstart" in window) {
		window.addEventListener("touchstart", mouseDown);
		window.addEventListener("touchmove",  mouseMove);
		window.addEventListener("touchend",   mouseUp);
	}
	else {
		canvas.addEventListener("mousedown",  mouseDown);
		canvas.addEventListener("mousemove",  mouseMove);
		window.addEventListener("mouseup",    mouseUp);
	}

	if (fullScreen) {
		window.addEventListener("resize", reSize);
	}
	
	reSize();
	draw();
}

function reSize() {
	if (fullScreen) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	
	context.font = "14px sans-serif";
	context.fillStyle = "yellow";

	drawMan.offsetX = (canvas.width - boardWidth)/2;
	drawMan.offsetY = (canvas.height - boardHeight)/2;
	drawMan.x = drawMan.offsetX;
	drawMan.y = drawMan.offsetY;
	drawMan.draw = true;
}

function zoom() {
	if (drawMan.scale == 1) {
		drawMan.scale = zoomLevel;	// declared in html file
	}
	else {
		drawMan.scale = 1;
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	drawMan.x = -(inputMan.col * cellSize + cellSize/2) * (drawMan.scale-1) + drawMan.offsetX;
	drawMan.y = -(inputMan.row * cellSize + cellSize/2) * (drawMan.scale-1) + drawMan.offsetY;
}

function draw() {
	if (drawMan.draw) {
		context.save();
		context.translate(drawMan.x, drawMan.y);
		context.scale(drawMan.scale, drawMan.scale);
		
		drawBoard();
		drawPieces();
		drawPiecesHighlight();
		drawMoveHighlight();
		
		context.restore();
		drawMan.draw = false;
	}
	
	if (debug) {
		drawHud();
	}
	
	window.requestAnimationFrame(draw);
}

function drawBoard() {
	context.drawImage(images[5], 0, 0, boardWidth, boardHeight);
}

function drawPieces() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player >= 0) {
				context.save();
				context.translate(col * cellSize + cellSize/2, row * cellSize + cellSize/2);
				context.rotate(grid[row][col].rot * Math.PI/2);
				context.drawImage(images[grid[row][col].player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
				context.rotate(grid[row][col].rot * -Math.PI/2);	// ugh waste
				context.drawImage(images[4], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
				context.restore();
			}
		}
	}
}

function drawPiecesHighlight() {
	context.strokeStyle = "red";

	if (phalanxMan.mode == 0) {
		for (var i = phalanx.length-1; i >= 0; --i) {
			context.beginPath();
			context.arc(phalanx[i].col * cellSize + cellSize/2, phalanx[i].row * cellSize + cellSize/2, pieceSize/2 + 1, 0, Math.PI*2);
			context.stroke();
		}
	}
	else if (inputMan.pieceRow >= 0 && inputMan.pieceCol >= 0) {
		context.beginPath();
		context.arc(inputMan.pieceCol * cellSize + cellSize/2, inputMan.pieceRow * cellSize + cellSize/2, pieceSize/2 + 1, 0, Math.PI*2);
		context.stroke();
	}
}

function drawMoveHighlight() {
	context.strokeStyle = "green";

	if (phalanxMan.mode == 0 && inputMan.click && checkMovePhalanx(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col)) {
		var deltaRow = inputMan.row - inputMan.pieceRow;
		var deltaCol = inputMan.col - inputMan.pieceCol;

		for (var i = phalanx.length-1; i >= 0; --i) {
			context.beginPath();
			context.arc((phalanx[i].col + deltaCol) * cellSize + cellSize/2, (phalanx[i].row + deltaRow) * cellSize + cellSize/2, pieceSize/2 + 1, 0, Math.PI*2);
			context.stroke();	
		}
	}
	else if (inputMan.click && checkMove(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col)) {
		context.beginPath();
		context.arc(inputMan.col * cellSize + cellSize/2, inputMan.row * cellSize + cellSize/2, pieceSize/2 + 1, 0, Math.PI*2);
		context.stroke();
	}
}

function drawHud() {
	var time = Date.now();
	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps ";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;
	hudMan.drawText = window.innerWidth + "x" + window.innerHeight + " " + drawMan.scale + "x ";
	context.clearRect(0, 0, canvas.width, 20);
	context.fillText(hudMan.fpsText + hudMan.drawText + hudMan.audioText + hudMan.inputText + hudMan.phalanxText, 120, 14);
}

// browser compatibility
(function() {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());
