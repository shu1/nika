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
	hudMan.tutorialText = "Tutorial " + gameMan.tutorialStep;
	clearTutorialRings();
	setupTutorial(gameMan.tutorialStep);
}

function endTutorial() {
	gameMan.tutorialStep = -1;
	hudMan.tutorialText = "";
	newGame();
	resetAnimations();
}

function nextTutorialPart(part) {
	generateGrid(tutorialBoards[part]);
	resetActions(0);
}

function resetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}

function setupTutorial() {
	switch (gameMan.tutorialStep) {
	case 0:
		generateGrid(mainBoard);
		gameStates = [];
		pushGameState();
		grid[9][9].prompt = 1;
		grid[10][9].prompt = 1;
		grid[11][9].prompt = 1;
		grid[10][10].prompt = 1;
		grid[11][10].prompt = 1;
		grid[11][11].prompt = 1;
		resetActions(0);
		break;
	case 1:
		grid[2][9].prompt = 2;
		grid[2][10].prompt = 2;
		grid[2][11].prompt = 2;
		resetActions(0);
		break;
	case 2:
		nextTutorialPart(0);
		grid[3][10].prompt = 0;
		grid[2][10].prompt = 2;
		pushGameState();
		break;
	case 4:
		nextTutorialPart(1);
		grid[11][10].prompt = 1;
		grid[12][9].prompt = 2;
		grid[12][10].prompt = 2;
		grid[12][11].prompt = 2;
		resetActions(2);
		pushGameState();
		break;
	case 5:
		moveOnePiece(11, 10, 12, 10);
		grid[12][10].prompt = 1;
		pushGameState();
		break;
	case 6:
		nextTutorialPart(2);
		grid[6][18].prompt = 2;
		grid[7][18].prompt = 2;
		grid[8][18].prompt = 2;
		grid[7][17].prompt = 1;
		resetActions(1);
		pushGameState();
		break;
	case 7:
		moveOnePiece(7, 17, 7, 18);
		grid[7][18].prompt = 1;
		break;
	case 8:
		nextTutorialPart(3);
		grid[6][2].prompt = 2;
		grid[7][2].prompt = 2;
		grid[8][2].prompt = 2;
		grid[7][3].prompt = 1;
		resetActions(3);
		pushGameState();
		break;
	case 9:
		moveOnePiece(7, 3, 7, 2);
		grid[7][2].prompt = 1;
		pushGameState();
		break;
	case 10:
		nextTutorialPart(4);
		grid[9][6].prompt = 1;
		pushGameState();
		break;
	case 11:
		grid[9][6].prompt = -1;
		break;
	case 12:
		grid[9][7].prompt = 1;
		pushGameState();
		break;
	case 13:
		grid[10][5].prompt = 0;
		grid[10][6].prompt = 2;
		pushGameState();
		break;
	case 15:
		grid[10][6].prompt = 0;
		grid[9][6].prompt = 2;
		pushGameState();
		break;
	case 16:
		grid[9][6].prompt = 1;
		break;
	case 17:
		nextTutorialPart(5);
		grid[9][11].prompt = 1;
		grid[10][11].prompt = 1;
		pushGameState();
		break;
	case 18:
		grid[10][11].prompt = 0;
		pushGameState();
		break;
	case 19:
		grid[9][11].prompt = 0;
		pushGameState();
		break;
	case 20:
		grid[9][11].prompt = 1;
		grid[10][11].prompt = 1;
		break;
	case 21:
		resetActions(0);
		moveOnePiece(11, 14, 11, 13);
		moveOnePiece(11, 13, 11, 12);
		pushGameState();
		break;
	case 22:
		grid[13][8].prompt = 1;
		grid[13][9].prompt = 2;
		grid[13][10].prompt = 2;
		grid[13][11].prompt = 2;
		grid[14][9].prompt = 2;
		grid[14][10].prompt = 2;
		grid[14][11].prompt = 2;
		pushGameState();
		break;
	case 23:
		grid[13][8].prompt = 0;
		grid[13][11].prompt = 2;
		pushGameState();
		break;
	case 24:
		grid[12][9].prompt = 1;
		grid[12][10].prompt = 1;
		grid[12][11].prompt = 1;
		break;
	case 25:
		grid[13][11].prompt = 0;
		grid[12][11].prompt = 2;
		pushGameState();
		break;
	case 27:
		nextTutorialPart(6);
		grid[9][6].prompt = 1;
		grid[10][6].prompt = 1;
		pushGameState();
		break;
	case 28:
		grid[9][6].prompt = 0;
		grid[10][6].prompt = 0;
		grid[9][5].prompt = 2;
		grid[10][5].prompt = 2;
		pushGameState();
		break;
	case 29:
		grid[9][5].prompt = 0;
		grid[10][5].prompt = 0;
		pushGameState();
		break;
	case 31:
		nextTutorialPart(7);
		pushGameState();
		break;
	case 32:
		grid[10][14].prompt = 0;
		pushGameState();
		break;
	case 33:
		grid[10][14].prompt = 0;
		grid[11][14].prompt = 0;
		grid[11][15].prompt = 0;
		pushGameState();
		break;
	case 34:
		grid[10][14].prompt = 0;
		grid[11][14].prompt = 0;
		grid[11][15].prompt = 0;
		break;
	case 35:
		grid[10][14].prompt = 0;
		grid[11][14].prompt = 0;
		grid[11][15].prompt = 0;
		pushGameState();
		break;
	case 36:
		grid[11][16].prompt = 0;
		grid[10][16].prompt = 2;
		pushGameState();
		break;
	case 38:
		nextTutorialPart(8);
		grid[8][5].prompt = 1;
		break;
	case 39:
		grid[10][5].prompt = 0;
		grid[9][5].prompt = 0;
		grid[8][5].prompt = 2;
		pushGameState();
		break;
	case 41:
		nextTutorialPart(9);
		pushGameState();
		break;
	case 42:
		grid[8][15].prompt = 1;
		grid[9][15].prompt = 1;
		pushGameState();
		break;
	case 43:
		grid[9][16].prompt = 0;
		grid[10][16].prompt = 0;
		grid[8][16].prompt = 2;
		pushGameState();
		break;
	case 44:
		grid[8][16].prompt = 0;
		grid[8][15].prompt = 2;
		pushGameState();
		break;
	case 46:
		nextTutorialPart(10);
		pushGameState();
		break;
	case 47:
		grid[5][5].prompt = 0;
		grid[4][5].prompt = 0;
		grid[3][5].prompt = 2;
		pushGameState();
		break;
	case 49:
		nextTutorialPart(11);
		grid[5][15].prompt = 1;
		pushGameState();
		break;
	case 50:
		grid[5][15].prompt = -1;
		grid[6][15].prompt = 1;
		pushGameState();
		break;
	case 51:
		grid[8][15].prompt = 0;
		grid[7][15].prompt = 0;
		grid[6][15].prompt = 2;
		pushGameState();
		break;
	case 53:
		generateGrid(mainBoard);
		resetActions(0);
		pushGameState();
		break;
	case 54:
		grid[2][9].prompt = 2;
		grid[2][10].prompt = 2;
		grid[2][11].prompt = 2;
		grid[12][9].prompt = 2;
		grid[12][10].prompt = 2;
		grid[12][11].prompt = 2;
		break;
	case 58:
		endTutorial();
		break;
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
