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
	mediaMan.play = true;
	getXYRowCol(event);
	inputMan.pX = inputMan.x;
	inputMan.pY = inputMan.y;
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	hudMan.soundText = "";

	inputMan.click = true;
	getPiece(inputMan.row, inputMan.col);
	if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {
		event.preventDefault();
	}
	
	mediaMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		mediaMan.play = true;

		getXYRowCol(event);
		hudMan.inputText = inputMan.row + "," + inputMan.col;

		if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {	// if there's a piece, rotate it
			rotatePiece(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col);
			event.preventDefault();
		}
		else {	// pan
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;

			if (pan(dX, dY)) {
				hudMan.inputText = -mediaMan.x + "," + -mediaMan.y;
				event.preventDefault();
			}

			inputMan.pX = inputMan.x;
			inputMan.pY = inputMan.y;
		}
		mediaMan.draw = true;
	}
}

function mouseUp(event) {
	inputMan.click = false;
	mediaMan.play = true;
	hudMan.inputText += " up";

	if (!ai(inputMan.row, inputMan.col)) {
		if (!dblClick(event)) {
			if (inputMan.mode == 1 && inputMan.pRow == inputMan.row && inputMan.pCol == inputMan.col) { // remove from phalanx in 
				togglePieceInPhalanx(inputMan.row, inputMan.col);
			}

			if (movePiece(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col)) {
				inputMan.time = 0;	// reset so next click is not double click
				inputMan.mode = 0;	// after move always get out of selection mode
			}
		}
	}
	mediaMan.draw = true;
}

function dblClick(event) {
	var time = Date.now();
	if (time - inputMan.time < 300) {	// double click time in milliseconds
		hudMan.inputText += " " + (time - inputMan.time) + "ms";
		event.preventDefault();

		if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {	// if there's a piece, toggle selection mode
			inputMan.mode = 1 - inputMan.mode;
			phalanx.length = 0;
			phalanx.push({row:inputMan.pRow, col:inputMan.pCol});
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
