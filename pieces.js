"use strict";

function getPiece(row, col) {
	inputMan.pieceRow = -1;
	inputMan.pieceCol = -1;

	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].player >= 0) {
		inputMan.pieceRow = row;
		inputMan.pieceCol = col;
	}
}

function rotatePiece(pieceRow, pieceCol, row, col) {
	if (pieceRow >= 0 && pieceCol >= 0) {
		if (row < pieceRow) {
			grid[pieceRow][pieceCol].rot = 0;
		}
		else if (col > pieceCol) {
			grid[pieceRow][pieceCol].rot = 1;
		}
		else if (row > pieceRow) {
			grid[pieceRow][pieceCol].rot = 2;
		}
		else if (col < pieceCol) {
			grid[pieceRow][pieceCol].rot = 3;
		}
	}
}

function movePiece(pieceRow, pieceCol, row, col) {
	if (pieceRow >= 0 && pieceCol >= 0 && checkMove(row, col)) {
		grid[row][col].player = grid[pieceRow][pieceCol].player;
		grid[row][col].rot = grid[pieceRow][pieceCol].rot;
		grid[pieceRow][pieceCol].player = -1;
		grid[pieceRow][pieceCol].rot = -1;
	}
}

function checkMove(row, col) {
	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].cell >= 0 && grid[row][col].player < 0) {
		return true;
	}
	return false;
}
