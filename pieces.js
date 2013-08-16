"use strict";

function getPiece(row, col) {
	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].player >= 0) {
		playSound("pickup");

		phalanx = [];
		getPhalanx(row, col);
		clearChecked();

		return {row:row, col:col, rot:grid[row][col].rot};
	}
	return {row:-1, col:-1, rot:-1};	// no piece
}

function rotatePiece(pRow, pCol, row, col) {
	if (grid[pRow][pCol].kind != 3) {
		if (row < pRow) {		// up
			rotatePhalanx(pRow, pCol, 0);
		}
		else if (col > pCol) {	// right
			rotatePhalanx(pRow, pCol, 1);
		}
		else if (row > pRow) {	// down
			rotatePhalanx(pRow, pCol, 2);
		}
		else if (col < pCol) {	// left
			rotatePhalanx(pRow, pCol, 3);
		}
	}
}

function movePiece(pRow, pCol, row, col) {
	if (pRow >= 0 && pCol >= 0) {
		if (phalanxMan.mode == 0) {
			if (movePhalanx(pRow, pCol, row, col)) {
				playSound("move");
				phalanx = [];
				return true;
			}
		}
		else if (checkMove(pRow, pCol, row, col) && pushPiece(pRow, pCol, row, col, grid[pRow][pCol].player, 1)) {
			moveOnePiece(pRow, pCol, row, col);
			phalanx = [];

			if (grid[pRow][pCol].kind == 3 && grid[row][col].kind == 2) {	// rally
				grid[row][col].rot = grid[row][col].player;	// set rotation toward center of board
				playSound("rally");
			}
			else {
				playSound("move");
			}
			return true;	// return if a piece was moved so it can be redrawn
		}

		if (grid[pRow][pCol].rot != inputMan.pRot) {
			playSound("rotate");
		}
	}
	return false;
}

function moveOnePiece(pRow, pCol, row, col) {
	grid[row][col].player = grid[pRow][pCol].player;
	grid[row][col].rot = grid[pRow][pCol].rot;
	grid[pRow][pCol].player = -1;
	grid[pRow][pCol].rot = -1;
}

function checkMove(pRow, pCol, row, col) {
	if (pRow < 0 || pCol < 0 || row < 0 || row >= 15 || col < 0 || col >= 21										// bounds
	|| grid[row][col].kind < 0 || grid[row][col].kind == 3															// invalid cell
	|| (grid[pRow][pCol].kind != 3 && Math.abs(row - pRow) + Math.abs(col - pCol) > 1)								// adjacent cell
	|| (grid[row][col].kind == 1 && (grid[row][col].city - grid[pRow][pCol].player)%2 != 0 )						// opponent win cell
	|| (grid[pRow][pCol].kind == 3 && (grid[row][col].kind != 2 || grid[pRow][pCol].player != grid[row][col].city))	// routed to respawn
	|| (grid[row][col].player >= 0 && (grid[row][col].player - grid[pRow][pCol].player)%2 == 0)) {					// same team
		return false;
	}
	return true;
}

function pushPiece(pRow, pCol, row, col, pusher, weight) {
	if (grid[row][col].kind < 0 || grid[row][col].kind == 3) {	// invalid or routed cell
		return false;
	}

	if (grid[row][col].player < 0) {	// empty cell
		if (grid[row][col].kind == 0	// normal cell
		|| (grid[row][col].kind > 0 && Math.abs(grid[pRow][pCol].player - grid[row][col].city)%2 == 0)) {	// allied win or rally cell
			return true;
		}

		return false;
	}

	var fRow = 2*row - pRow;
	var fCol = 2*col - pCol;

	if (inPhalanx(row, col)) {
		if (pushPiece(row, col, fRow, fCol, pusher, weight+1)) {	// i'll push if the cell in front will too
			pushOnePiece(row, col, fRow, fCol, pusher);
			return true;
		}
		return false;
	}

	if (Math.abs(pusher - grid[row][col].player)%2 == 0) {	// non-phalanx ally
		return false;
	}
	else {	// enemy piece
		if ((grid[pRow][pCol].rot+2)%4 != grid[row][col].rot && grid[pRow][pCol].player == pusher) {	// not facing enemy
			routPiece(row,col);
			return true;
		}

		if (weight > 1) {	// check line weight
			if (grid[fRow][fCol].kind < 0 || grid[fRow][fCol].kind == 3												// pushed into invalid or routed cell
			|| (grid[fRow][fCol].player >= 0 && Math.abs(grid[fRow][fCol].player - grid[row][col].player)%2 == 1)	// pushed into enemy piece
			|| (grid[fRow][fCol].kind == 1 && Math.abs(grid[fRow][fCol].city - grid[row][col].player)%2 == 1)) {	// pushed into enemy win cell
				routPiece(row,col);
				return true;
			}

			if (pushPiece(row, col, fRow, fCol, pusher, weight-1)) {	// i'll be pushed if the piece behind me will too
				pushOnePiece(row, col, fRow, fCol, pusher);
				return true;
			}
		}
	}
	return false;
}

function pushOnePiece(row, col, fRow, fCol, pusher) {
	if (Math.abs((grid[row][col].player - pusher)%2) == 1) {
		playSound("push");	
	}
	
	grid[fRow][fCol].player = grid[row][col].player;
	grid[fRow][fCol].rot = grid[row][col].rot;
}

// move piece to rout cell
function routPiece(row, col) {
	if (grid[row][col].player >= 0) {
		playSound("rout");
		var cell = getRoutCell(grid[row][col].player);

		grid[cell.row][cell.col].player = grid[row][col].player;
		grid[cell.row][cell.col].rot = grid[row][col].player;
	}
}

// find first empty rout cell
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
