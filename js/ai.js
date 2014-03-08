"use strict";

// TODO: should refactor so this isn't necessary in AI code
function resetPieces(row, col) {
		phalanx.length = 0;
		phalanx.push({row:row, col:col});
		gameMan.pRot = grid[row][col].rot;	// Only single pieces
//		getPiece(row, col);					// Only phalanxes
}

function ai() {
	// find all pieces of current player
	var pieces = [];
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player == gameMan.player) {
				pieces.push({row:row, col:col});
			}
		}
	}


	for (var i = 0; i < 6; ++i) {
		var row = pieces[i].row;
		var col = pieces[i].col;
	}

	// try AI methods in order
	var success = false;
	if (!success) {
		success = checkWinNextAction(pieces);
	}
	if (!success && gameMan.actions == 2) {
		success = checkWinTwoActions(pieces);
	}
	if (!success) {
		success = moveTowardsGoal(pieces);
	}
	if (!success) {
		success = randomMove(pieces);
	}
}

// check if this piece can be pushed in 1 action
// TODO - include "back" pieces (i.e. check friends in front of and behind you)
function canBePushed(row, col) {

	resetPieces(row, col);

	var enemies = 0;
	var foundAllEnemies = false;
	var friends = 0;
	var foundAllFriends = false;

	switch(grid[row][col].rot) {
	case 0:
		if(isEnemy(row-1, col) && grid[row-1][col].rot == 2) {

			enemies = 1;			//figure out how many enemies on the same team in a row are in front of this piece and facing it
			for (var i = 2; !foundAllEnemies; i++) {
				if (grid[row-i][col].player >= 0 && grid[row-i][col].player == grid[row-1][col].player && grid[row-i][col].rot == 2) {
					enemies++;
				}
				else {
					foundAllEnemies = true;
				}
			}

			friends = 1;			//figure out how many friends (i.e. own and allied pieces) are behind this piece
			for (var i = 1; !foundAllFriends; i++) {
				if(grid[row+i][col].player >= 0 && Math.abs(grid[row+i][col].player - gameMan.player)%2 == 0) {
					friends++;
				}
				else {
					foundAllFriends = true;
				}
			}

			return enemies > friends;
			break;
		}

		else {
			return false;
			break;
		}

	case 1:
		if(isEnemy(row, col+1) && grid[row][col+1].rot == 3) {

			enemies = 1;			//figure out how many enemies on the same team in a row are in front of this piece and facing it
			for (var i = 2; !foundAllEnemies; i++) {
				if (grid[row][col+i].player >= 0 && grid[row][col+i].player == grid[row][col+i].player && grid[row][col+i].rot == 3) {
					enemies++;
				}
				else {
					foundAllEnemies = true;
				}
			}

			friends = 1;			//figure out how many friends (i.e. own and allied pieces) are behind this piece
			for (var i = 1; !foundAllFriends; i++) {
				if(grid[row][col-i].player >= 0 && Math.abs(grid[row][col-i].player - gameMan.player)%2 == 0) {
					friends++;
				}
				else {
					foundAllFriends = true;
				}
			}

			return enemies > friends;
			break;
		}

		else {
			return false;
			break;
		}		

	case 2:
		if(isEnemy(row+1, col) && grid[row+1][col].rot == 0) {

			enemies = 1;			//figure out how many enemies on the same team in a row are in front of this piece and facing it
			for (var i = 2; !foundAllEnemies; i++) {
				if (grid[row+i][col].player >= 0 && grid[row+i][col].player == grid[row+1][col].player && grid[row+i][col].rot == 0) {
					enemies++;
				}
				else {
					foundAllEnemies = true;
				}
			}

			friends = 1;			//figure out how many friends (i.e. own and allied pieces) are behind this piece
			for (var i = 1; !foundAllFriends; i++) {
				if(grid[row-i][col].player >= 0 && Math.abs(grid[row-i][col].player - gameMan.player)%2 == 0) {
					friends++;
				}
				else {
					foundAllFriends = true;
				}
			}

			return enemies > friends;
			break;
		}

		else {
			return false;
			break;
		}

	case 3:
		if(isEnemy(row, col-1) && grid[row][col-1].rot == 1) {

			enemies = 1;			//figure out how many enemies on the same team in a row are in front of this piece and facing it
			for (var i = 2; !foundAllEnemies; i++) {
				if (grid[row][col-i].player >= 0 && grid[row][col-i].player == grid[row][col-i].player && grid[row][col-i].rot == 1) {
					enemies++;
				}
				else {
					foundAllEnemies = true;
				}
			}

			friends = 1;			//figure out how many friends (i.e. own and allied pieces) are behind this piece
			for (var i = 1; !foundAllFriends; i++) {
				if(grid[row][col+i].player >= 0 && Math.abs(grid[row][col+i].player - gameMan.player)%2 == 0) {
					friends++;
				}
				else {
					foundAllFriends = true;
				}
			}

			return enemies > friends;
			break;
		}

		else {
			return false;
			break;
		}		
	}

}


