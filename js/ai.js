"use strict";

function ai() {
	var pieces = [];
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player == gameMan.player) {
				pieces.push({row:row, col:col});
			}
		}
	}

	var tries = 12;
	while (tries > 0) {
		var i = Math.floor(Math.random()*6);
		var row = pieces[i].row;
		var col = pieces[i].col;
		var rots;

		switch (gameMan.player) {
		case 0:
			if (row < 7 && col > 8 && col < 12 || row > 5 && (col < 6 || col > 14)) {
				rots = [0];
			}
			else if (row < 7 && col < 10 || row > 7 && col > 10) {
				rots = [0, 1];
			}
			else if (row < 7 && col > 10 || row > 7 && col < 10) {
				rots = [0, 3];
			}
			else {
				rots = [0, 1, 3];
			}
			break;
		case 1:
			if (col > 10 && row > 5 && row < 9 || col < 15 && (row < 6 || row > 8)) {
				rots = [1];
			}
			else if (col > 10 && row > 7 || col < 10 && row < 7) {
				rots = [1, 0];
			}
			else if (col > 10 && row < 7 || col < 10 && row > 7) {
				rots = [1, 2];
			}
			else {
				rots = [1, 0, 2];
			}
			break;
		case 2:
			if (row > 7 && col > 8 && col < 12 || row < 9 && (col < 6 || col > 14)) {
				rots = [2];
			}
			else if (row > 7 && col < 10 || row < 7 && col > 10) {
				rots = [2, 1];
			}
			else if (row > 7 && col > 10 || row < 7 && col < 10) {
				rots = [2, 3];
			}
			else {
				rots = [2, 1, 3];
			}
			break;
		case 3:
			if (col < 10 && row > 5 && row < 9 || col > 6 && (row < 6 || row > 8)) {
				rots = [3];
			}
			else if (col < 10 && row > 7 || col > 10 && row < 7) {
				rots = [3, 0];
			}
			else if (col < 10 && row < 7 || col > 10 && row > 7) {
				rots = [3, 2];
			}
			else {
				rots = [3, 0, 2];
			}
			break;
		}

		phalanx.length = 0;
		phalanx.push({row:row, col:col});
		gameMan.pRot = grid[row][col].rot;	// Only single pieces
//		getPiece(row, col);					// Only phalanxes

		var rot = rots[Math.floor(Math.random()*rots.length)];
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

		if (movePiece(pieces[i].row, pieces[i].col, row, col)) {
			tries = 0;
		}
		else if (--tries <= 0) {
			console.log(getCity(gameMan.player) + "AI gives up");
			useAction(2);
		}
	}
}
