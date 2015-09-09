"use strict";

var defGrid = null;

var aiWeights = [
	// used by the game
	{
		values : {
			ownPiecesOnBoard 					: 20,
			ownAdjInPhalanx 					: 2,
			ownAdjNotInPhalanx 				: 1,
			allyAdjSameDir 						: 2,
			allyAdjDiffDir 						: 1,
			enemyAdjBlocked 					: -1,
			enemyAdjRoutable 					: [5,2],
			enemyAdjCanRoutMe 				: [-5,-12],
			enemyAdjBothNotFacing			: [2,-8],
			perSquareDistanceFromGoal : -8,
			perRoutedEnemyPiece				: 25
		}
	},

	// Test AI A
	// used by AI3 in aiBattle()
	{
		values : {
			ownPiecesOnBoard 					: 50,
			ownAdjInPhalanx 					: 2,
			ownAdjNotInPhalanx 				: 1,
			allyAdjSameDir 						: 2,
			allyAdjDiffDir 						: 1,
			enemyAdjBlocked 					: -1,
			enemyAdjRoutable 					: [5,2],
			enemyAdjCanRoutMe 				: [-5,-12],
			enemyAdjBothNotFacing			: [2,-8],
			perSquareDistanceFromGoal : -8,
			perRoutedEnemyPiece				: 20
		}
	},

	// Test AI B
	// used by AI4 in aiBattle()
	{
		values : {
			ownPiecesOnBoard 					: 50,
			ownAdjInPhalanx 					: 2,
			ownAdjNotInPhalanx 				: 1,
			allyAdjSameDir 						: 2,
			allyAdjDiffDir 						: 1,
			enemyAdjBlocked 					: -1,
			enemyAdjRoutable 					: [5,2],
			enemyAdjCanRoutMe 				: [-5,-12],
			enemyAdjBothNotFacing			: [2,-8],
			perSquareDistanceFromGoal : -8,
			perRoutedEnemyPiece				: 20
		}
	}
];

var aiP = aiWeights[0]; // Alias?

function newState (){
	return {
		value : 0,   // value of state after board state adjustments
		board : grid // grid object, state of board after this move, will be applied to board upon ai exit.
	};
}

