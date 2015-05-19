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
				ring:-1,
				prompt:-1,
				row:-1,
				col:-1
			}

			if (a == 'A' || a == 'B' || a == 'C' || a == 'D' || a == 'Q') {
				cell.player = 0;
			}
			else if (a == 'E' || a == 'F' || a == 'G' || a == 'H' || a == 'R') {
				cell.player = 1;
			}
			else if (a == 'I' || a == 'J' || a == 'K' || a == 'L' || a == 'S') {
				cell.player = 2;
			}
			else if (a == 'M' || a == 'N' || a == 'O' || a == 'P' || a == 'T') {
				cell.player = 3;
			}

			if (a == 'A' || a == 'E' || a == 'I' || a == 'M' || a == 'Q') {
				cell.rot = 0;
			}
			else if (a == 'B' || a == 'F' || a == 'J' || a == 'N' || a == 'R') {
				cell.rot = 1;
			}
			else if (a == 'C' || a == 'G' || a == 'K' || a == 'O' || a == 'S') {
				cell.rot = 2;
			}
			else if (a == 'D' || a == 'H' || a == 'L' || a == 'P' || a == 'T') {
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

			// routed squares with players in them
			if (a == 'Q' || a == 'R' || a == 'S' || a == 'T') {
				cell.kind = 3;
			}

			cell.row = row;
			cell.col = col;
			grid[row][col] = cell;
		}
	}
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


function clearChecked() {	// phalanxes
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			grid[row][col].checked = false;
		}
	}
}

function setRallyHighlights(pRow, pCol) {
	if (gameMan.tutorialStep < 0 && routedCell(pRow, pCol)) {
		for (var row = 0; row < 15; ++row) {
			for (var col = 0; col < 21; ++col) {
				if (emptyRallyCell(row, col, grid[pRow][pCol].player)) {
					grid[row][col].prompt = 2;
				}
			}
		}
	}
}

function clearRallyHighlights() {
	if (gameMan.tutorialStep < 0) {
		for (var row = 0; row < 15; ++row) {
			for (var col = 0; col < 21; ++col) {
				grid[row][col].prompt = -1;
			}
		}
	}
}


function newGame() {
	generateGrid(newBoard);
	states = [];
	phalanx = [];
	pushState();
	gameMan.winner = -1;
	gameMan.player = 0;
	gameMan.actions = 2;
	gameMan.tutorialStep = -1;
	useAction(0);
}

function useAction(n) {
	if (n === undefined) {
		n = 1;
	}
	gameMan.actions -= n;
	if (gameMan.actions <= 0) {
		gameMan.actions = 2;
		gameMan.player = (gameMan.player + 1) % 4;
		if (gameMan.tutorialStep < 0) {
			drawMan.helmetScale = 1;	// zoom helmets
		}
	}
	else if (gameMan.tutorialStep != 2) {	// hack
		drawMan.helmetFlash = 1;	// flash helmet
	}
	checkWin();
}

function pass() {
	useAction(2);
	pushState();
}


function pushState(ai) {
	var state = {
	  player: gameMan.player,
	  actions: gameMan.actions,
	  ai: ai,
	  pieces: [],
	  prompts: []
	};

	for (var row = 0; row < 15; ++row) {
	  for (var col = 0; col < 21; ++col) {
			var cell = grid[row][col];

			if (cell.player > -1) {
				state.pieces.push([cell.player, row, col, cell.rot]);
			}

			if (cell.prompt > -1) {
				state.prompts.push([row, col, cell.prompt]);
			}
	  }
	}

	states.push(state);
	while (states.length > 1000) {	// number of undos to hold
		states.shift();
	}
	saveGame();
}

function popState() {
	if (states.length > 1) {
		do {
			states.pop();
			resetState();
		} while (gameMan.ais[gameMan.player] && states.length > 1)
	}
	saveGame();
}

function resetState() {
	if (gameMan.scene == "board") {	// reset game actions for zoom
		phalanx.length = 0;
		revertState();
	}
}

function revertState() {
	loadState(states[states.length-1]);
}

function loadState(state) {
	generateGrid(emptyBoard);

	gameMan.player = state.player;
	gameMan.actions = state.actions;

	for (var i = state.pieces.length-1; i >= 0; --i) {
		var piece = state.pieces[i];
		grid[piece[1]][piece[2]].player = piece[0];
		grid[piece[1]][piece[2]].rot = piece[3];
	}

	for (var i = state.prompts.length-1; i >= 0; --i) {
		var prompt = state.prompts[i];
		grid[prompt[0]][prompt[1]].prompt = prompt[2];
	}
}

