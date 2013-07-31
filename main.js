"use strict";

window.onload = init;
function init() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	scale = canvas.width / 1024;	// assume multiples of 1024
	pieceSize *= scale;
	cellSize *= scale;
	gridOffsetX *= scale;
	gridOffsetY *= scale;

	generateGrid();

	pieceImgs = new Array(4);
	pieceImgs[0] = document.getElementById("athens");
	pieceImgs[1] = document.getElementById("sparta");
	pieceImgs[2] = document.getElementById("mesene");
	pieceImgs[3] = document.getElementById("thebes");
	
	var useCapture = false;
	canvas.addEventListener('mousedown',  mouseDown, useCapture);
	canvas.addEventListener('mousemove',  mouseMove, useCapture);
	window.addEventListener('mouseup',    mouseUp,   useCapture);
	window.addEventListener('touchstart', mouseDown, useCapture);
	window.addEventListener('touchmove',  mouseMove, useCapture);
	window.addEventListener('touchend',   mouseUp,   useCapture);

	context.strokeStyle = "yellow";
	context.font = gridOffsetY + "px sans-serif";
	context.fillStyle = "white";
	draw();
}

function draw() {
	var time = new Date().getTime();
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// draw pieces
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player >= 0) {
				context.save();
				context.translate(col * cellSize + cellSize/2 + gridOffsetX, row * cellSize + cellSize/2 + gridOffsetY);
				context.rotate(grid[row][col].rot * Math.PI/2);
				context.drawImage(pieceImgs[grid[row][col].player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
				context.restore();
			}
		}
	}
	
	// draw piece highlight
	if (inputMan.mouseDown && inputMan.row >= 0 && inputMan.col >= 0 && checkMove(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col)) {
		context.beginPath();
		context.arc(inputMan.col * cellSize + cellSize/2 + gridOffsetX, inputMan.row * cellSize + cellSize/2 + gridOffsetY, pieceSize/2 + 1, 0, Math.PI*2);
		context.stroke();
	}
	
	// draw HUD
	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + " fps ";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;
	context.fillText(hudMan.fpsText + hudMan.inputText, 0, gridOffsetY);
	
	requestAnimFrame(draw);
}

this.requestAnimFrame = (function() {
	return window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	function(callback) {
		window.setTimeout(callback, 17);
	};
})();
