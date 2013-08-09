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
	if (grid[pieceRow][pieceCol].type != 3) {
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
		var pushSuccess = true;
		if ((grid[pieceRow][pieceCol].rot+2)%4 == grid[row][col].rot) {

			// TODO: Perform line weight calculation here and feed it to pushPiece()
			var weight = 3;
			pushSuccess = pushSuccess && pushPiece(pieceRow, pieceCol, row, col, weight);
		}
		else {
			routPiece(row, col);
		}
		
		if (pushSuccess) {
			grid[row][col].player = grid[pieceRow][pieceCol].player;
			grid[row][col].rot = grid[pieceRow][pieceCol].rot;
			grid[pieceRow][pieceCol].player = -1;
			grid[pieceRow][pieceCol].rot = -1;

			if (grid[row][col].type == 2 && grid[pieceRow][pieceCol].type == 3) { // rally rotation
				grid[row][col].rot = grid[row][col].player;
			}
			return true;	// return if a piece was moved so it can be redrawn
		}
	}
	return false;
}

function checkMove(pieceRow, pieceCol, row, col) {
	if (pieceRow < 0 || pieceCol < 0 || row < 0 || row >= 15 || col < 0 || col >= 21) { // bounds
		return false;
	}

	if (grid[row][col].type < 0 || grid[row][col].type == 3) { // invalid cell
		return false;
	}

	if (grid[row][col].player >= 0 && (grid[row][col].player - grid[pieceRow][pieceCol].player)%2 == 0) { // same team
		return false;
	}

	if (grid[row][col].type == 1 && (grid[row][col].zone - grid[pieceRow][pieceCol].player)%2 != 0 ) { // opponent win cell
		return false;
	}

	// TODO: This is commented out for ease of debugging
/*	if (grid[pieceRow][pieceCol].type != 3 && Math.abs(pieceRow-row) + Math.abs(pieceCol-col) > 1) { // adjacent cell
		return false;
	}
*/
	if (grid[pieceRow][pieceCol].type == 3 && (grid[row][col].type != 2 || grid[pieceRow][pieceCol].player != grid[row][col].zone) ) { // routed to respawn
		return false;
	}

	return true;
}

function pushPiece(pieceRow, pieceCol, row, col, weight) {
	if (weight > 1) { // check line weight
		if (grid[2*row - pieceRow][2*col - pieceCol].type == -1 || (grid[2*row - pieceRow][2*col - pieceCol].player >= 0
			&& Math.abs(grid[2*row - pieceRow][2*col - pieceCol].player - grid[row][col].player)%2 == 1)) { // Invalid or enemy square
			routPiece(row,col);
			return true;
		}

		if ((grid[2*row - pieceRow][2*col - pieceCol].type > -1 || grid[2*row - pieceRow][2*col - pieceCol].type < 3) 
			&& grid[2*row - pieceRow][2*col - pieceCol].player == -1) { // Empty square
			grid[2*row - pieceRow][2*col - pieceCol].player = grid[row][col].player;
			grid[2*row - pieceRow][2*col - pieceCol].rot = grid[row][col].rot;
			return true;
		}

		if (pushPiece(row, col, 2*row - pieceRow, 2*col - pieceCol, weight-1)) { // I'll move if my teammate behind me will.
			grid[2*row - pieceRow][2*col - pieceCol].player = grid[row][col].player;
			grid[2*row - pieceRow][2*col - pieceCol].rot = grid[row][col].rot;
			return true;
		}
	}
	return false;
}

function routPiece(row, col) {
	if (grid[row][col].player >= 0) {
		var cell = getRoutedCell(grid[row][col].player);

		grid[cell.routRow][cell.routCol].player = grid[row][col].player;
		grid[cell.routRow][cell.routCol].rot = grid[row][col].player;
	}
}

function getRoutedCell(player) {
	var emptyRow = -1;
	var emptyCol = -1;
	switch (player) {
		case 0: 
			for (var row=14; row>=0; --row) {
				for (var col=0; col<21; ++col) {
					if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
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
					if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
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
					if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
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
					if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
						emptyRow = row;
						emptyCol = col;
						return {routRow:emptyRow, routCol:emptyCol};
					}
				}
			}
			break;
	}	
}
