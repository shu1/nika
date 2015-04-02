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
	setupTutorial(gameMan.tutorialStep);
}

function endTutorial() {
	gameMan.tutorialStep = -1;
	hudMan.pageText = "";
	newGame();
	resetAnimations();
}

function nextTutorialPart() {
	nextTutorialStep();
}

function prevTutorialPart() {
	if (gameMan.tutorialStep > 0) {
		gameMan.tutorialStep--;
		hudMan.pageText = "Tutorial " + gameMan.tutorialStep;
		setupTutorial(gameMan.tutorialStep);
	}
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
	var correct = true;
	var nextStep = gameMan.tutorialStep + 1;
	if (newTutorialBoards[nextStep]) {
		var pieces = newTutorialBoards[nextStep].pieces;
		for (var i = pieces.length - 1; i >= 0; --i) {
			var p = pieces[i];
			if (grid[p.row][p.col].rot != p.rot || grid[p.row][p.col].player != p.player) {
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
