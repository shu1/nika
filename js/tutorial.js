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
	pushGameState();
}

function resetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}

function setupTutorial() {
	switch (tutorialMan.step) {
	case 0:
		generateGrid(mainBoard);
		break;
	case 2:
		nextTutorialPart(0);
		grid[2][10].ring = 3;
		break;
	case 3:
		nextTutorialPart(1);
		resetActions(2);
		break;
	case 4:
		moveOnePiece(11, 10, 12, 10);
		break;
	case 5:
		nextTutorialPart(2);
		resetActions(1);
		break;
	case 6:
		moveOnePiece(7, 17, 7, 18);
		break;
	case 7:
		nextTutorialPart(3);
		resetActions(3);
		break;
	case 8:
		moveOnePiece(7, 3, 7, 2);
		break;
	case 9:
		nextTutorialPart(4);
		break;
	case 11:
		grid[9][7].ring = 2;
		break;
	case 12:
		grid[10][5].ring = 2;
		grid[10][6].ring = 3;
		break;
	case 13:
		grid[10][6].ring = 2;
		grid[9][6].ring = 3;
		break;
	case 15:
		nextTutorialPart(5);
		break;
	case 16:
		grid[10][11].ring = 2;
		break;
	case 17:
		grid[9][11].ring = 2;
		break;
	case 19:
		resetActions(0);
		moveOnePiece(11, 14, 11, 13);
		moveOnePiece(11, 13, 11, 12);
		break;
	case 20:
		grid[13][9].ring = 3;
		grid[13][10].ring = 3;
		grid[13][11].ring = 3;
		grid[14][9].ring = 3;
		grid[14][10].ring = 3;
		grid[14][11].ring = 3;
		break;
	case 21:
		grid[13][8].ring = 2;
		grid[13][11].ring = 3;
		break;
	case 23:
		grid[13][11].ring = 2;
		grid[12][11].ring = 3;
		break;
	case 25:
		nextTutorialPart(6);
		break;
	case 26:
		grid[9][6].ring = 2;
		grid[10][6].ring = 2;
		grid[9][5].ring = 3;
		grid[10][5].ring = 3;
		break;
	case 27:
		grid[9][5].ring = 2;
		grid[10][5].ring = 2;
		break;
	case 29:
		nextTutorialPart(7);
		break;
	case 31:
		grid[11][16].ring = 2;
		grid[10][16].ring = 3;
		break;
	case 33:
		nextTutorialPart(8);
		break;
	case 34:
		grid[10][5].ring = 2;
		grid[9][5].ring = 2;
		grid[8][5].ring = 3;
		break;
	case 36:
		nextTutorialPart(9);
		break;
	case 37:
		grid[9][15].ring = 2;
		break;
	case 38:
		grid[9][16].ring = 2;
		grid[10][16].ring = 2;
		break;
	case 39:
		grid[8][16].ring = 2;
		grid[8][15].ring = 3;
		break;
	case 41:
		nextTutorialPart(10);
		break;
	case 42:
		grid[5][5].ring = 2;
		grid[4][5].ring = 2;
		grid[3][5].ring = 3;
		break;
	case 44:
		nextTutorialPart(11);
		break;
	case 45:
		grid[6][15].ring = 3;
		break;
	case 46:
		grid[8][15].ring = 2;
		grid[7][15].ring = 2;
		grid[6][15].ring = 3;
		break;
	case 52:
		endTutorial();
		break;
	}
}

function checkTutorialMove() {
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

	// TODO: Add steps for detection of correct phalanx sub-selection

	case 30:
		if (grid[10][15].player == 0 && grid[11][15].player == 0 && grid[11][16].player == 0 && grid[9][14].player == 0) {
			correct = true;
		}
		break;
	case 31:
		if (grid[10][16].player == 0) {
			correct = true;
		}
		break;
	case 34:
		if (grid[8][5].player == 0) {
			correct = true;
		}
		break;
	case 38:
		if (grid[8][16].player == 0) {
			correct = true;
		}
		break;
	case 39:
		if (grid[8][15].player == 0) {
			correct = true;
		}
		break;
	case 42:
		if (grid[3][5].player == 0) {
			correct = true;
		}
		break;
	case 46:
		if (grid[6][15].player == 0) {
			correct = true;
		}
		break;
	}
	if (correct) {
		nextTutorialStep();
	} else {
		undo();
	}
}
