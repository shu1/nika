var tutBoard = [
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

function tutorial() {
	generateGrid(tutBoard);
	pushGameState();
	gameMan.tut = 1;
}

function isTutorialSuccess () {
	if (grid[9][10].player == 0) {
		console.log("Hooray! You win the tutorial!!");
		generateGrid(gameStartAscii);
		gameMan.tut = 0;
		return true;
	}
	return false;
}