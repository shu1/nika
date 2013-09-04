"use strict";

function useAction(n) {
	if (typeof n == 'undefined') {
		n = 1;
	}

	gameMan.actions -= n;
	if (gameMan.actions <= 0) {
		gameMan.actions = 2;

		gameMan.player++;
		if (gameMan.player >= 4) {
			gameMan.player = 0;
		}
	}
}

function pushGameState() {
	var pGrid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		pGrid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var cell = {
				checked: grid[row][col].checked,
				player:  grid[row][col].player,
				kind:    grid[row][col].kind,
				city:    grid[row][col].city,
				rot:     grid[row][col].rot,
				ring:    grid[row][col].ring
			}
			pGrid[row][col] = cell;
		}
	}

	gameStates.push(pGrid);
	if (gameStates.length > 10) {	// number of undos to hold
		gameStates.shift();
	}
}

function undo(row, col) {
	if (gameStates.length > 1 && row >= 13 && row <= 14 && col >= 0 && col <= 1) {	// 2x2 at bottom left
		gameStates.pop();

		var pGrid = gameStates[gameStates.length - 1];
		for (var row = 0; row < 15; ++row) {
			for (var col = 0; col < 21; ++col) {
				grid[row][col].checked = pGrid[row][col].checked;
				grid[row][col].player  = pGrid[row][col].player;
				grid[row][col].kind    = pGrid[row][col].kind;
				grid[row][col].city    = pGrid[row][col].city;
				grid[row][col].rot     = pGrid[row][col].rot;
				grid[row][col].ring    = pGrid[row][col].ring;
			}
		}

		return true;
	}
	return false;
}
