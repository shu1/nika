function nextTutorialStep() {
	tutorialMan.step++;
	setupTutorial(tutorialMan.step);
	mediaMan.draw = true;
}

function endTutorial() {
	tutorialMan.step = -1;
	resetActions(0);
	generateGrid(mainBoard);
	mediaMan.draw = true;
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
	switch (tutorialMan.step) {
	case 0:
		generateGrid(mainBoard);
		resetActions(0);
		break;
	case 2:
		nextTutorialPart(0);
		grid[2][10].prompt = 1;
		pushGameState();
		break;
	case 3:
		nextTutorialPart(1);
		resetActions(2);
		pushGameState();
		break;
	case 4:
		moveOnePiece(11, 10, 12, 10);
		pushGameState();
		break;
	case 5:
		nextTutorialPart(2);
		resetActions(1);
		pushGameState();
		break;
	case 6:
		moveOnePiece(7, 17, 7, 18);
		break;
	case 7:
		nextTutorialPart(3);
		resetActions(3);
		pushGameState();
		break;
	case 8:
		moveOnePiece(7, 3, 7, 2);
		pushGameState();
		break;
	case 9:
		nextTutorialPart(4);
		pushGameState();
		break;
	case 11:
		clearTutorialRings();
		grid[9][7].prompt = 0;
		pushGameState();
		break;
	case 12:
		clearTutorialRings();
		grid[10][5].prompt = 0;
		grid[10][6].prompt = 1;
		pushGameState();
		break;
	case 13:
		clearTutorialRings();
		grid[10][6].prompt = 0;
		grid[9][6].prompt = 1;
		pushGameState();
		break;
	case 15:
		nextTutorialPart(5);
		pushGameState();
		break;
	case 16:
		clearTutorialRings();
		grid[10][11].prompt = 0;
		pushGameState();
		break;
	case 17:
		grid[9][11].prompt = 0;
		pushGameState();
		break;
	case 19:
		resetActions(0);
		moveOnePiece(11, 14, 11, 13);
		moveOnePiece(11, 13, 11, 12);
		pushGameState();
		break;
	case 20:
		clearTutorialRings();
		grid[13][9].prompt = 1;
		grid[13][10].prompt = 1;
		grid[13][11].prompt = 1;
		grid[14][9].prompt = 1;
		grid[14][10].prompt = 1;
		grid[14][11].prompt = 1;
		pushGameState();
		break;
	case 21:
		clearTutorialRings();
		grid[13][8].prompt = 0;
		grid[13][11].prompt = 1;
		pushGameState();
		break;
	case 23:
		clearTutorialRings();
		grid[13][11].prompt = 0;
		grid[12][11].prompt = 1;
		pushGameState();
		break;
	case 25:
		nextTutorialPart(6);
		pushGameState();
		break;
	case 26:
		clearTutorialRings();
		grid[9][6].prompt = 0;
		grid[10][6].prompt = 0;
		grid[9][5].prompt = 1;
		grid[10][5].prompt = 1;
		pushGameState();
		break;
	case 27:
		clearTutorialRings();
		grid[9][5].prompt = 0;
		grid[10][5].prompt = 0;
		pushGameState();
		break;
	case 29:
		nextTutorialPart(7);
		pushGameState();
		break;
	case 30:
		clearTutorialRings();
		grid[10][14].prompt = 1;
		pushGameState();
		break;
	case 31:
		clearTutorialRings();
		grid[10][14].prompt = 1;
		grid[11][14].prompt = 1;
		grid[11][15].prompt = 1;
		pushGameState();
		break;
	case 32:
		clearTutorialRings();
		grid[10][14].prompt = 1;
		grid[11][14].prompt = 1;
		grid[11][15].prompt = 1;
		pushGameState();
		break;
	case 34:
		clearTutorialRings();
		grid[11][16].prompt = 0;
		grid[10][16].prompt = 1;
		pushGameState();
		break;
	case 36:
		nextTutorialPart(8);
		break;
	case 37:
		clearTutorialRings();
		grid[10][5].prompt = 0;
		grid[9][5].prompt = 0;
		grid[8][5].prompt = 1;
		pushGameState();
		break;
	case 39:
		nextTutorialPart(9);
		pushGameState();
		break;
	case 40:
		clearTutorialRings();
		grid[9][15].prompt = 0;
		pushGameState();
		break;
	case 41:
		clearTutorialRings();
		grid[9][16].prompt = 0;
		grid[10][16].prompt = 0;
		pushGameState();
		break;
	case 42:
		clearTutorialRings();
		grid[8][16].prompt = 0;
		grid[8][15].prompt = 1;
		pushGameState();
		break;
	case 44:
		nextTutorialPart(10);
		pushGameState();
		break;
	case 45:
		clearTutorialRings();
		grid[5][5].prompt = 0;
		grid[4][5].prompt = 0;
		grid[3][5].prompt = 1;
		pushGameState();
		break;
	case 47:
		nextTutorialPart(11);
		pushGameState();
		break;
	case 48:
		clearTutorialRings();
		grid[6][15].prompt = 1;
		pushGameState();
		break;
	case 49:
		clearTutorialRings();
		grid[8][15].prompt = 0;
		grid[7][15].prompt = 0;
		grid[6][15].prompt = 1;
		pushGameState();
		break;
	case 55:
		endTutorial();
		break;
	}
}

function checkTutorialMove(moved) {
	var correct = false;
	switch (tutorialMan.step) {
	case 2:
		if (grid[2][10].player == 0) {
			correct = true;
		}
		break;
	case 12:
		if (grid[10][6].player == 0) {
			correct = true;
		}
		break;
	case 13:
		if (grid[9][6].player == 0) {
			correct = true;
		}
		break;
	case 16:
		if (grid[10][11].rot == 1) {
			correct = true;
		}
		break;
	case 17:
		if (grid[9][11].rot == 1) {
			correct = true;
		}
		break;
	case 21:
		if (grid[13][11].player == 0) {
			correct = true;
		}
		break;
	case 23:
		if (grid[12][11].player == 0) {
			correct = true;
		}
		break;
	case 26:
		if (grid[9][5].player == 0 && grid[10][5].player == 0) {
			correct = true;
		}
		break;
	case 27:
		if (grid[9][5].rot == 0 && grid[10][5].rot == 0) {
			correct = true;
		}
		break;

	case 33:
		if (grid[10][15].player == 0 && grid[11][15].player == 0 && grid[11][16].player == 0 && grid[9][14].player == 0) {
			correct = true;
		}
		break;
	case 34:
		if (grid[10][16].player == 0) {
			correct = true;
		}
		break;
	case 37:
		if (grid[8][5].player == 0) {
			correct = true;
		}
		break;
	case 41:
		if (grid[8][16].player == 0) {
			correct = true;
		}
		break;
	case 42:
		if (grid[8][15].player == 0) {
			correct = true;
		}
		break;
	case 45:
		if (grid[3][5].player == 0) {
			correct = true;
		}
		break;
	case 49:
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
	switch(tutorialMan.step) {
	case 30:
		if (inPhalanx(10,14) && !inPhalanx(9,14) && !inPhalanx(11,14)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
		}
		break;
	case 31:
		if (inPhalanx(10, 14) && inPhalanx(11,14) && !inPhalanx(9,14) && !inPhalanx(11,15)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
			togglePhalanxPiece(10, 14);
		}
		break;
	case 32:
		if (inPhalanx(10,14) && inPhalanx(11,14) && inPhalanx(11,15) && !inPhalanx(9,14)) {
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
