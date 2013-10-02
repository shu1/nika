function tutorial(n) {
	generateGrid(tutBoards[n]);
	pushGameState();
	gameMan.tut = n;
}

function tutAllowed() {
	if (tutCompleted()) {
		return true;
	}

	switch (gameMan.tut) {
		case 0:
			return false;
		case 1:
			return false;
	}
	return true;
}

function tutCompleted () {
	switch (gameMan.tut) {
		case 0:
			if (grid[2][10].player == 0) {
				nextTutorial();
				return true;
			}
			break;
		case 1:
			if (grid[12][10].player == 2) {
				nextTutorial();
				return true;
			}
			break;
	}
	return false;
}

function nextTutorial() {
	gameMan.tut++;

	if (gameMan.tut >= tutBoards.length) {
		alert("Tutorial completed. Time to play.");
		endTutorial();
	}
	else {
		buttons[5] = "  Skip";
		tutorial(gameMan.tut);
		tutMessage();
	}
}

function endTutorial () {
	console.log("Hooray! You win the tutorial!!");
	generateGrid(mainBoard);
	buttons[5] = "Tutorial";
	gameMan.tut = -1;
}

function tutMessage() {
	switch (gameMan.tut) {
		case 0:
			alert("Athens and Messene are near victory! Help Athens win by moving into the win square!");
			break;
		case 1:
			alert("Athens and Messene are near victory again! This time, move Messene's piece to win!");
			break;
	}
}
