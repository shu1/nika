"use strict";

function mouseDown(event) {
	inputMan.click = true;
	getRowCol(event);

	var dblClick = ""
	var time = Date.now();
	if (time - inputMan.time < 500) {	// default 500 milliseconds
		if (inputMan.row == inputMan.pieceRow && inputMan.col == inputMan.pieceCol) {
			dblClick = " dblclick";
		}
	}
	inputMan.time = time;

	getPiece(inputMan.row, inputMan.col);
	if (inputMan.pieceRow >= 0 && inputMan.pieceCol >= 0) {
		event.preventDefault();
		phalanx = [];
		getPhalanx(inputMan.pieceRow, inputMan.pieceCol);
		clearChecked();
	}
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down" + dblClick;
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
