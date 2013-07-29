"use strict";

function mouseDown(event) {
	inputMan.mouseDown = true;
	getXY(event);
	getPlayerPiece();
	hud.inputText = inputMan.x + "," + inputMan.y;
}

function mouseMove(event) {
	if (inputMan.mouseDown) {
		getXY(event);
		hud.inputText = inputMan.x + "," + inputMan.y;
	}
}

function mouseUp(event) {
	inputMan.mouseDown = false;
	movePiece();
	hud.inputText += " up";
}

function getXY(event) {
	var x, y;

	if (event.touches) {
		x = event.touches[0].pageX;
		y = event.touches[0].pageY;
	}
	else {
		x = event.offsetX;
		y = event.offsetY;
	}
	
	inputMan.x = Math.floor((x * scale - gridOffsetX) / cellSize);
	inputMan.y = Math.floor((y * scale - gridOffsetY) / cellSize);

	event.preventDefault();
}