function aiNeil(aiNum){
	aiP = aiWeights[aiNum || 0];
	storeGrid();
	var pieces = [];
	pieces = getAIPieces();

	// Checks if any pieces are close enough to win.
	checkIfPiecesCanWin(pieces);

	// Creates the default state in which all other states are compared to.
	var defaultState = newState();
	getValue(defaultState, pieces);
	var bestState = defaultState; // Stores best state, which is default at this point. Altough we might be better off just setting best state.

	var rallySpots = [];
	for (var row = 0 ; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if(grid[row][col].kind == 2 && grid[row][col].city == pieces[0].player){
				rallySpots.push(grid[row][col]);
			}
		}
	}

	// EACH PIECE CHECKING =============
	for(var i = 0; i < 6; ++i) {
		if(pieces[i].kind == 3) {
			for(var j = 0; j < rallySpots.length; ++j) {
				// Get rally spots
				phalanx = [pieces[i]];
				var rally = getPieceArguments(pieces[i],rallySpots[j]);
				movePiece(rally.pRow, rally.pCol, rally.tRow, rally.tCol, true);
				pieces = getAIPieces();

				var temp = copyState(defaultState);
				getValue(temp, pieces);

				if(temp.value > bestState.value) {
					bestState = temp;
				}

				setGrid(defGrid, grid);
				pieces = getAIPieces();
			}
		}
		else {
			// Do normal move check, which means rotation, then movement.
			origRot = pieces[i].rot;
			for (var rot = 0; rot < 4; ++rot){
				if(rot != origRot){
					pieces[i].rot = rot;
					var temp = copyState(defaultState);
					getValue(temp, pieces);
					if(temp.value > bestState.value){
						bestState = temp;
					}
				}
			}

			setGrid(defGrid,grid);
			pieces = getAIPieces();

			for (var dir = 0; dir<4; ++dir){
				// Check moves in each direction
				phalanx = [pieces[i]];

				var move = getMoveArguments(phalanx[0],dir);
				var origRot = phalanx[0].rot;

				movePiece(move.pRow,move.pCol,move.tRow,move.tCol,true);
				pieces = getAIPieces();

				var temp = copyState(defaultState);
				getValue(temp, pieces);

				if(temp.value>bestState.value){
					bestState = temp;
				}

				setGrid(defGrid, grid);
				pieces = getAIPieces();
				phalanx = [];
			}
		}
	}

	setGrid(defGrid,grid);

	// PHALANX CHECKING =====================
	for(var i = 0; i < 4; ++i) {
		var sameDir = [];
		for (var p = 0; p < 6; ++p) {
			if(pieces[p].rot == i) {
				sameDir.push(pieces[p]);
			}
		}
		if(sameDir.length > 1) {
			var combinations = getCombinations(sameDir);
			combinations.forEach(function(e) {
				phalanx = [];
				phalanx = e.slice(0);
				if(phalanx.length > 1 && isPhalanx()) {
					for(var rot = 0; rot < 4; ++rot) {
						if(rot != i){
							rotatePiece(phalanx[0].row, phalanx[0].col, rot);
							pieces = getAIPieces();
							var temp = copyState(defaultState);
							getValue(temp, pieces);
							if(temp.value > bestState.value) {
								bestState = temp;
							}
							setGrid(defGrid, grid);
							pieces = getAIPieces();
						}
					}
					setGrid(defGrid, grid);
					pieces = getAIPieces();

					var rot = phalanx[0].rot;
					var move = getMoveArguments(phalanx[0], rot);
					movePiece(move.pRow, move.pCol, move.tRow, move.tCol, true);

					phalanx = e.slice(0);
					pieces = getAIPieces();

					var temp = copyState(defaultState);
					getValue(temp, pieces);
					if(temp.value > bestState.value){
						bestState = temp;
					}
					setGrid(defGrid, grid);
					pieces = getAIPieces();
				}
			});
		}
	}

	// AFTER ALL CHECKING IS DONE ===========
	setGrid(bestState.board, grid);
	phalanx = [];
	useAction();
	pushState();
}

function getValue(state, pieces){
	var val;
	for (var i = 0; i < pieces.length; ++i) {
		var piece = pieces[i];
		val = 0;

		// Piece on Board
		if(piece.kind != 3) {
			val += aiP.values.ownPiecesOnBoard;
		}

		// Adjacent Check
		var adj = [];
		if(piece.row - 1 > -1)                     { adj[0] = grid[piece.row-1][piece.col]; } // Up
		if(piece.col + 1 < grid[piece.row].length) { adj[1] = grid[piece.row][piece.col+1]; } // Right
		if(piece.row + 1 < grid.length)            { adj[2] = grid[piece.row+1][piece.col]; } // Down
		if(piece.col - 1 > 0)                      { adj[3] = grid[piece.row][piece.col-1]; } // Left

		for(var j = 0; j < 4; ++j) {

			if(adj[j] != undefined && adj[j].kind != -1 && adj[j].player >- 1) {
				// Own
				if(adj[j].player == piece.player){
					if(adj[j].rot == piece.rot) {
						// In Phalanx
						val += aiP.values.ownAdjInPhalanx;
					} else {
						// Not in Phalanx
						val += aiP.values.ownAdjNotInPhalanx;
					}
				}

				// Ally
				else if(Math.abs( (adj[j].player - piece.player) % 2 ) == 0) {
					if(adj[j].rot == piece.rot) { val += aiP.values.allyAdjSameDir; } // Same Dir
					else{ val += aiP.values.allyAdjDiffDir; } // Diff Dir
				}

				// Enemy
				else {
					if(piece.rot == j && Math.abs((adj[j].rot-j) % 2) == 0) {
						val += aiP.values.enemyAdjBlocked; // Facing eachother.
					}
					else if(piece.rot == j) {
						// If piece is facing adj, but they aren't facing eachother, then adj is routable
						if(gameMan.actions > 1) {
							val+= aiP.values.enemyAdjRoutable[0];
						} else {
							val+= aiP.values.enemyAdjRoutable[1];
						}
					}
					else if(Math.abs( (adj[j].rot - j) % 2 ) == 0) {
						// Else if we're not facing adjacent, check if he's facing us.
						if(gameMan.actions > 1) {
							val+=aiP.values.enemyAdjCanRoutMe[0];
						} else {
							val+=aiP.values.enemyAdjCanRoutMe[1];
						}
					}
					else {
						// Adjacent but not facing each other.
						if(gameMan.actions > 1) {
							val+=aiP.values.enemyAdjBothNotFacing[0];
						} else {
							val+=aiP.values.enemyAdjBothNotFacing[1];
						}
					}
				}
			}
		}

		val += aiP.values.perSquareDistanceFromGoal * getDistanceFromGoal(piece.row, piece.col, gameMan.player);
		state.value += val; // Adds piece value to total value
	}

	// Add points for every routed enemy piece
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			var cell = grid[row][col];
			if (cell.player >- 1 && Math.abs(gameMan.player - cell.player) % 2 != 0 && cell.kind == 3) {
				state.value += aiP.values.perRoutedEnemyPiece;
			}
		}
	}
}

