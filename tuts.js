var tutBoards = new Array();
tutBoards.push(
	[
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaAaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
	]
);

tutBoards.push(
	[
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiKiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
	]
);

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
			if (grid[9][5].player != -1 || grid[10][5].player != -1 || grid[11][5].player != -1 ||
				grid[9][15].player != -1 || grid[10][15].player != -1 || grid[11][15].player != -1) {
				return false;
			}
			break;

		case 1:
			if (grid[3][5].player != -1 || grid[4][5].player != -1 || grid[5][5].player != -1 || 
				grid[3][15].player != -1 || grid[4][15].player != -1 || grid[5][15].player != -1) {
				return false;
			}
			break;
	}
	return true;
}

function tutCompleted () {
	switch (gameMan.tut) {
		case 0:
			if (grid[9][10].player == 0) {
				endTutorial();
				return true;
			}
			break;

		case 1:
			if (grid[5][10].player == 2) {
				endTutorial();
				return true;
			}
			break;
	}
	return false;
}

function endTutorial () {
	console.log("Hooray! You win the tutorial!!");
	generateGrid(gameStartAscii);
	gameMan.tut = -1;
}