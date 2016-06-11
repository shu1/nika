"use strict";

// TODO should refactor so this isn't necessary in AI code
function resetPieces(row, col) {
		phalanx.length = 0;
		phalanx.push({row:row, col:col});
		gameMan.pRot = grid[row][col].rot;	// Only single pieces
//		getPiece(row, col);					// Only phalanxes
}

function aiShu() {
	// find all pieces of current player
	var pieces = [];
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player == gameMan.player) {
				pieces.push({row:row, col:col});
			}
		}
	}

	// try AI methods in order
	var success = false;
	if (!success) {
		success = moveTowardsGoal(pieces);
	}
	if (!success) {
		success = randomMove(pieces);
	}
}

// move a random piece around the board towards the goal (like an ocean current), regardless of other pieces
function moveTowardsGoal(pieces) {
	var tries = 12;
	while (tries > 0) {
		var i = Math.floor(Math.random()*6);
		var row = pieces[i].row;
		var col = pieces[i].col;
		var rots;

		resetPieces(row, col);

		// put the possible movement directions into a list
		switch (gameMan.player) {
		case 0:
			if (row < 7 && col > 8 && col < 12 || row > 5 && (col < 6 || col > 14)) {
				rots = [0];
			}
			else if (row < 7 && col < 10 || row > 7 && col > 10) {
				rots = [0, 1];
			}
			else if (row < 7 && col > 10 || row > 7 && col < 10) {
				rots = [0, 3];
			}
			else {
				rots = [0, 1, 3];
			}
			break;
		case 1:
			if (col > 10 && row > 5 && row < 9 || col < 15 && (row < 6 || row > 8)) {
				rots = [1];
			}
			else if (col > 10 && row > 7 || col < 10 && row < 7) {
				rots = [1, 0];
			}
			else if (col > 10 && row < 7 || col < 10 && row > 7) {
				rots = [1, 2];
			}
			else {
				rots = [1, 0, 2];
			}
			break;
		case 2:
			if (row > 7 && col > 8 && col < 12 || row < 9 && (col < 6 || col > 14)) {
				rots = [2];
			}
			else if (row > 7 && col < 10 || row < 7 && col > 10) {
				rots = [2, 1];
			}
			else if (row > 7 && col > 10 || row < 7 && col < 10) {
				rots = [2, 3];
			}
			else {
				rots = [2, 1, 3];
			}
			break;
		case 3:
			if (col < 10 && row > 5 && row < 9 || col > 6 && (row < 6 || row > 8)) {
				rots = [3];
			}
			else if (col < 10 && row > 7 || col > 10 && row < 7) {
				rots = [3, 0];
			}
			else if (col < 10 && row < 7 || col > 10 && row > 7) {
				rots = [3, 2];
			}
			else {
				rots = [3, 0, 2];
			}
			break;
		}

		// choose a random direction from the previously made list
		var rot = rots[Math.floor(Math.random()*rots.length)];
		if (rot == 0) {
			--row;
		}
		else if (rot == 1) {
			++col;
		}
		else if (rot == 2) {
			++row;
		}
		else {
			--col;
		}

		if (movePiece(pieces[i].row, pieces[i].col, row, col)) {
			return true;	// success!
		}
		--tries;	// use up a try
	}

	useAction(2);
	return false;	// failed to find a valid move within n tries
}

// when all else fails, totally random move or rotation
function randomMove(pieces) {
	var tries = 12;
	while (tries > 0) {
		var i = Math.floor(Math.random()*6);
		var row = pieces[i].row;
		var col = pieces[i].col;

		resetPieces(row, col);

		var rot = Math.floor(Math.random()*4);
		if (rot == 0) {
			--row;
		}
		else if (rot == 1) {
			++col;
		}
		else if (rot == 2) {
			++row;
		}
		else {
			--col;
		}

		var success = false;
		var action = Math.floor(Math.random()*1.5);
		if (action == 0) {
			success = movePiece(pieces[i].row, pieces[i].col, row, col);
		}
		else if (action == 1) {
			rotatePiece(pieces[i].row, pieces[i].col, rot);
			success = movePiece(pieces[i].row, pieces[i].col, pieces[i].row, pieces[i].col);
		}

		if (success) {
			return true;	// success!
		}
		--tries;	// use up a try
	}

	useAction(2);
	return false;	// failed to find a valid move within n tries
}
