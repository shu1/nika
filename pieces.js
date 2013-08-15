"use strict";

function getPiece(row, col) {
	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].player >= 0) {
		playAudio("pick");
		return {row:row, col:col};
	}

	return {row:-1, col:-1};
}

function rotatePiece(pRow, pCol, row, col) {
	if (grid[pRow][pCol].kind != 3) {
		if (row < pRow) {
			rotatePhalanx(pRow, pCol, 0);
		}
		else if (col > pCol) {
			rotatePhalanx(pRow, pCol, 1);
		}
		else if (row > pRow) {
			rotatePhalanx(pRow, pCol, 2);
		}
		else if (col < pCol) {
			rotatePhalanx(pRow, pCol, 3);
		}
	}
}

function movePiece(pRow, pCol, row, col) {
	if (phalanxMan.mode == 0) {
		if(movePhalanx(pRow, pCol, row, col)) {
			phalanx = [];
			return true;
		}
	}
	else if (!(row == pRow && col == pCol) && checkMove(pRow, pCol, row, col)
	&& pushPiece(pRow, pCol, row, col, grid[pRow][pCol].player, 1)) {
		moveSinglePiece(pRow, pCol, row, col);
		phalanx = [];
		if (grid[pRow][pCol].kind == 3 && grid[row][col].kind == 2) {	// rally rotation
			grid[row][col].rot = grid[row][col].player;
		}

		moveHistory.push([actionType.pieceMove,pRow,pCol,row,col])
		return true;	// return if a piece was moved so it can be redrawn
	}
	return false;
}

function moveSinglePiece(pRow, pCol, row, col) {
	playAudio("move");
	grid[row][col].player = grid[pRow][pCol].player;
	grid[row][col].rot = grid[pRow][pCol].rot;
	grid[pRow][pCol].player = -1;
	grid[pRow][pCol].rot = -1;
}

function checkMove(pRow, pCol, row, col) {
	if (pRow < 0 || pCol < 0 || row < 0 || row >= 15 || col < 0 || col >= 21												// bounds
	|| grid[row][col].kind < 0 || grid[row][col].kind == 3																	// invalid cell
	|| (grid[pRow][pCol].kind != 3 && Math.abs(pRow-row) + Math.abs(pCol-col) > 1)											// adjacent cell
	|| (grid[row][col].kind == 1 && (grid[row][col].city - grid[pRow][pCol].player)%2 != 0 )								// opponent win cell
	|| (grid[pRow][pCol].kind == 3 && (grid[row][col].kind != 2 || grid[pRow][pCol].player != grid[row][col].city))			// routed to respawn
	|| (grid[row][col].player >= 0 && (grid[row][col].player - grid[pRow][pCol].player)%2 == 0 && !inPhalanx(row, col))) {	// same team
		return false;
	}
	return true;
}

// the piece at (pRow, pCol) is trying to push me, the piece at (row, col), with a strength of (weight)
function pushPiece(pRow, pCol, row, col, pusher, weight) {	
	if (grid[row][col].kind == -1 || grid[row][col].kind == 3) { // if i'm an invalid or routed square
		console.log("I'm invalid or routed "+row+" "+col);
		return false;
	}
	
	if (grid[row][col].player == -1) { // if i'm empty
		console.log("I'm empty "+row+" "+col);
		if (grid[row][col].kind == 0) { // regular board sq
			console.log("I'm a regular square "+row+" "+col);
			return true;
		}

		if ((grid[row][col].kind == 1 || grid[row][col].kind == 2) && Math.abs(grid[pRow][pCol].player - grid[row][col].city)%2 == 0) { // i'm an allied win or rally square
			console.log("I'm an allied win/rally "+row+" "+col);
			return true;
		}

		return false;
	}
	
	if (inPhalanx(row,col)) { // i'm a phalanx member
		console.log("I'm in the phalanx, push forward with +1 weight"+row+" "+col);
		if (pushPiece(row, col, 2*row - pRow, 2*col - pCol, pusher, weight+1)) { // I'll push if the square in front will too.
			grid[2*row - pRow][2*col - pCol].player = grid[row][col].player;
			grid[2*row - pRow][2*col - pCol].rot = grid[row][col].rot;
			return true;
		}
		return false;
	}

	if (Math.abs(pusher - grid[row][col].player)%2 == 0) { // i'm a non-phalanx ally
		console.log("I'm an ally, not in phalanx "+row+" "+col);
		return false;
	}
	else {	// i'm an enemy piece
		if ((grid[pRow][pCol].rot+2)%4 != grid[row][col].rot && grid[pRow][pCol].player == pusher) { // not facing enemy
			console.log("Facing wrong way "+row+" "+col);
			routPiece(row,col);
			return true;
		}
		
		if (weight > 1) { // check line weight
			if (grid[2*row - pRow][2*col - pCol].kind == -1 
				|| grid[2*row - pRow][2*col - pCol].kind == 3) { // pushed into invalid or routed square

				console.log("Routed: pushed into invalid square "+row+" "+col);
				routPiece(row,col);
				return true;
			}
			
			if (grid[2*row - pRow][2*col - pCol].player >= 0 
				&& Math.abs(grid[2*row - pRow][2*col - pCol].player - grid[row][col].player)%2 == 1) { // pushed into enemy piece

				console.log("Routed: pushed into enemy piece "+row+" "+col);
				routPiece(row,col);
				return true;	
			}
			
			if (grid[2*row - pRow][2*col - pCol].kind == 1 
				&& Math.abs(grid[2*row - pRow][2*col - pCol].city - grid[row][col].player)%2 == 1) { // pushed into enemy win square

				console.log("Routed: pushed into enemy win square "+row+" "+col);
				routPiece(row,col);
				return true;
			}

			console.log("If those behind can be pushed with -1 weight... "+row+" "+col);
			if (pushPiece(row, col, 2*row - pRow, 2*col - pCol, pusher, weight-1)) { // I'll be pushed if the square behind me will too.
				grid[2*row - pRow][2*col - pCol].player = grid[row][col].player;
				grid[2*row - pRow][2*col - pCol].rot = grid[row][col].rot;
				return true;
			}
		}
	}
	return false;
}

function routPiece(row, col) {
	if (grid[row][col].player >= 0) {
		var cell = getRoutCell(grid[row][col].player);

		grid[cell.row][cell.col].player = grid[row][col].player;
		grid[cell.row][cell.col].rot = grid[row][col].player;
	}
}

function getRoutCell(player) {
	switch (player) {
	case 0: 
		for (var row = 14; row >= 0; --row) {
			for (var col = 0; col < 21; ++col) {
				if (grid[row][col].kind == 3 && grid[row][col].city == player && grid[row][col].player < 0) {
					return {row:row, col:col};
				}
			}
		}
		break;
	case 1:	
		for (var col = 0; col < 21; ++col) {
			for (var row = 0; row < 15; ++row) {
				if (grid[row][col].kind == 3 && grid[row][col].city == player && grid[row][col].player < 0) {
					return {row:row, col:col};
				}
			}
		}
		break;
	case 2:
		for (var row = 0; row < 15; ++row) {
			for (var col = 20; col >= 0; --col) {
				if (grid[row][col].kind == 3 && grid[row][col].city == player && grid[row][col].player < 0) {
					return {row:row, col:col};
				}
			}
		}
		break;
	case 3:
		for (var col = 20; col >= 0; --col) {
			for (var row = 14; row >= 0; --row) {
				if (grid[row][col].kind == 3 && grid[row][col].city == player && grid[row][col].player < 0) {
					return {row:row, col:col};
				}
			}
		}
		break;
	}	
}
