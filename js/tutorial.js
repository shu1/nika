"use strict";

function clearTutorialRings() {
	for (var row=0; row<15; ++row) {
		for (var col=0; col<21; ++col) {
			grid[row][col].prompt = -1;
		}
	}
}

function initTutorial(step) {
	if (step == undefined) { step = 0; }
	gameMan.winner = -1;
	gameMan.tutorialStep = step - 1;
	nextTutorialStep();
}

function nextTutorialStep() {
	gameMan.tutorialStep++;
	hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
	setupTutorial(gameMan.tutorialStep);
}

function endTutorial() {
	hudMan.pageText = "";
	setScene("menus");
}

function nextTutorialPart() {
	do {
		nextTutorialStep();
	} while (tutorials[gameMan.tutorialStep].skip)
}

function prevTutorialPart() {
	do {
		if (gameMan.tutorialStep > 0) {
			gameMan.tutorialStep--;
			hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
			setupTutorial(gameMan.tutorialStep);
		}
	} while (tutorials[gameMan.tutorialStep].skip)
}

function resetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}

function setupTutorial() {
	var board = tutorials[gameMan.tutorialStep];
	if (board) {
		loadState(board);

		// Create phalanxes for some tutorial steps
		if (board.phalanx) {
			// Deep copy so changes to phalanx don't affect tutorial states
			phalanx = [];
			for(var i = board.phalanx.length - 1; i >= 0; --i) {
				phalanx.push({
					row: board.phalanx[i].row,
					col: board.phalanx[i].col
				});
			}
		}
		states = [];
		pushState(null, true); // second argument is 'dontSave' flag
	} else {
		endTutorial();
	}
}

function checkTutorialMove(moved) {
	var correct = true;
	var nextStep = gameMan.tutorialStep + 1;
	if (tutorials[nextStep]) {
		var pieces = tutorials[nextStep].pieces;
		for (var i = pieces.length - 1; i >= 0; --i) {
			var p = pieces[i];
			if (grid[p[1]][p[2]].rot != p[3] || grid[p[1]][p[2]].player != p[0]) {
				correct = false;
			}
		}
	}

	if (correct) {
		nextTutorialStep();
	} else {
		setupTutorial();
	}
}

function checkTutorialSelection() {
	switch(gameMan.tutorialStep) {
	case 28:
		if (inPhalanx(10,14)
		 && !inPhalanx(9,14)
		 && !inPhalanx(11,14)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
		}
		break;
	case 29:
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
	case 30:
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
