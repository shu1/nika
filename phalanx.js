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
