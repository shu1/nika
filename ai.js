"use strict";

function ai(row, col) {
	var player;

	if (row == 12 && col >= 6 && col <= 8) {
		player = 0;
		hudMan.gameText = "Athens ";
	}
	else if (col == 2 && row >= 3 && row <= 5) {
		player = 1;
		hudMan.gameText = "Sparta ";
	}
	else if (row == 2 && col >= 12 && col <= 14) {
		player = 2;
		hudMan.gameText = "Messene ";
	}
	else if (col == 18 && row >= 9 && row <= 11) {
		player = 3;
		hudMan.gameText = "Thebes ";
	}
	else {
		hudMan.gameText = "";
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
		else if (rot == 3) {
			--col;
		}

		var action = Math.floor(Math.random());
		if (action == 0) {
			done = movePiece(pieces[i].row, pieces[i].col, row, col);
		}
		else if (action == 1) {
			done = rotatePiece(pieces[i].row, pieces[i].col, row, col);
		}

		console.log(i + " " + pieces[i].row + "," + pieces[i].col + " " + rot + " " + row + "," + col + " " + action);
	}
	console.log("");

	return true;
}
