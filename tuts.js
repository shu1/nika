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

// var tutBoard = [
// 	".........kkklll......",
// 	".........kkklll......",
// 	".........jjj.........",
// 	"hh.eeeiiiiiiiiimmm...",
// 	"hh.eeeiiiiiiiiimmm...",
// 	"hh.eeeiiiiiiiiimmm...",
// 	"ggfeee.........mmmnoo",
// 	"ggfeee.........mmmnoo",
// 	"ggfeee.........mmmnoo",
// 	"...eeeaaaaaaaaammm.pp",
// 	"...eeeaaaaAaaaammm.pp",
// 	"...eeeaaaaaaaaammm.pp",
// 	".........bbb.........",
// 	"......dddccc.........",
// 	"......dddccc........."
// ]

function tutorial(n) {
	generateGrid(tutBoards[n]);
	pushGameState();
	gameMan.tut = n;
}

function isTutorialSuccess () {
	if (gameMan.tut == 0) {
		if (grid[9][10].player == 0) {
			console.log("Hooray! You win the tutorial!!");
			generateGrid(gameStartAscii);
			gameMan.tut = -1;
			return true;
		}
	}

	if (gameMan.tut == 1) {
		if (grid[5][10].player == 2) {
			console.log("Hooray! You win the tutorial!!");
			generateGrid(gameStartAscii);
			gameMan.tut = -1;
			return true;
		}	
	}
	return false;
}