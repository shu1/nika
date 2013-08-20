"use strict";

function useAction(n) {
	n = typeof n !== 'undefined' ? n : 1;
	gameMan.actions -= n;
	if (gameMan.actions == 0) {
		nextPlayer();
		gameMan.actions = 2;
	}
}

function nextPlayer() {
	gameMan.player++;
	if (gameMan.player >= 4) {
		gameMan.player = 0;
	}
}
