function nextTutorialStep() {
	tutorialMan.step++;
	setupTutorial(tutorialMan.step);
}

function endTutorial() {
	generateGrid(mainBoard);
	tutorialMan.step = -1;
	mediaMan.draw = true;
}

function nextTutorialPart(part) {
	generateGrid(tutorialBoards[part]);
	resetActions(0);
	pushGameState();
}

function resetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}

function setupTutorial() {
	switch (tutorialMan.step) {
	case 0:
		nextTutorialPart(0);
		break;
	case 3:
		nextTutorialPart(1);
		break;
	case 5:
		nextTutorialPart(2);
		break;
	case 7:
		nextTutorialPart(3);
		break;
	case 9:
		nextTutorialPart(4);
		break;
	case 15:
		nextTutorialPart(5);
		break;
	case 25:
		nextTutorialPart(6);
		break;
	case 29:
		nextTutorialPart(7);
		break;
	case 33:
		nextTutorialPart(8);
		break;
	case 36:
		nextTutorialPart(9);
		break;
	case 40:
		nextTutorialPart(10);
		break;
	case 43:
		nextTutorialPart(11);
		break;
	case 51:
		endTutorial();
		break;
	}
	mediaMan.draw = true;
}

function checkTutorialMove() {
	switch (tutorialMan.step) {
	case 2:
		if (grid[2][10].player == 0) {
			nextTutorialStep();
		}
		break;
	case 12:
		if (grid[10][6].player == 0) {
			nextTutorialStep();
		}
		break;
	case 13:
		if (grid[9][6].player == 0) {
			nextTutorialStep();
		}
		break;
	case 16:
		if (grid[10][11].rot == 1) {
			nextTutorialStep();
		}
		break;
	case 17:
		if (grid[9][11].rot == 1) {
			nextTutorialStep();
		}
		break;
	case 21:
		if (grid[13][9].player == 0 || grid[13][10].player == 0 || grid[13][11].player == 0) {
			nextTutorialStep();
		}
		break;
	case 23:
		if (grid[12][9].player == 0 || grid[12][10].player == 0 || grid[12][11].player == 0) {
			nextTutorialStep();
		}
		break;
	case 26:
		if (grid[9][5].player == 0 && grid[10][5].player == 0) {
			nextTutorialStep();
		}
		break;
	case 27:
		if (grid[9][5].rot == 0 && grid[10][5].rot == 0) {
			nextTutorialStep();
		}
		break;

	// TODO: Add steps for detection of correct phalanx sub-selection

	case 30:
		if (grid[10][15].player == 0 && grid[11][15].player == 0 && grid[11][16].player == 0 && grid[9][14].player == 0) {
			nextTutorialStep();
		}
		break;
	case 31:
		if (grid[10][16].player == 0) {
			nextTutorialStep();
		}
		break;
	case 34:
		if (grid[8][5].player == 0) {
			nextTutorialStep();
		}
		break;
	case 38:
		if (grid[8][16].player == 0) {
			nextTutorialStep();
		}
		break;
	case 39:
		if (grid[8][15].player == 0) {
			nextTutorialStep();
		}
		break;
	case 41:
		if (grid[3][5].player == 0) {
			nextTutorialStep();
		}
		break;
	case 45:
		if (grid[6][15].player == 0) {
			nextTutorialStep();
		}
		break;
	}
}
