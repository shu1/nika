"use strict";

function getPiece(row, col) {
	gameMan.pRow = -1;
	gameMan.pCol = -1;
	gameMan.pRot = -1;

	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].player >= 0 && (gameMan.debug || grid[row][col].player == gameMan.player)) {
		gameMan.pRow = row;
		gameMan.pCol = col;
		gameMan.pRot = grid[row][col].rot;

		if (gameMan.mode == 0) {
			phalanx.length = 0;
			getPhalanx(row, col);
			clearChecked();	
		} 
	}
}

function rotatePiece(pRow, pCol, rot) {
	if (grid[pRow][pCol].kind != 3) {
		for (var i = phalanx.length-1; i >= 0; --i) {
			grid[phalanx[i].row][phalanx[i].col].rot = rot;
		}
	}
}

function movePiece(pRow, pCol, row, col) {
	var moved = false;
	if (pRow >= 0 && pCol >= 0) {
		if (phalanx.length > 1) {
			if (movePhalanx(pRow, pCol, row, col)) {
				playSound("move");
				phalanx.length = 0;
				moved = true;
			}
		}
		else if (checkMove(pRow, pCol, row, col) && pushPiece(pRow, pCol, row, col, grid[pRow][pCol].player, 1)) {
			moveOnePiece(pRow, pCol, row, col);
			phalanx.length = 0;
			moved = true;	// return if a piece was moved so it can be redrawn

			if (grid[pRow][pCol].kind == 3 && grid[row][col].kind == 2) {	// rally
				grid[row][col].rot = grid[row][col].player;	// set rotation toward center of board
				playSound("rally");
			}
			else {
				playSound("move");
			}
		}

		if (grid[pRow][pCol].rot != gameMan.pRot) {
			playSound("rotate");
			phalanx.length = 0;
			moved = true;
		}

		if (moved) {
			useAction();
			pushGameState();
		}
	}

	return moved;
}

function moveOnePiece(pRow, pCol, row, col) {
	grid[row][col].player = grid[pRow][pCol].player;
	if (row < pRow) {		// up
		grid[row][col].rot = 0;
	}
	else if (col > pCol) {	// right
		grid[row][col].rot = 1;
	}
	else if (row > pRow) {	// down
		grid[row][col].rot = 2;
	}
	else if (col < pCol) {	// left
		grid[row][col].rot = 3;
	}

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

function inPhalanx(row, col) {
	for (var i = phalanx.length - 1; i >= 0; --i) {
		if (phalanx[i].row == row && phalanx[i].col == col) {
			return true;
		}
	}
	return false;
}

function getPhalanx(row, col) {
	var me = grid[row][col];
	me.checked = true;
	phalanx.push({row:row, col:col});

	if (me.kind != 3) { // check adjacent if not-routed-square
		if (row-1 >= 0) {
			var up = grid[row-1][col];
			if (up.player == me.player && up.rot == me.rot && !up.checked && up.kind != 3) {
				getPhalanx(row-1, col);
			}
		}

		if (col-1 >= 0) {
			var left = grid[row][col-1];
			if (left.player == me.player && left.rot == me.rot && !left.checked && left.kind != 3) {
				getPhalanx(row, col-1);
			}
		}

		if (row+1 < grid.length) {
			var down = grid[row+1][col];
			if (down.player == me.player && down.rot == me.rot && !down.checked && down.kind != 3) {
				getPhalanx(row+1, col);
			}
		}

		if (col+1 < grid[row].length) {
			var right = grid[row][col+1];
			if (right.player == me.player && right.rot == me.rot && !right.checked && right.kind != 3) {
				getPhalanx(row, col+1);
			}
		}
	}
}

function movePhalanx(pRow, pCol, row, col) {
	if (checkMovePhalanx(pRow, pCol, row, col)) {
		var dRow = row - pRow;
		var dCol = col - pCol;
		var moved = false;
		var flag = true;
		
		// find the back of each row/col
		switch (gameMan.pRot) {
		case 0:
			for (var iCol = 0; iCol < 21 && flag; ++iCol) {
				for (var iRow = 14; iRow >= 0; --iRow) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						else {
							revertGrid();
							moved = false;
							flag = false;
						}
						break;
					}
				}
			}
			break;
		case 1:
			for (var iRow = 0; iRow < 15 && flag; ++iRow) {
				for (var iCol = 0; iCol < 21; ++iCol) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						else {
							revertGrid();
							moved = false;
							flag = false;
						}
						break;
					}
				}
			}
			break;
		case 2:
			for (var iCol = 0; iCol < 21 && flag; ++iCol) {
				for (var iRow = 0; iRow < 15; ++iRow) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						else {
							revertGrid();
							moved = false;
							flag = false;
						}
						break;
					}
				}
			}
			break;
		case 3:
			for (var iRow = 0; iRow < 15 && flag; ++iRow) {
				for (var iCol = 20; iCol >= 0; --iCol) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						else {
							revertGrid();
							moved = false;
							flag = false;
						}
						break;
					}
				}
			}
			break;
		}
	}

	return moved;
}

