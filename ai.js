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

	return true;
}
