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
	getXYRowCol(event);
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	inputMan.pX = inputMan.x;
	inputMan.pY = inputMan.y;
	
	var piece = getPiece(inputMan.row, inputMan.col);
	inputMan.pRow = piece.row;
	inputMan.pCol = piece.col;

	rotationHolder = grid[inputMan.row][inputMan.col].rot;
	
	phalanx = [];
	if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {
		event.preventDefault();
		getPhalanxStartingRot(inputMan.pRow, inputMan.pCol);
		getPhalanx(inputMan.pRow, inputMan.pCol);
		if (phalanx.length == 1) {
			phalanxMan.mode = 1;
			hudMan.phalanxText = " phalanx";
		}
		clearChecked();
	}
	drawMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		getXYRowCol(event);
		hudMan.inputText = inputMan.row + "," + inputMan.col;
		
		if (inputMan.pRow >= 0 && inputMan.pCol >= 0) {
			event.preventDefault();
			rotatePiece(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col);
		}
		else if (boardWidth * drawMan.scale > canvas.width || boardHeight * drawMan.scale > canvas.height) {	// panning
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
	hudMan.inputText += " up";
	
	if (!dblClick(event)) {
		if (movePiece(inputMan.pRow, inputMan.pCol, inputMan.row, inputMan.col)) {
			phalanxMan.mode = 0;
			hudMan.phalanxText = "";
			inputMan.time = 0;	// reset so next click is not double click
		}
	}
	if (grid[inputMan.row][inputMan.col].rot != rotationHolder){
		moveHistory.push([actionType.pieceRotate, rotationHolder, inputMan.rot]);
		rotationHolder = -1;
	}
	drawMan.draw = true;
}

function dblClick(event) {
	var time = Date.now();
	if (time - inputMan.time < 300) {	// double click time in milliseconds
		hudMan.inputText += " " + (time - inputMan.time) + "ms";
		event.preventDefault();
		
		if (inputMan.row == inputMan.pRow && inputMan.col == inputMan.pCol) {
			phalanxMan.mode = 1 - phalanxMan.mode;

			if (phalanxMan.mode == 1) {
				hudMan.phalanxText = " phalanx";
			}
			else {
				hudMan.phalanxText = "";
			}
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
