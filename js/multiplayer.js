"use strict";

function startNetGame(argID,argName){
	netGameMan.id = argID;
	netGameMan.name = argName;
	pushNetState();
	httpPost("http:///agile-eyrie-5416.herokuapp.com?func=savegame", netGameMan)
}

function getNetGame(argID){
	netGameMan.id = argID;
	httpGet(("http:///agile-eyrie-5416.herokuapp.com?func=findgame&id=" + argID))
}

function pushNetState() {
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

	// var state = {
	// 	grid:pGrid
	// }

	netGameMan.grid = pGrid;
}