function getDistanceFromGoal(row, col, player) {

	if (grid[row][col].kind == 3) {
		return 23;
	}

	if (player == 0) {
		if (row <= 5 && col >= 9 && col <= 11) { // in 3x3 square in front of goal
			return (row-2);
		}
		if (row <= 5 && col >= 6 && col <= 8) { // in Messenian territory "west" of 3x3 square
			return (row-3) + (8-col) + 2;
		}
		if (row <= 5 && col >= 12 && col <= 14) { // in Messenian territory "east" of 3x3 square
			return (row-3) + (col-12) + 2;
		}
		if (row >= 3 && row <= 11 && col >= 3 && col <= 5) { // in Spartan territory
			return (row-3) + (5-col) + 5;
		}
		if (row >= 3 && row <= 11 && col >= 15 && col <= 17) { // in Theban territory
			return (row-3) + (col-15) + 5;
		}
		if (row >= 9 && col >= 6 && col <= 10) { // in "west" half of Athenian territory (including rally areas)
			return (row-9) + (col-5) + 11;
		}
		if (row >= 9 && col >= 11 && col <= 14) { // in "east" half of Athenian territory (including rally areas)
			return (row-9) + (15-col) + 11;
		}
	}

	if (player == 1) {
		if (row >= 6 && row <= 8 && col >= 15) { // in 3x3 square in front of goal
			return (18-col);
		}
		if (row >= 3 && row <= 5 && col >= 3) { // in long rectangle "north" of goal
			return (5-row) + (17-col) + 2;
		}
		if (row >= 9 && row <= 11 && col >= 3) { // in long rectangle "south" of goal
			return (row-9) + (17-col) + 2;
		}
		if (row >= 6 && row <= 7 && col <= 5) { // in "north" 2x6 rectangle between center and back of rally area
			return (row-5) + (5-col) + 14;
		}
		if (row == 8 && col <= 5) { // in "south" 1x6 rectangle between center and back of rally area
			return (9-row) + (5-col) + 14;
		}
	}

	if (player == 2) {
		if (row >= 9 && col >= 9 && col <= 11) { // in 3x3 square in front of goal
			return (12-row);
		}
		if (row >= 9 && col >= 6 && col <= 8) { // in Athenian territory "west" of 3x3 square
			return (11-row) + (8-col) + 2;
		}
		if (row >= 9 && col >= 12 && col <= 14) { // in Athenian territory "east" of 3x3 square
			return (11-row) + (col-12) + 2;
		}
		if (row >= 3 && row <= 11 && col >= 3 && col <= 5) { // in Spartan territory
			return (11-row) + (5-col) + 5;
		}
		if (row >= 3 && row <= 11 && col >= 15 && col <= 17) { // in Theban territory
			return (11-row) + (col-15) + 5;
		}
		if (row <= 5 && col >= 6 && col <= 10) { // in "west" half of Messenian territory (including rally areas)
			return (5-row) + (col-5) + 11;
		}
		if (row <= 5 && col >= 11 && col <= 14) { // in "east" half of Messenian territory (including rally areas)
			return (5-row) + (15-col) + 11;
		}
	}

	if (player == 3) {
		if (row >= 6 && row <= 8 && col <= 5) { // in 3x3 square in front of goal
			return (col-2);
		}
		if (row >= 3 && row <= 5 && col <= 17) { // in long rectangle "north" of goal
			return (5-row) + (col-3) + 2;
		}
		if (row >= 9 && row <= 11 && col <= 17) { // in long rectangle "south" of goal
			return (row-9) + (col-3) + 2;
		}
		if (row >= 6 && row <= 7 && col >= 15) { // in "north" 2x6 rectangle between center and back of rally area
			return (row-5) + (col-15) + 14;
		}
		if (row == 8 && col >= 15) { // in "south" 1x6 rectangle between center and back of rally area
			return (9-row) + (col-15) + 14;
		}
	}
	return -1;
}

