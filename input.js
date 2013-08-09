"use strict";

function mouseDown(event) {
	inputMan.click = true;
	getRowCol(event);
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	getPiece(inputMan.row, inputMan.col);
	
	if (inputMan.pieceRow >= 0 && inputMan.pieceCol >= 0) {
		event.preventDefault();
		getPhalanx(inputMan.pieceRow, inputMan.pieceCol);
		clearChecked();
	}
	drawMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		getRowCol(event);
		hudMan.inputText = inputMan.row + "," + inputMan.col;
		rotatePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col);
		drawMan.draw = true;
	}
}

function mouseUp(event) {
	inputMan.click = false;
	hudMan.inputText += " up";
	phalanx = [];
	
	if (!dblClick()) {
		if (movePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col)) {
			inputMan.time = 0;	// reset so next click is not double click
		}
	}
	drawMan.draw = true;
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
		inputMan.time = 0;	// reset so next click is not double click
		var zoomed = zoom();
		
		if (zoomed && inputMan.row == inputMan.pieceRow && inputMan.col == inputMan.pieceCol) {
			phalanxMan.mode = 1;
			hudMan.phalanxText = " phalanx";
		}
		else {
			phalanxMan.mode = 0;
			hudMan.phalanxText = "";
		}
		
		return true;
	}
	inputMan.time = time;
	return false;
}
