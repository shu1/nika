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
	phalanx = [];
	gameMan.winner = -1;
	gameMan.tutorialStep = step - 1;
	nextTutorialStep();
}

function nextTutorialStep() {
	gameMan.tutorialStep++;
	hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
	setupTutorial(gameMan.tutorialStep);
	playSound("ui");
}

function endTutorial() {
	gameMan.tutorialStep = -1;
	hudMan.pageText = "";
	fadeScreen("title");
	fadeMusic("menu");
}

function nextTutorialPart() {
	do {
		nextTutorialStep();
	} while (tutorials[gameMan.tutorialStep].skip)
}

function prevTutorialPart() {
	var handled = false;
	do {
		if (gameMan.tutorialStep > 0) {
			handled = true;
			gameMan.tutorialStep--;
			hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
			setupTutorial(gameMan.tutorialStep);
		}
	} while (tutorials[gameMan.tutorialStep].skip)

	if (handled) {
		playSound("ui");
	}
}

function resetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}

function setupTutorial() {
	var board = tutorials[gameMan.tutorialStep];
	if (board) {
		loadState(board);
		states = [];
		pushState(null, true); // second argument is 'dontSave' flag
	} else {
		endTutorial();
	}
}

function checkTutorialMove() {
	if (tutorials[gameMan.tutorialStep].input) {
		return false;
	}

	var correct = true;
	var selection = tutorials[gameMan.tutorialStep].selection;

	if (selection) { // if correctness depends on phalanx after selection
		for (var i = selection.length - 1; i >= 0; --i) {
			if (!inPhalanx(selection[i][0], selection[i][1])) {
				correct = false;
			}
		}
		if (selection.length != phalanx.length) { // make sure there are no extras
			correct = false;
		}
	}
	else { // if correctness depends on position of pieces after a move
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
	}

	if (correct) {
		nextTutorialStep();
	} else {
		resetEvents();
		setupTutorial();
	}
}

function checkTutorialSelection() {
	switch(gameMan.tutorialStep) {
	case 29:
		if (inPhalanx(10,14)
		 && !inPhalanx(9,14)
		 && !inPhalanx(11,14)) {
			nextTutorialStep();
		}
		else {
			phalanx.length = 0;
		}
		break;
	case 30:
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
	case 31:
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
