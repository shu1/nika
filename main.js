"use strict";

function playSound(name) {
	if (soundMan.play) {
		switch (name) {
		case "pickup":
			sounds[0].play();
			break;
		case "rotate":
			sounds[1].play();
			break;
		case "move":
			sounds[2].play();
			break;
		case "push":
			sounds[3].play();
			break;
		case "rout":
			sounds[4].play();
			break;
		case "rally":
			sounds[5].play();
			break;
		}

		hudMan.soundText = name + " ";
		soundMan.play = false;
	}
}

window.onload = init;
function init() {
	generateGrid();

	images = new Array(8);
	images[0] = document.getElementById("athens");
	images[1] = document.getElementById("sparta");
	images[2] = document.getElementById("mesene");
	images[3] = document.getElementById("thebes");
	images[4] = document.getElementById("shadow");
	images[5] = document.getElementById("golden");
	images[6] = document.getElementById("silver");
	images[7] = document.getElementById("board");

	sounds = new Array(6);
	sounds[0] = document.getElementById("pick");
	sounds[1] = document.getElementById("drop");
	sounds[2] = document.getElementById("move");
	sounds[3] = document.getElementById("push");
	sounds[5] = document.getElementById("rout");
	sounds[4] = document.getElementById("raly");

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	if (window.navigator.msPointerEnabled) {
		canvas.style.msTouchAction = "none";
		canvas.addEventListener("MSPointerDown", mouseDown);
		canvas.addEventListener("MSPointerMove", mouseMove);
		window.addEventListener("MSPointerUp",   mouseUp);
	}
	else if ("ontouchstart" in window) {
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
		canvas.width = window.innerWidth-6;
		canvas.height = window.innerHeight-6;	// reduce height because otherwise scrollbars show up on some devices..
	}

	context.font = "14px sans-serif";
	context.fillStyle = "white";

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

	if (drawMan.scale > 1) {
		pan(0, 0);	// hack to fix if outside board
	}
}

function pan(dX, dY) {
	var width = -boardWidth * (drawMan.scale-1) + drawMan.offsetX*2;
	var height = -boardHeight * (drawMan.scale-1) + drawMan.offsetY*2;
	var panned = false;

	if (drawMan.x + dX < width) {
		drawMan.x = width;
	}
	else if (drawMan.x + dX > 0) {
		drawMan.x = 0;
	}
	else {
		drawMan.x += dX;
		panned = true;
	}

	if (drawMan.y + dY < height) {
		drawMan.y = height;
	}
	else if (drawMan.y + dY > 0) {
		drawMan.y = 0;
	}
	else {
		drawMan.y += dY;
		panned = true;
	}

	return panned;
}

function draw() {
	if (drawMan.draw) {
		setRings();

		context.save();
		context.translate(drawMan.x, drawMan.y);
		context.scale(drawMan.scale, drawMan.scale);
		
		drawBoard();
		drawPieces();

		context.restore();
		drawMan.draw = false;
	}

	if (debug) {
		drawHud();
	}

	window.requestAnimationFrame(draw);
}

function setRings() {
	if (phalanxMan.mode == 0) {
		for (var i = phalanx.length-1; i >= 0; --i) {
			grid[phalanx[i].row][phalanx[i].col].ring = 0;
		}
	}
	else if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {
			grid[inputMan.pRow][inputMan.pCol].ring = 0;
	}

	if (inputMan.click) {
		if (phalanxMan.mode == 0) {
			if (checkMovePhalanx(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col)) {
				var dRow = inputMan.row - inputMan.pRow;
				var dCol = inputMan.col - inputMan.pCol;

				for (var i = phalanx.length-1; i >= 0; --i) {
					grid[phalanx[i].row + dRow][phalanx[i].col + dCol].ring = 1;
				}
			}
		}
		else if (checkMove(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col)) {
			grid[inputMan.row][inputMan.col].ring = 1;
		}
	}
}

function drawBoard() {
	context.drawImage(images[7], 0, 0, boardWidth, boardHeight);
}

function drawPieces() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			var cell = grid[row][col];
			if (cell.player >= 0 || cell.ring >= 0) {
				context.save();
				context.translate(col * cellSize + cellSize/2, row * cellSize + cellSize/2);

				if (cell.player >= 0) {
					context.rotate(cell.rot * Math.PI/2);
					context.drawImage(images[cell.player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
					context.rotate(cell.rot * Math.PI/-2);	// rotate back
					context.drawImage(images[4], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
				}

				if (cell.ring >= 0) {
					context.drawImage(images[5 + cell.ring], -cellSize/2, -cellSize/2, cellSize, cellSize);
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}
		}
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
	context.fillText(hudMan.fpsText + hudMan.drawText + hudMan.soundText + hudMan.inputText + hudMan.phalanxText, 120, 14);
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
