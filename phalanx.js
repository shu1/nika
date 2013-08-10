"use strict";

function getPhalanx(row, col) {
	var me = grid[row][col];
	me.checked = true;
	phalanx.push({row:row, col:col});

	if (row-1 >= 0) {
		var up = grid[row-1][col];
		if (up.player == me.player && up.rot == me.rot && !up.checked) {
			getPhalanx(row-1, col);
		}
	}

	if (col-1 >= 0) {
		var left = grid[row][col-1];
		if (left.player == me.player && left.rot == me.rot && !left.checked) {
			getPhalanx(row, col-1);
		}
	}

	if (row+1 < grid.length) {
		var down = grid[row+1][col];
		if (down.player == me.player && down.rot == me.rot && !down.checked) {
			getPhalanx(row+1, col);
		}
	}

	if (col+1 < grid[row].length) {
		var right = grid[row][col+1];
		if (right.player == me.player && right.rot == me.rot && !right.checked) {
			getPhalanx(row, col+1);
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

function movePhalanx(pieceRow, pieceCol, row, col) {
	var deltaRow = row - pieceRow;
	var deltaCol = col - pieceCol;
	var moveSuccess = true;
	
	// find the back of each row/col
	for (var i=0, len=phalanx.length; i<len; ++i) {
		if (!checkMove(phalanx[i].row + deltaRow, phalanx[i].col + deltaCol, phalanx[i].row, phalanx[i].col)    ) {
			moveSuccess = false;
		}
	}

	if(moveSuccess) {
		for (var i=0, len=phalanx.length; i<len; ++i) {
			movePiece(phalanx[i].row + deltaRow, phalanx[i].col + deltaCol, phalanx[i].row, phalanx[i].col)
		}
	}
}

function checkMovePhalanx(pieceRow, pieceCol, row, col) {
	var deltaRow = row - pieceRow;
	var deltaCol = col - pieceCol;

	for (var i=0,len=phalanx.length; i<len; ++i) {

		if (phalanx[i].row < 0 || phalanx[i].col < 0 || phalanx[i].row + deltaRow < 0 || phalanx[i].row + deltaRow >= 15 
			|| phalanx[i].col + deltaCol < 0 || phalanx[i].col + deltaCol >= 21) { // bounds
			return false;
		}

		if (grid[phalanx[i].row + deltaRow][phalanx[i].col + deltaCol].type < 0 
			|| grid[phalanx[i].row + deltaRow][phalanx[i].col + deltaCol].type == 3) { // invalid cell
			return false;
		}

		if (grid[phalanx[i].row + deltaRow][phalanx[i].col + deltaCol].player >= 0 && !inPhalanx(phalanx[i].row + deltaRow,phalanx[i].col + deltaCol) && 
			(grid[phalanx[i].row + deltaRow][phalanx[i].col + deltaCol].player - grid[phalanx[i].row][phalanx[i].col].player)%2 == 0) { // same team, not part of phalanx
			return false;
		}

		if (grid[phalanx[i].row + deltaRow][phalanx[i].col + deltaCol].type == 1 
			&& (grid[phalanx[i].row + deltaRow][phalanx[i].col + deltaCol].zone - grid[phalanx[i].row][phalanx[i].col].player)%2 != 0 ) { // opponent win cell
			return false;
		}
	}

	if (grid[pieceRow][pieceCol].type != 3 && Math.abs(deltaRow) + Math.abs(deltaCol) > 1) { // adjacent cell
		return false;
	}

	return true;
}