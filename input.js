"use strict";

function getXYRowCol(event) {
	if (event.touches) {
		inputMan.x = event.touches[0].pageX;
		inputMan.y = event.touches[0].pageY;
	}
	else {
		inputMan.x = event.layerX;
		inputMan.y = event.layerY;
	}

	inputMan.col = Math.floor((inputMan.x - drawMan.x) / (cellSize * drawMan.scale));
	inputMan.row = Math.floor((inputMan.y - drawMan.y) / (cellSize * drawMan.scale));
}

function mouseDown(event) {
	inputMan.click = true;
	soundMan.play = true;

	getXYRowCol(event);
	inputMan.pX = inputMan.x;
	inputMan.pY = inputMan.y;
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";

	getPiece(inputMan.row, inputMan.col);
	if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {
		event.preventDefault();
		if (phalanx.length == 1) {	// if piece is single, automatically set to selection mode
			inputMan.mode = 1;
		}
	}
	drawMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		soundMan.play = true;

		getXYRowCol(event);
		hudMan.inputText = inputMan.row + "," + inputMan.col;

		if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {	// if there's a piece, rotate it
			rotatePiece(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col);
			event.preventDefault();
		}
		else if (boardWidth * drawMan.scale > canvas.width || boardHeight * drawMan.scale > canvas.height) {	// else pan
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;

			if (pan(dX, dY)) {
				hudMan.inputText = -drawMan.x + "," + -drawMan.y;
				event.preventDefault();
			}

			inputMan.pX = inputMan.x;
			inputMan.pY = inputMan.y;
		}
		drawMan.draw = true;
	}
}

function mouseUp(event) {
	inputMan.click = false;
	soundMan.play = true;
	hudMan.inputText += " up";

	if (!dblClick(event)) {
		if (movePiece(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col)) {
			inputMan.time = 0;	// reset so next click is not double click
			inputMan.mode = 0;	// after move always get out of selection mode
		}
	}
	drawMan.draw = true;
}

function dblClick(event) {
	var time = Date.now();
	if (time - inputMan.time < 300) {	// double click time in milliseconds
		hudMan.inputText += " " + (time - inputMan.time) + "ms";
		event.preventDefault();

		if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {	// if there's a piece, toggle selection mode
			inputMan.mode = 1 - inputMan.mode;
		}
		else {
			zoom();
		}

		inputMan.time = 0;	// reset so next click is not double click
		return true;
	}
	inputMan.time = time;
	return false;
}
