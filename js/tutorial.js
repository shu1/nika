"use strict";

function clearTutorialRings() {
	for (var row=0; row<15; ++row) {
		for (var col=0; col<21; ++col) {
			grid[row][col].prompt = -1;
		}
	}
}

function nextTutorialStep() {
	gameMan.tutorialStep++;
	hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
	clearTutorialRings();
	setupTutorial(gameMan.tutorialStep);
}

function endTutorial() {
	gameMan.tutorialStep = -1;
	hudMan.pageText = "";
	newGame();
	resetAnimations();
}

function nextTutorialPart() {
	gameMan.tutorialPart++;
	if (tutorialParts[gameMan.tutorialPart] != undefined) {
		gameMan.tutorialStep = tutorialParts[gameMan.tutorialPart];
		hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
		setupTutorial();
	} else {
		endTutorial();
	}
}

function prevTutorialPart() {
	var step = 0;
	for (var i=tutorialParts.length-1; i>=0; --i) {
		step = tutorialParts[i];
		if (step < gameMan.tutorialStep) {
			break;
		}
	}
	gameMan.tutorialStep = step;
	hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
	setupTutorial();
}

function resetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}

function setupTutorial() {
	var board = newTutorialBoards[gameMan.tutorialStep];
	if (board) {
		loadGameState(board);
	} else {
		endTutorial();
	}
}

function checkTutorialMove(moved) {
	var correct = false;
	switch (gameMan.tutorialStep) {
	case 2:
		if (grid[2][10].player == 0) {
			correct = true;
		}
		break;
	case 13:
		if (grid[10][6].player == 0) {
			correct = true;
		}
		break;
	case 15:
		if (grid[9][6].player == 0) {
			correct = true;
		}
		break;
	case 18:
		if (grid[10][11].rot == 1) {
			correct = true;
		}
		break;
	case 19:
		if (grid[9][11].rot == 1) {
			correct = true;
		}
		break;
	case 23:
		if (grid[13][11].player == 0) {
			correct = true;
		}
		break;
	case 25:
		if (grid[12][11].player == 0) {
			correct = true;
		}
		break;
	case 28:
		if (grid[9][5].player == 0
				&& grid[10][5].player == 0) {
			correct = true;
		}
		break;
	case 29:
		if (grid[9][5].rot == 0
		 && grid[10][5].rot == 0) {
			correct = true;
		}
		break;
	case 35:
		if (grid[10][15].player == 0
		 && grid[11][15].player == 0
		 && grid[11][16].player == 0
		 && grid[9][14].player == 0) {
			correct = true;
		}
		break;
	case 36:
		if (grid[10][16].player == 0) {
			correct = true;
		}
		break;
	case 39:
		if (grid[8][5].player == 0) {
			correct = true;
		}
		break;
	case 43:
		if (grid[8][16].player == 0) {
			correct = true;
		}
		break;
	case 44:
		if (grid[8][15].player == 0) {
			correct = true;
		}
		break;
	case 47:
		if (grid[3][5].player == 0) {
			correct = true;
		}
		break;
	case 51:
		if (grid[6][15].player == 0) {
			correct = true;
		}
		break;
	}
	if (correct) {
		nextTutorialStep();
	} else if (moved) {
		undo();
	}
}

function checkTutorialSelection() {
	switch(gameMan.tutorialStep) {
	case 32:
		if (inPhalanx(10,14)
		 && !inPhalanx(9,14)
		 && !inPhalanx(11,14)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
		}
		break;
	case 33:
		if (inPhalanx(10, 14)
		 && inPhalanx(11,14)
		 && !inPhalanx(9,14)
		 && !inPhalanx(11,15)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
			togglePhalanxPiece(10, 14);
		}
		break;
	case 34:
		if (inPhalanx(10,14)
		 && inPhalanx(11,14)
		 && inPhalanx(11,15)
		 && !inPhalanx(9,14)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
			togglePhalanxPiece(10, 14);
			togglePhalanxPiece(11, 14);
		}
		break;
	}
}
