"use strict";

function mouseDown(event) {
	inputMan.mouseDown = true;
	getRowCol(event);
	getPiece(inputMan.row, inputMan.col);
	if (inputMan.pieceRow >= 0 && inputMan.pieceCol >= 0) {
		event.preventDefault();
		phalanx = [];
		getPhalanx(inputMan.pieceRow,inputMan.pieceCol);
		clearChecked();
	}
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
}

function mouseMove(event) {
	if (inputMan.mouseDown) {
		getRowCol(event);
		rotatePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col);
		hudMan.inputText = inputMan.row + "," + inputMan.col;
	}
}

function mouseUp(event) {
	inputMan.mouseDown = false;
	movePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col);
	hudMan.inputText += " up";
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
	
	inputMan.col = Math.floor((x - gridOffsetX) / cellSize);
	inputMan.row = Math.floor((y - gridOffsetY) / cellSize);
}
