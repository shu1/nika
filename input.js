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
	inputMan.rot = -1;
}

function getRot(dX, dY) {
	if (grid[gameMan.pRow][gameMan.pCol].kind != 3) {
		inputMan.row = gameMan.pRow;
		inputMan.col = gameMan.pCol;

		if (dX >= dY && dX <= -dY) {	// up
			inputMan.row--;
			inputMan.rot = 0;
		}
		else if (dX >= dY && dX >= -dY) {	// right
			inputMan.col++;
			inputMan.rot = 1;
		}
		else if (dX <= dY && dX >= -dY) {	// down
			inputMan.row++;
			inputMan.rot = 2;
		}
		else {	// left
			inputMan.col--;
			inputMan.rot = 3;
		}
	}
}

function mouseDown(event) {
	getXYRowCol(event);
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	hudMan.soundText = "";

	getPiece(inputMan.row, inputMan.col);
	if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {
		inputMan.pX = mediaMan.x + (gameMan.pCol * cellSize + cellSize/2) * mediaMan.scale;
		inputMan.pY = mediaMan.y + (gameMan.pRow * cellSize + cellSize/2) * mediaMan.scale;
		event.preventDefault();
	}
	else {
		inputMan.pX = inputMan.x;
		inputMan.pY = inputMan.y;
		gameMan.mode = 0;	// back to default selection if you deselect pieces
		phalanx.length = 0;
	}

	inputMan.click = true;
	mediaMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		getXYRowCol(event);
		hudMan.inputText = inputMan.row + "," + inputMan.col;

		var dX = inputMan.x - inputMan.pX;
		var dY = inputMan.y - inputMan.pY;
		if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
			if (Math.abs(dX) > cellSize/2 * mediaMan.scale || Math.abs(dY) > cellSize/2 * mediaMan.scale) {	// inside cell is deadzone
				getRot(dX, dY);
				rotatePiece(gameMan.pRow, gameMan.pCol, inputMan.rot);
			}

			event.preventDefault();
			mediaMan.draw = true;
		}
		else {	// pan
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

	if (undo(inputMan.row, inputMan.col) || ai(inputMan.row, inputMan.col)) {
		inputMan.time = 0;
	}
	else if (!dblClick(event)) {
		if (gameMan.mode == 1 && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
			togglePhalanxPiece(inputMan.row, inputMan.col);
		}
		else if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
			inputMan.time = 0;
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