function saveGame() {
	var gameSave = {
		states: states,
		ais: gameMan.ais
	}
	localStorage.setItem("nikaGameSave", JSON.stringify(gameSave));
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
	return (player + 2) % 4;
}

function getWinnerText(player) {
	return getCity(player) + "and " + getCity(getPartner(player)) + "win!";
}

function checkWin() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].kind == 1 && grid[row][col].player >= 0 && grid[row][col].player != grid[row][col].city
			 && gameMan.tutorialStep < 0) {
				gameMan.winner = grid[row][col].player;
				murals[gameMan.winner].setAnim("victory");
				murals[getPartner(gameMan.winner)].setAnim("victory");
			}
		}
	}
}


function playerAction() {
	for (var player = 0; player < 4; ++player) {
		var priorityEvent = getPriorityEvent(eventMan[player]);
		playSound(priorityEvent);
		playAnimation(player, priorityEvent);
		eventMan[player] = [];
	}
}

function getPriorityEvent(events) {
	var precedence = ["pushed", "routed", "rally", "rotate", "move", "push", "rout"];
	for (var j = precedence.length-1; j >= 0; --j) {
		if (events.indexOf(precedence[j]) > -1) {
			return precedence[j];
		}
	}
	return "";
}

function playSound(event) {
	if (sounds[event]) {
		sounds[event].volume = Math.pow(soundMan.sound, 2);
		sounds[event].play();
	}
}

function playAnimation(player, event) {
	if (["push", "pushed", "rout", "routed", "rally"].indexOf(event) > -1) {
		murals[player].setAnim(event);
	}
}

function resetAnimations() {
	gameMan.receiver = -1;
	initAnimations();
}

function initAnimations() {
	for (var i = 0; i < 4; i++) {
		setIdleAnimation(i);
	}
}

function setIdleAnimation(player) {
	if (gameMan.tutorialStep >= 0 && player == 0) {
		if (tutorialInputs[gameMan.tutorialStep]) {
			murals[player].setAnim("idleActive");
		}
		else {
			murals[player].setAnim("idle");
		}
	}
	else {
		if (player == gameMan.player) {
			murals[player].setAnim("idleActive");
		} else {
			murals[player].setAnim("idle");
		}
	}
}


function menuButton(index) {
	switch(index) {
	case 0:
		menuMan.show = !menuMan.show;
		menus["debug"] = 0;
		break;
	case 1:
		gameMan.debug = !gameMan.debug;
		initAnimations();
		break;
	case 2:
		ai();
		break;
	case 3:
		zoom();
		break;
	case 4:
		pass();
		break;
	case 5:
		popState();
		break;
	case 6:
		if (gameMan.tutorialStep < 0) {
			nextTutorialStep();
		}
		else {
			endTutorial();
		}
		break;
	case 7:
		if (gameMan.scene == "rules") {
				setScene("board");
				hudMan.pageText = "";
			}
		else {
			setScene("rules");
		}
		break;
	case 8:
		setScene("menus");
		break;
	}
}

function menuTitle(index) {
	switch(index) {
	case 0:
		gameMan.menu = "setup";
		break;
	case 1:
		var gameSave;
		try {
			gameSave = JSON.parse(localStorage.getItem("nikaGameSave"));
		} catch (e) {
			console.log("Error: nikaGameSave corrupt");
		}

		if (gameSave) {
			gameMan.tutorialStep = -1;
			states = gameSave.states;
			gameMan.ais = gameSave.ais;
			revertState();
			setScene("board");
		} else {
			gameMan.menu = "setup";
		}
		break;
	case 2:
		setScene("board");
		nextTutorialStep();
		break;
	case 3:
		setScene("rules");
		break;
	case 4:
		gameMan.menu = "option";
		break;
	case 5:
		gameMan.menu = "credit";
		break;
	}
}

function ai() {
	switch (gameMan.ais[gameMan.player]) {
	case 1:
		aiNeil();
		break;
	case 2:
		aiShu();
		break;
	}
}

function replay() {
	gameMan.replaying = !gameMan.replaying;
	if (gameMan.replaying) {
		gameMan.replay = states;
		gameMan.replayTurn = 0;
		loadReplayTurn();
	} else {
		revertState();
	}
}

function replayNext() {
	gameMan.replayTurn = Math.min(gameMan.replayTurn + 1, gameMan.replay.length - 1);
	loadReplayTurn();
}

function replayPrev() {
	gameMan.replayTurn = Math.max(gameMan.replayTurn - 1, 0);
	loadReplayTurn();
}

function loadReplayTurn() {
	loadState(gameMan.replay[gameMan.replayTurn]);
}
