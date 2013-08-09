"use strict";

function mouseDown(event) {
	inputMan.click = true;
	getRowCol(event);
	inputMan.prevX = inputMan.x;
	inputMan.prevY = inputMan.y;
	getPiece(inputMan.row, inputMan.col);
	hudMan.inputText = inputMan.row + "," + inputMan.col + " down";
	
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

		if (inputMan.pieceRow >= 0 && inputMan.pieceCol >= 0) {
			event.preventDefault();
			rotatePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col);
		}
		else if (drawMan.scale > 1) {
			var x = inputMan.x - inputMan.prevX;
			var y = inputMan.y - inputMan.prevY;
			var pan = false;

			if (drawMan.x + x <= 0 && drawMan.x + x >= -canvas.width * (drawMan.scale-1)) {
				drawMan.x += x;
				pan = true;
			}

			if (drawMan.y + y <= 0 && drawMan.y + y >= -canvas.height * (drawMan.scale-1)) {
				drawMan.y += y;
				pan = true;
			}
			
			if (pan) {
				event.preventDefault();
			}
			
			inputMan.prevX = inputMan.x;
			inputMan.prevY = inputMan.y;
			hudMan.inputText = -drawMan.x + "," + -drawMan.y;
		}
		drawMan.draw = true;
	}
}

function mouseUp(event) {
	inputMan.click = false;
	hudMan.inputText += " up";
	phalanx = [];
	
	if (!dblClick(event)) {
		if (movePiece(inputMan.pieceRow, inputMan.pieceCol, inputMan.row, inputMan.col)) {
			inputMan.time = 0;	// reset so next click is not double click
		}
	}
	drawMan.draw = true;
}

function getRowCol(event) {
	if (event.touches) {
		inputMan.x = event.touches[0].pageX;
		inputMan.y = event.touches[0].pageY;
	}
	else {
		inputMan.x = event.layerX;
		inputMan.y = event.layerY;
	}
	
	inputMan.col = Math.floor((inputMan.x - drawMan.x - gridOffsetX * drawMan.scale) / (cellSize * drawMan.scale));
	inputMan.row = Math.floor((inputMan.y - drawMan.y - gridOffsetY * drawMan.scale) / (cellSize * drawMan.scale));
}

function dblClick(event) {
	var time = Date.now();
	if (time - inputMan.time < 500) {	// default 500 milliseconds
		event.preventDefault();
		zoom();
		
		if (drawMan.scale > 1 && inputMan.row == inputMan.pieceRow && inputMan.col == inputMan.pieceCol) {
			phalanxMan.mode = 1;
			hudMan.phalanxText = " phalanx";
		}
		else {
			phalanxMan.mode = 0;
			hudMan.phalanxText = "";
		}
		
		inputMan.time = 0;	// reset so next click is not double click
		return true;
	}
	inputMan.time = time;
	return false;
}
