"use strict";

function mouseDown(event) {
	inputMan.mouseDown = true;
	getXY(event);
	getPlayerPiece();
	hudMan.inputText = inputMan.x + "," + inputMan.y + " down";
}

function mouseMove(event) {
	if (inputMan.mouseDown) {
		getXY(event);
		rotatePiece();
		hudMan.inputText = inputMan.x + "," + inputMan.y;
	}
}

function mouseUp(event) {
	inputMan.mouseDown = false;
	movePiece();
	hudMan.inputText += " up";
}

function getXY(event) {
	var x, y;

	if (event.touches) {
		x = event.touches[0].pageX;
		y = event.touches[0].pageY;
	}
	else {
		x = event.layerX;
		y = event.layerY;
	}
	
	inputMan.x = Math.floor((x * scale - gridOffsetX) / cellSize);
	inputMan.y = Math.floor((y * scale - gridOffsetY) / cellSize);

	event.preventDefault();
}
