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
	if (checkMove(pieceRow, pieceCol, row, col)) {

		routPiece(row,col);

		grid[row][col].player = grid[pieceRow][pieceCol].player;
		grid[row][col].rot = grid[pieceRow][pieceCol].rot;
		grid[pieceRow][pieceCol].player = -1;
		grid[pieceRow][pieceCol].rot = -1;
	}
}

function checkMove(pieceRow, pieceCol, row, col) {
	if (pieceRow < 0 || pieceCol < 0 || row < 0 || row >= 15 || col < 0 || col >= 21) {	// bounds
		return false;
	}

	if (grid[row][col].cell < 0 || grid[row][col].cell == 3) {	// invalid-sqaure
		return false;
	}

	if (grid[row][col].player >= 0 && (grid[row][col].player - grid[pieceRow][pieceCol].player)%2 == 0) {	// occupied-by-same-team
		return false;
	}

	if (grid[row][col].cell == 1 && (grid[row][col].zone - grid[pieceRow][pieceCol].player)%2 != 0 ) {	// opponent-win-square
		return false;
	}

	if (grid[pieceRow][pieceCol].cell != 3 && Math.abs(pieceRow-row) + Math.abs(pieceCol-col) > 1) {	// adjacent-square
		return false;
	}

	if (grid[pieceRow][pieceCol].cell == 3 && (grid[row][col].cell != 2 || grid[pieceRow][pieceCol].player != grid[row][col].zone) ) {	// routed-to-respawn
		return false;
	}

	return true;
}

function routPiece(row, col) {
	if (grid[row][col].player >= 0) {
		var pos = findRoutedSquare(grid[row][col].player);

		grid[pos.routRow][pos.routCol].player = grid[row][col].player;
		grid[pos.routRow][pos.routCol].rot = grid[row][col].player;
	}
}

function findRoutedSquare(player) {


	var emptyRow = -1;
	var emptyCol = -1;

	switch (player) {
		case 0 : 
			for (var row=14; row>=0; --row) {
				for (var col=0; col<21; ++col) {
					if (grid[row][col].cell == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
						emptyRow = row;
						emptyCol = col;
						return {routRow:emptyRow, routCol:emptyCol};
					}
				}
			}
			break;

		case 1:	
			for (var col=0; col<21; ++col) {
				for (var row=0; row<15; ++row) {
					if (grid[row][col].cell == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
						emptyRow = row;
						emptyCol = col;
						return {routRow:emptyRow, routCol:emptyCol};
					}
				}
			}
			break;
		case 2:
			for (var row=0; row<15; ++row) {
				for (var col=20; col>=0; --col) {
					if (grid[row][col].cell == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
						emptyRow = row;
						emptyCol = col;
						return {routRow:emptyRow, routCol:emptyCol};
					}
				}
			}
			break;

		case 3:
			for (var col=20; col>=0; --col) {
				for (var row=14; row>=0; --row) {
					if (grid[row][col].cell == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
						emptyRow = row;
						emptyCol = col;
						return {routRow:emptyRow, routCol:emptyCol};
					}
				}
			}
			break;
	}	

	
}
