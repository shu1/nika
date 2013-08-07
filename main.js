"use strict";

window.onload = init;
function init() {
	generateGrid();
	
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	var scale = canvas.width / 1024;
	pieceSize *= scale;
	cellSize *= scale;
	gridOffsetX *= scale;
	gridOffsetY *= scale;
	
	images = new Array(5);
	images[0] = document.getElementById("athens");
	images[1] = document.getElementById("sparta");
	images[2] = document.getElementById("mesene");
	images[3] = document.getElementById("thebes");
	images[4] = document.getElementById("board");
	
	canvas.addEventListener("mousedown",  mouseDown);
	canvas.addEventListener("mousemove",  mouseMove);
	window.addEventListener("mouseup",    mouseUp);
	window.addEventListener("touchstart", mouseDown);
	window.addEventListener("touchmove",  mouseMove);
	window.addEventListener("touchend",   mouseUp);
	
	context.font = gridOffsetY + "px sans-serif";
	context.fillStyle = "yellow";
	context.strokeStyle = "yellow";
	draw();
}

function zoom() {
	drawMan.scale++;
	if (drawMan.scale > 4) {
		drawMan.scale = 1;
	}
	drawMan.x = -(inputMan.col * cellSize + cellSize/2 + gridOffsetX) * (drawMan.scale - 1);
	drawMan.y = -(inputMan.row * cellSize + cellSize/2 + gridOffsetY) * (drawMan.scale - 1);
}

function draw() {
	var time = Date.now();
	
	context.save();
	context.translate(drawMan.x, drawMan.y);
	context.scale(drawMan.scale, drawMan.scale);
	context.drawImage(images[4], 0, 0, canvas.width, canvas.height);
	
	// draw pieces
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player >= 0) {
				context.save();
				context.translate(col * cellSize + cellSize/2 + gridOffsetX, row * cellSize + cellSize/2 + gridOffsetY);
				context.rotate(grid[row][col].rot * Math.PI/2);
				context.drawImage(images[grid[row][col].player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
				context.restore();
			}
		}
	}
	
	// draw piece highlight
	if (inputMan.click && checkMove(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col)) {
		context.beginPath();
		context.arc(inputMan.col * cellSize + cellSize/2 + gridOffsetX, inputMan.row * cellSize + cellSize/2 + gridOffsetY, pieceSize/2 + 1, 0, Math.PI*2);
		context.stroke();
	}
	
	context.restore();
	
	// draw HUD
	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps ";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;
	context.fillText(hudMan.fpsText + drawMan.scale + "x " + hudMan.inputText, 0, gridOffsetY);
	
	requestAnimationFrame(draw);
}

// browser compatibility
(function() {
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
}());
