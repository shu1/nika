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

	inputMan.col = Math.floor((inputMan.x - mediaMan.x) / (cellSize * mediaMan.scale));
	inputMan.row = Math.floor((inputMan.y - mediaMan.y) / (cellSize * mediaMan.scale));
}

function mouseDown(event) {
	getXYRowCol(event);
	inputMan.pX = inputMan.x;
	inputMan.pY = inputMan.y;

	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	hudMan.soundText = "";

	getPiece(inputMan.row, inputMan.col);
	if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {
		event.preventDefault();
	}
	else {
		phalanx.length = 0;
	}

	inputMan.click = true;
	mediaMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		getXYRowCol(event);
		hudMan.inputText = inputMan.row + "," + inputMan.col;

		if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
			rotatePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col);
			event.preventDefault();
			mediaMan.draw = true;
		}
		else {	// pan
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;

			if (pan(dX, dY)) {
				hudMan.inputText = -mediaMan.x + "," + -mediaMan.y;
				event.preventDefault();
				mediaMan.draw = true;
			}

			inputMan.pX = inputMan.x;
			inputMan.pY = inputMan.y;
		}
	}
}

function mouseUp(event) {
	hudMan.inputText += " up";

	if (ai(inputMan.row, inputMan.col)) {
		inputMan.time = 0;	// reset so next click is not double click
	}
	else if (!dblClick(event)) {
		if (gameMan.mode == 1 && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
			togglePhalanxPiece(inputMan.row, inputMan.col);
		}

		if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
			inputMan.time = 0;	// reset so next click is not double click
			gameMan.mode = 0;	// after move always get out of selection mode
		}
	}

	inputMan.click = false;
	mediaMan.play = true;
	mediaMan.draw = true;
}

function dblClick(event) {
	var time = Date.now();
	if (time - inputMan.time < 300) {	// double click time in milliseconds
		hudMan.inputText += " " + (time - inputMan.time) + "ms";
		event.preventDefault();

		if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, toggle selection mode
			gameMan.mode = 1 - gameMan.mode;
			phalanx.length = 0;
			phalanx.push({row:gameMan.pRow, col:gameMan.pCol});
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
