"use strict";

function mouseDown(event) {
	inputMan.click = true;
	getRowCol(event);
	getPiece(inputMan.row, inputMan.col);
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	
	if (inputMan.pieceRow >= 0 && inputMan.pieceCol >= 0) {
		event.preventDefault();
		phalanx = [];
		getPhalanx(inputMan.pieceRow, inputMan.pieceCol);
		clearChecked();
	}
}

function mouseMove(event) {
	if (inputMan.click) {
		getRowCol(event);
		rotatePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col);
		hudMan.inputText = inputMan.row + "," + inputMan.col;
	}
}

function mouseUp(event) {
	inputMan.click = false;
	hudMan.inputText += " up";
	if (!dblClick()) {
		movePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col);
	}
}

function getRowCol(event) {
	var x, y;

	if (event.touches) {
		x = event.touches[0].pageX;
		y = event.touches[0].pageY;
	}
	else {
		x = event.layerX;
		y = event.layerY;
	}
	
	inputMan.col = Math.floor((x - drawMan.x - gridOffsetX * drawMan.scale) / (cellSize * drawMan.scale));
	inputMan.row = Math.floor((y - drawMan.y - gridOffsetY * drawMan.scale) / (cellSize * drawMan.scale));
}

function dblClick() {
	var time = Date.now();
	if (time - inputMan.time < 500) {	// default 500 milliseconds
//		if (inputMan.row == inputMan.clickRow && inputMan.col == inputMan.clickCol) {
			hudMan.inputText += " dblClick";
			zoom();
			return true;
//		}
	}
	inputMan.time = time;
	inputMan.clickRow = inputMan.row;
	inputMan.clickCol = inputMan.col;
	return false;
}
