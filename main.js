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

	players[0].img = document.getElementById("athens");
	players[1].img = document.getElementById("sparta");
	players[2].img = document.getElementById("mesene");
	players[3].img = document.getElementById("thebes");

	generateGrid();
	
	var useCapture = false;
	canvas.addEventListener('mousedown',  mouseDown, useCapture);
	canvas.addEventListener('mousemove',  mouseMove, useCapture);
	canvas.addEventListener('mouseup',    mouseUp,   useCapture);
	window.addEventListener('touchstart', mouseDown, useCapture);
	window.addEventListener('touchmove',  mouseMove, useCapture);
	window.addEventListener('touchend',   mouseUp,   useCapture);

	context.strokeStyle = "#ff0";
	context.font = gridOffsetY + "px sans-serif";
	context.fillStyle = "white";
	draw();
}

function draw() {
	var time = new Date().getTime();
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// draw pieces
	for (var i = 0; i < 4; ++i) {
		for (var j = 0; j < 6; ++j) {
			context.save();
			context.translate(players[i].pieces[j].x * cellSize + cellSize/2 + gridOffsetX, players[i].pieces[j].y * cellSize + cellSize/2 + gridOffsetY);
			context.rotate(players[i].pieces[j].r * Math.PI/2);
			context.drawImage(players[i].img, -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
			context.restore();
		}
	}
	
	// draw piece highlight
	if (inputMan.mouseDown && inputMan.x >= 0 && inputMan.y >= 0) {
		context.beginPath();
		context.arc(inputMan.x * cellSize + cellSize/2 + gridOffsetX, inputMan.y * cellSize + cellSize/2 + gridOffsetY, pieceSize/2 + 1, 0, Math.PI*2);
		context.stroke();
	}
	
	// draw HUD
	if (time - hudMan.fpsTime > 983) {
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