// check if this piece can be routed in 1 action
// TODO (maybe?) - check if you can be routed via pushing
// will probably also want something to check if you can be routed in 2 actions (and maybe take into account player turn order too)
function canBeRouted(row, col) {

	resetPieces(row, col); //?

	switch (grid[row][col].rot) {
	case 0:
		return (isEnemy(row+1, col) || isEnemy(row, col-1) || isEnemy(row, col+1));
		break;
	case 1:
		return (isEnemy(row-1, col) || isEnemy(row+1, col) || isEnemy(row, col-1));
		break;
	case 2:
		return (isEnemy(row-1, col) || isEnemy(row, col-1) || isEnemy(row, col+1));
		break;
	case 3:
		return (isEnemy(row+1, col) || isEnemy(row-1, col) || isEnemy(row, col+1));
		break;

	}

}

// check if the given cell contains an enemy piece
// this seems like it should already exist and would be useful elsewhere, but I didn't see anything so I made one
function isEnemy(row, col) {
	return (grid[row][col].player >= 0 && Math.abs(grid[row][col].player - gameMan.player)%2 == 1);
}

// see if you can win in 2 actions
function checkWinTwoActions(pieces) {

	for (var i = 0; i < 6; i++) {
		var row = pieces[i].row;
		var col = pieces[i].col;
		resetPieces(row, col);

		if (checkMove(row, col, row-1, col) && isAdjacentToGoal(row-1, col)) {
			return movePiece(row, col, row-1, col);
		}
		else if (checkMove(row, col, row, col+1) && isAdjacentToGoal(row, col+1)) {
			return movePiece(row, col, row, col+1);
		}
		else if (checkMove(row, col, row+1, col) && isAdjacentToGoal(row+1, col)) {
			return movePiece(row, col, row+1, col);
		}
		else if (checkMove(row, col, row, col-1) && isAdjacentToGoal(row, col-1)) {
			return movePiece(row, col, row, col-1);
		}

	}

}

// moves a piece into the goal. ONLY CALL after isAdjacentToGoal
function moveIntoGoal(row, col) {
	switch (gameMan.player) {
	case 0:
		return (movePiece(row, col, row-1, col));
		break;
	case 1:
		return (movePiece(row, col, row, col+1));
		break;
	case 2:
		return (movePiece(row, col, row+1, col));
		break;
	case 3:
		return (movePiece(row, col, row, col-1));
		break;
	}	

	return false;
}

// check if given square is adjacent to current player's goal
function isAdjacentToGoal(row, col) {
	switch (gameMan.player) {
	case 0:
		row--;
		break;
	case 1:
		col++;
		break;
	case 2:
		row--;
		break;
	case 3:
		col--;
		break;
	}	

	return (grid[row][col].kind == 1 && grid[row][col].city == getPartner(gameMan.player));

}



// check if you can win in 1 action
function checkWinNextAction(pieces) {
	for (var i = 0; i < 6; i++) {
		var row = pieces[i].row;
		var col = pieces[i].col;
		resetPieces(row, col);

		if (isAdjacentToGoal(row, col)) {
			if (moveIntoGoal(pieces[i].row, pieces[i].col)) {
				return true;	// success!
			}
		}
	}

	return false;
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
