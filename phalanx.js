"use strict";

function getPhalanx(row, col) {
	var me = grid[row][col];
	me.checked = true;
	phalanx.push({row:row, col:col});

	if (me.kind != 3) {
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

function inPhalanx(row, col) {
	for (var i = phalanx.length - 1; i >= 0; --i) {
		if (phalanx[i].row == row && phalanx[i].col == col) {
			return true;
		}
	}
	return false;
}

function rotatePhalanx(pRow, pCol, rot) {
	if (inputMan.mode == 0) {
		for (var i = phalanx.length - 1; i >= 0; --i) {
			grid[phalanx[i].row][phalanx[i].col].rot = rot;
		}
	}
	else {
		grid[pRow][pCol].rot = rot;
	}
}

function movePhalanx(pRow, pCol, row, col) {
	if (checkMovePhalanx(pRow, pCol, row, col)) {
		var dRow = row - pRow;
		var dCol = col - pCol;
		var moved = false;
		
		// find the back of each row/col
		switch (inputMan.pRot) {
		case 0:
			for (var iCol = 0; iCol < 21; ++iCol) {
				for (var iRow = 14; iRow >= 0; --iRow) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						break;
					}
				}
			}
			break;
		case 1:
			for (var iRow = 0; iRow < 15; ++iRow) {
				for (var iCol = 0; iCol < 21; ++iCol) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						break;
					}
				}
			}
			break;
		case 2:
			for (var iCol = 0; iCol < 21; ++iCol) {
				for (var iRow = 0; iRow < 15; ++iRow) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
						}
						break;
					}
				}
			}
			break;
		case 3:
			for (var iRow = 0; iRow < 15; ++iRow) {
				for (var iCol = 20; iCol >= 0; --iCol) {
					if (inPhalanx(iRow, iCol)) {
						if (pushPiece(iRow, iCol, iRow + dRow, iCol + dCol, grid[iRow][iCol].player, 1)) {
							moveOnePiece(iRow, iCol, iRow + dRow, iCol + dCol);
							moved = true;
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
	switch (inputMan.pRot) {	// move one step forward only
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