function checkMovePhalanx(pRow, pCol, row, col) {
	if (pRow < 0 || pCol < 0 || row < 0 || row >= 15 || col < 0 || col >= 21) {	// TODO: check if this is still necessary
		return false;
	}

	var dRow = row - pRow;
	var dCol = col - pCol;
	for (var i = phalanx.length-1; i >= 0; --i) {
		var iRow = phalanx[i].row;
		var iCol = phalanx[i].col;

		if (iRow < 0 || iCol < 0 || iRow + dRow < 0 || iRow + dRow >= 15 || iCol + dCol < 0 || iCol + dCol >= 21					// bounds
		||  grid[iRow + dRow][iCol + dCol].kind < 0 || grid[iRow + dRow][iCol + dCol].kind == 3										// invalid cell
		|| (grid[iRow + dRow][iCol + dCol].kind == 1 && (grid[iRow + dRow][iCol + dCol].city - grid[iRow][iCol].player)%2 != 0 )	// opponent win cell
		|| (grid[iRow + dRow][iCol + dCol].player >= 0 && !inPhalanx(iRow + dRow, iCol + dCol)
		&& (grid[iRow + dRow][iCol + dCol].player - grid[iRow][iCol].player)%2 == 0)) {	// same team, not part of phalanx
			return false;
		}
	}

	var eRow = 0;
	var eCol = 0;
	switch (gameMan.pRot) {	// move one step forward only
		case 0:
			eRow = -1;
			break;
		case 1:
			eCol = 1;
			break;
		case 2:
			eRow = 1;
			break;
		case 3:
			eCol = -1;
			break;
	}

	if (dRow != eRow || dCol != eCol) {
		return false;
	}

	return true;
}

function togglePhalanxPiece(row, col) {
	if (inPhalanx(row, col) && phalanx.length > 1) {	// if in phalanx, find and remove
		for (var i = phalanx.length-1; i >= 0; --i) {
			if (phalanx[i].row == row && phalanx[i].col == col) {
				phalanx.splice(i, 1);
				return;
			}
		}
	}
	else {	// else add to phalanx if you can
		if (phalanx.length == 0) {
			phalanx.push({row:row, col:col});
			return;
		}

		for (var i = phalanx.length-1; i >= 0; --i) {
			if (Math.abs(phalanx[i].row-row) + Math.abs(phalanx[i].col-col) == 1 	// adjacent cell
			&& grid[phalanx[i].row][phalanx[i].col].player == grid[row][col].player	// same player
			&& grid[phalanx[i].row][phalanx[i].col].rot == grid[row][col].rot 		// same rotation
			&& grid[row][col].kind != 3) { 											// not routed cell
				phalanx.push({row:row, col:col});
				return;
			}
		}

		phalanx.length = 0;
		phalanx.push({row:row, col:col});
	}
}
