"use strict";

function generateGrid(ascii) {
	grid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		grid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var a = ascii[row][col];
			var cell = {
				checked:false,
				player:-1,
				kind:-1,
				city:-1,
				rot:-1,
				ring:-1
			}

			if (a == 'A' || a == 'B' || a == 'C' || a == 'D') {
				cell.player = 0;
			}
			else if (a == 'E' || a == 'F' || a == 'G' || a == 'H') {
				cell.player = 1;
			}
			else if (a == 'I' || a == 'J' || a == 'K' || a == 'L') {
				cell.player = 2;
			}
			else if (a == 'M' || a == 'N' || a == 'O' || a == 'P') {
				cell.player = 3;
			}

			if (a == 'A' || a == 'E' || a == 'I' || a == 'M') {
				cell.rot = 0;
			}
			else if (a == 'B' || a == 'F' || a == 'J' || a == 'N') {
				cell.rot = 1;
			}
			else if (a == 'C' || a == 'G' || a == 'K' || a == 'O') {
				cell.rot = 2;
			}
			else if (a == 'D' || a == 'H' || a == 'L' || a == 'P') {
				cell.rot = 3;
			}

			if (a == 'a' || a == 'b' || a == 'c' || a == 'd' || cell.player == 0) {
				cell.city = 0;
			}
			else if (a == 'e' || a == 'f' || a == 'g' || a == 'h' || cell.player == 1) {
				cell.city = 1;
			}
			else if (a == 'i' || a == 'j' || a == 'k' || a == 'l' || cell.player == 2) {
				cell.city = 2;
			}
			else if (a == 'm' || a == 'n' || a == 'o' || a == 'p' || cell.player == 3) {
				cell.city = 3;
			}

			if (a == 'a' || a == 'e' || a == 'i' || a == 'm' || cell.player >= 0) {
				cell.kind = 0;	// normal
			}
			else if (a == 'b' || a == 'f' || a == 'j' || a == 'n') {
				cell.kind = 1;	// goal
			}
			else if (a == 'c' || a == 'g' || a == 'k' || a == 'o') {
				cell.kind = 2;	// rally
			}
			else if (a == 'd' || a == 'h' || a == 'l' || a == 'p') {
				cell.kind = 3;	// routed
			}

			grid[row][col] = cell;
		}
	}
	mediaMan.draw = true;
}

function debugGrid() {
	for (var row = 0; row < 15; ++row) {
		var str = "";
		for (var col = 0; col < 21; ++col) {
			var a = grid[row][col].city; 
			str += (a == -1) ? '.' : a;
		}
		console.log(str);
	}
}

function mainMenu(row, col) {

	if (row < mainMenuMan.rows * mainMenuMan.bHeight / cellSize && col < mainMenuMan.cols * mainMenuMan.bWidth / cellSize) {
		var button = Math.ceil( cellSize*(col+1)/mainMenuMan.bWidth ) + Math.ceil( mainMenuMan.cols * cellSize*row/mainMenuMan.bHeight );
		
		switch (button) {
			case 1:
				gameMan.mode = 0;
				break;
			case 2:
				gameMan.mode = 0;
				nextTutorial();
				break;
			case 3:
				gameMan.mode = 2;
				break;
			case 4:
				gameMan.mode = 3;
				break;
			case 5:
				alert("Please exit this application manually. Thank you.");
				break;
		}
		return true;
	}

	return false;
}

function settingsMenu(row,col) {
	if (row < mainMenuMan.rows * mainMenuMan.bHeight / cellSize && col < mainMenuMan.cols * mainMenuMan.bWidth / cellSize) {
		var button = Math.ceil( cellSize*(col+1)/mainMenuMan.bWidth ) + Math.ceil( mainMenuMan.cols * cellSize*row/mainMenuMan.bHeight );

		switch (button) {
			case 1:
				gameMan.mode = 1;
				break;
		}
	}
}

function creditsMenu(row,col) {
	if (row < mainMenuMan.rows * mainMenuMan.bHeight / cellSize && col < mainMenuMan.cols * mainMenuMan.bWidth / cellSize) {
		var button = Math.ceil( cellSize*(col+1)/mainMenuMan.bWidth ) + Math.ceil( mainMenuMan.cols * cellSize*row/mainMenuMan.bHeight );

		switch (button) {
			case 1:
				gameMan.mode = 1;
				break;
		}
	}
}

function clearChecked() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			grid[row][col].checked = false;
		}
	}
}

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

	hudMan.gameText = getCity(gameMan.player) + gameMan.actions + " moves left";
	checkWin();
}

function getCity(player) {
	switch (player) {
	case 0:
		return "Athens ";
	case 1:
		return "Sparta ";
	case 2:
		return "Messene ";
	case 3:
		return "Thebes ";
	}
}

function getPartner(player) {
	switch (player) {
	case 0:
		return 2;
	case 1:
		return 3;
	case 2:
		return 0;
	case 3:
		return 1;
	}
}

function pushGameState() {
	var pGrid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		pGrid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var cell = {
				checked: grid[row][col].checked,
				player : grid[row][col].player,
				kind   : grid[row][col].kind,
				city   : grid[row][col].city,
				rot    : grid[row][col].rot,
				ring   : grid[row][col].ring
			}
			pGrid[row][col] = cell;
		}
	}

	var state = {
		grid:pGrid,
		player:gameMan.player,
		actions:gameMan.actions
	}

	gameStates.push(state);
	if (gameStates.length > 16) {	// number of undos to hold
		gameStates.shift();
	}
}

function undo() {
	if (gameStates.length > 1) {
		gameStates.pop();
		revertGrid();
		gameMan.player = gameStates[gameStates.length-1].player;
		gameMan.actions = gameStates[gameStates.length-1].actions;
		hudMan.gameText = getCity(gameMan.player) + gameMan.actions + " moves left";
	}
}

function revertGrid() {
	var pGrid = gameStates[gameStates.length-1].grid;
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
}

function checkWin() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].kind == 1 && grid[row][col].player >= 0 && grid[row][col].player != grid[row][col].city) {
				hudMan.pieceText = getCity(grid[row][col].player) + "and " + getCity(getPartner(grid[row][col].player)) + "win!";
				alert(hudMan.pieceText);
			}
		}
	}
}
