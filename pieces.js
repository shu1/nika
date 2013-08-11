"use strict";

function getPiece(row, col) {
	inputMan.pieceRow = -1;
	inputMan.pieceCol = -1;
	
	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].player >= 0) {
		playAudio("pick");
		inputMan.pieceRow = row;
		inputMan.pieceCol = col;
	}
}

function rotatePiece(pieceRow, pieceCol, row, col) {
	if (grid[pieceRow][pieceCol].type != 3) {
		if (row < pieceRow) {
			rotatePhalanx(0);
		}
		else if (col > pieceCol) {
			rotatePhalanx(1);
		}
		else if (row > pieceRow) {
			rotatePhalanx(2);
		}
		else if (col < pieceCol) {
			rotatePhalanx(3);
		}
	}
}

function movePiece(pieceRow, pieceCol, row, col) {
	if (pieceRow == row && pieceCol == col) {
		return false;
	}
	
	if (checkMove(pieceRow, pieceCol, row, col)) {
		var pushSuccess = true;
//		if ((grid[pieceRow][pieceCol].rot+2)%4 == grid[row][col].rot) {
			pushSuccess = pushSuccess && pushPiece(pieceRow, pieceCol, row, col, grid[pieceRow][pieceCol].player, 1);
/*		}
		else {
			console.log("I got called "+row+" "+col);
			routPiece(row, col);
		}
*/		
		if (pushSuccess) {
			playAudio("move");
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

	if (grid[row][col].player >= 0 && (grid[row][col].player - grid[pieceRow][pieceCol].player)%2 == 0 && !inPhalanx(row,col)) { // same team
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

function pushPiece(pieceRow, pieceCol, row, col, pusher, weight) {
	// the piece at (pieceRow, pieceCol) is trying to push me, the piece at (row, col), with a strength of (weight)

	if (grid[row][col].type == -1 || grid[row][col].type == 3) { // if i'm an invalid or routed square
		console.log("I'm invalid or routed "+row+" "+col);
		return false;
	}
	
	if (grid[row][col].player == -1) { // if i'm empty
		console.log("I'm empty "+row+" "+col);
		if (grid[row][col].type == 0) { // regular board sq
			console.log("I'm a regular square "+row+" "+col);
			return true;
		}

		if ((grid[row][col].type == 1 || grid[row][col].type == 2) && Math.abs(pusher - grid[row][col].zone)%2 == 0) { // i'm an allied win or rally square
			console.log("I'm an allied win/rally "+row+" "+col);
			return true;
		}

		return false;
	}
	
	if (inPhalanx(row,col)) { // i'm a phalanx member
		console.log("I'm in the phalanx, push forward with +1 weight"+row+" "+col);
		if (pushPiece(row, col, 2*row - pieceRow, 2*col - pieceCol, pusher, weight+1)) { // I'll push if the square in front will too.
			grid[2*row - pieceRow][2*col - pieceCol].player = grid[row][col].player;
			grid[2*row - pieceRow][2*col - pieceCol].rot = grid[row][col].rot;
			return true;
		}
		return false;
	}

	if (Math.abs(pusher - grid[row][col].player)%2 == 0) { // i'm a non-phalanx ally
		console.log("I'm an ally, not in phalanx "+row+" "+col);
		return false;
	}
	else {	// i'm an enemy piece
		if ((grid[pieceRow][pieceCol].rot+2)%4 != grid[row][col].rot && grid[pieceRow][pieceCol].player == pusher) { // not facing enemy
			console.log("Facing wrong way "+row+" "+col);
			routPiece(row,col);
			return true;
		}
		
		if (weight > 1) { // check line weight
			if (grid[2*row - pieceRow][2*col - pieceCol].type == -1 
				|| grid[2*row - pieceRow][2*col - pieceCol].type == 3) { // pushed into invalid or routed square

				console.log("Routed: pushed into invalid square "+row+" "+col);
				routPiece(row,col);
				return true;
			}
			
			if (grid[2*row - pieceRow][2*col - pieceCol].player >= 0 
				&& Math.abs(grid[2*row - pieceRow][2*col - pieceCol].player - grid[row][col].player)%2 == 1) { // pushed into enemy piece

				console.log("Routed: pushed into enemy piece "+row+" "+col);
				routPiece(row,col);
				return true;	
			}
			
			if (grid[2*row - pieceRow][2*col - pieceCol].type == 1 
				&& Math.abs(grid[2*row - pieceRow][2*col - pieceCol].zone - grid[row][col].player)%2 == 1) { // pushed into enemy win square

				console.log("Routed: pushed into enemy win square "+row+" "+col);
				routPiece(row,col);
				return true;
			}

			console.log("If those behind can be pushed with -1 weight... "+row+" "+col);
			if (pushPiece(row, col, 2*row - pieceRow, 2*col - pieceCol, pusher, weight-1)) { // I'll be pushed if the square behind me will too.
				grid[2*row - pieceRow][2*col - pieceCol].player = grid[row][col].player;
				grid[2*row - pieceRow][2*col - pieceCol].rot = grid[row][col].rot;
				return true;
			}
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
		for (var row = 14; row >= 0; --row) {
			for (var col = 0; col < 21; ++col) {
				if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
					emptyRow = row;
					emptyCol = col;
					return {routRow:emptyRow, routCol:emptyCol};
				}
			}
		}
		break;
	case 1:	
		for (var col = 0; col < 21; ++col) {
			for (var row = 0; row < 15; ++row) {
				if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
					emptyRow = row;
					emptyCol = col;
					return {routRow:emptyRow, routCol:emptyCol};
				}
			}
		}
		break;
	case 2:
		for (var row = 0; row < 15; ++row) {
			for (var col = 20; col >= 0; --col) {
				if (grid[row][col].type == 3 && grid[row][col].zone == player && grid[row][col].player < 0) {
					emptyRow = row;
					emptyCol = col;
					return {routRow:emptyRow, routCol:emptyCol};
				}
			}
		}
		break;
	case 3:
		for (var col = 20; col >= 0; --col) {
			for (var row = 14; row >= 0; --row) {
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
