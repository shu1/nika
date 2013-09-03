"use strict";

function useAction(n) {
	n = typeof n !== 'undefined' ? n : 1;
	gameMan.actions -= n;
	if (gameMan.actions == 0) {
		nextPlayer();
		gameMan.actions = 2;
	}
}

function nextPlayer() {
	gameMan.player++;
	if (gameMan.player >= 4) {
		gameMan.player = 0;
	}
}

function pushGameState() {
	var tempGrid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		tempGrid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var cell = {
				checked:false,
				player:-1,
				kind:-1,
				city:-1,
				rot:-1,
				ring:-1
			}
			tempGrid[row][col] = cell;
		}
	}

	gridCopy(tempGrid, grid);
	moveHistory.push(tempGrid);
	if (moveHistory.length > moveMemory) {
		moveHistory.splice(0, moveHistory.length - moveMemory);
	}
	console.log(moveHistory);
}

function undo() {
	if (moveHistory.length > 1) {
		moveHistory.pop();
		grid = moveHistory[moveHistory.length - 1];
		mediaMan.draw = true;
	}
}

function gridCopy(targetGrid, sourceGrid) {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			targetGrid[row][col].checked = sourceGrid[row][col].checked;
			targetGrid[row][col].player  = sourceGrid[row][col].player;
			targetGrid[row][col].kind    = sourceGrid[row][col].kind;
			targetGrid[row][col].city    = sourceGrid[row][col].city;
			targetGrid[row][col].rot     = sourceGrid[row][col].rot;
			targetGrid[row][col].ring    = sourceGrid[row][col].ring;
		}
	}
}			