function copyState(original){
	var s = newState();
	s.board = copyGrid(original.board);
	return s;
}

function setGrid(fromGrid, toGrid) {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			toGrid[row][col] = copyCell(fromGrid[row][col]);
		}
	}
}

function storeGrid(){
	defGrid = copyGrid(grid);
}

function copyGrid(original) {
	var copy = [];
	for (var row = 0; row < 15; ++row) {
		copy.push([]);
		for (var col = 0; col < 21; ++col) {
			copy[row].push( copyCell(original[row][col]) );
		}
	}
	return copy;
}

function copyCell(original) {
	return {
		row     : original.row,
		col     : original.col,
		checked : original.checked,
		player  : original.player,
		kind    : original.kind,
		city    : original.city,
		rot     : original.rot,
		ring    : original.ring
	}
}

function getAIPieces() {
	var p = [];
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player == gameMan.player) {
				p.push(copyCell(grid[row][col]));
			}
		}
	}
	return p;
}

function getCombinations(pieces) {
	var result = [];

	var f = function(prefix, checking) {
		for (var i = 0; i < checking.length; ++i) {
			result.push(prefix.concat(checking[i]));
			f(prefix.concat(checking[i]), checking.slice(i + 1));
		}
	}

	f([], pieces);
	return result;
}

function checkIfPiecesCanWin(pieces){
	for (var i = 0; i < 6; ++i) {
		var d = getDistanceFromGoal(pieces[i].row,pieces[i].col,gameMan.player);
		if(d <= 2){
			if(d == 1){
				// 1 move
				return true;
			}
			else if(d == 2) {
				// 2 moves
				return true;
			}
		}
	}
	return false;
}

function getDirection(dir) {
	var incRow = 0;
	var incCol = 0;

	switch(dir) {
	case 0:
		incRow = -1;
		incCol = 0;
		break;
	case 1:
		incRow = 0;
		incCol = 1;
		break;
	case 2:
		incRow = 1;
		incCol = 0;
		break;
	case 3:
		incRow = 0;
		incCol = -1;
		break;
	}
	return { row: incRow, col: incCol };
}

function getMoveArguments(p, dir) {
	var d = getDirection(dir);
	var target = {
		row: p.row + d.row,
		col: p.col + d.col
	};
  return getPieceArguments(p, target);
}

function getPieceArguments(p, target) {
	return {
		pRow : p.row,
		pCol : p.col,
		tRow : target.row,
		tCol : target.col
	}
}
