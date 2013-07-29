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
	
	var useCapture = false;
	canvas.addEventListener('mousedown', mouseDown, useCapture);
	canvas.addEventListener('mousemove', mouseMove, useCapture);
	canvas.addEventListener('mouseup', mouseUp, useCapture);
	window.addEventListener('touchstart', mouseDown, useCapture);
	window.addEventListener('touchmove', mouseMove, useCapture);
	window.addEventListener('touchend', mouseUp, useCapture);

	context.font = gridOffsetY + "px sans-serif";
	context.fillStyle = "white";
	draw();
}

function draw() {
	var time = new Date().getTime();
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw pieces
	for (var i = 0; i < 4; ++i) {
		for (var j = 0; j < 6; ++j) {
			context.save();
			context.translate(players[i].pieces[j].x * cellSize + gridOffsetX + cellSize/2, players[i].pieces[j].y * cellSize + gridOffsetY + cellSize/2);
			context.rotate(players[i].pieces[j].r * Math.PI/2);
			context.drawImage(players[i].img, -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
			context.restore();
		}
	}
	context.stroke();
	
	// Draw piece highlight
	if (inputMan.mouseDown) {
		if (inputMan.x >= 0 && inputMan.y >= 0) {
			context.beginPath();
			context.arc(inputMan.x * cellSize + gridOffsetX + cellSize/2, inputMan.y * cellSize + gridOffsetY + cellSize/2, pieceSize/2 +1, 0, 2*Math.PI);
			context.strokeStyle = "#ff0";
			context.restore();
			context.stroke();
		}
	}

	// HUD
	if (time - hud.fpsTime > 983) {
		hud.fpsText = hud.fpsCount + " fps ";
		hud.fpsTime = time;
		hud.fpsCount = 0;
	}
	hud.fpsCount++;
	context.fillText(hud.fpsText + hud.inputText, 0, gridOffsetY);
	
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
