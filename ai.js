"use strict";

function ai(row, col) {
	var player;
	if (row >= 13 && row <= 14 && col >= 20 && col <= 21) {	// 2x2 at bottom right
		player = gameMan.player;
	}
	else {
		return false;
	}

	pieces.length = 0;
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player == player) {
				pieces.push({row:row, col:col});
			}
		}
	}

	var done = false;
	while (!done) {
		var i = Math.floor(Math.random()*6);
		var row = pieces[i].row;
		var col = pieces[i].col;

		phalanx.length = 0;
		phalanx.push({row:row, col:col});
		gameMan.pRot = grid[row][col].rot;	// Only single pieces
//		getPiece(row, col);					// Only phalanxes

		var rot = Math.floor(Math.random()*4);
		if (rot == 0) {
			--row;
		}
		else if (rot == 1) {
			++col;
		}
		else if (rot == 2) {
			++row;
		}
		else {
			--col;
		}

		var action = Math.floor(Math.random()*1.5);
		if (action == 0) {
			done = movePiece(pieces[i].row, pieces[i].col, row, col);
		}
		else if (action == 1) {
			rotatePiece(pieces[i].row, pieces[i].col, row, col);
			done = movePiece(pieces[i].row, pieces[i].col, pieces[i].row, pieces[i].col);
		}

		console.log(i + " " + pieces[i].row + "," + pieces[i].col + " " + rot + " " + row + "," + col + " " + action);
	}
	console.log("");

	return true;
}
