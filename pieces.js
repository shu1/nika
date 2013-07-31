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
	if (pieceRow >= 0 && pieceCol >= 0 && checkMove(pieceRow, pieceCol, row, col)) {
		grid[row][col].player = grid[pieceRow][pieceCol].player;
		grid[row][col].rot = grid[pieceRow][pieceCol].rot;
		grid[pieceRow][pieceCol].player = -1;
		grid[pieceRow][pieceCol].rot = -1;
	}
}

function checkMove(pieceRow, pieceCol, row, col) {

	// Adjacent-square check
	if (Math.abs(pieceRow-row) + Math.abs(pieceCol-col) > 1) {
		return false;
	}

	// On-board check
	if (row < 0 || row >= 15 || col < 0 || col >= 21) {
		return false;
	}

	// Invalid-sqaure check
	if (grid[row][col].cell < 0) {
		return false;
	}

	// Occupied-by-same-team check
	if (grid[row][col].player >= 0 && (grid[row][col].player - grid[pieceRow][pieceCol].player)%2 == 0) {
		return false;
	}

	// Routed cell check
	if (grid[row][col].cell == 3) {
		return false;
	}



	return true;

}
