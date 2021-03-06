﻿"use strict";

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

var aiP = aiWeights[0]; //Alias?

function newState (){
	var s = {
		value : 0, //Value of state after board state adjustments
		board : grid //grid object, state of board after this move, will be applied to board upon ai exit.
	};
	return s;
}

function aiNeil(aiNum){
	aiP = aiWeights[aiNum || 0];
	storeGrid();
	var pieces = [];
	pieces = getAIPieces();

	//Checks if any pieces are close enough to win.
	checkIfPiecesCanWin(pieces);

	//Creates the default state in which all other states are compared to.
	var defaultState = newState();
	getValue(defaultState,pieces);
	// console.log("Default Value " + defaultState.value);
	var bestState = defaultState; //Stores best state, which is default at this point. Altough we might be better off just setting best state.

	var rallySpots = [];
	for (var row = 0 ; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if(grid[row][col].kind == 2 && grid[row][col].city == pieces[0].player){
				rallySpots.push(grid[row][col]);
			}
		}
	}

	//EACH PIECE CHECKING =============
	for(var i = 0; i<6; i++){
		if(pieces[i].kind == 3){
			for(var j = 0; j<rallySpots.length; j++){
				//Get rally spots
				phalanx = [pieces[i]];
				var rally = getRallyArguments(pieces[i],rallySpots[j]);
				//debugger;
				movePiece(rally.pRow,rally.pCol,rally.tRow,rally.tCol,true);
				pieces = getAIPieces();
				var temp = copyState(defaultState);
				getValue(temp,pieces);
				// console.log(temp.value);
				if(temp.value>bestState.value){
					bestState=temp;
					// console.log("Found better state by RALLYING with a value of: " + bestState.value);
				}
				setGrid(defGrid,grid);
				pieces = getAIPieces();
			}
		}
		else{
			// Do normal move check, which means rotation, then movement.
			origRot = pieces[i].rot;
			for (var rot = 0; rot<4; rot++){
				if(rot!=origRot){
					pieces[i].rot=rot;
					var temp = copyState(defaultState);
					getValue(temp,pieces);
					if(temp.value>bestState.value){
						bestState=temp;
						// console.log("Found better state by ROTATION with a value of: " + bestState.value);
					}
				}
			}
			setGrid(defGrid,grid);
			pieces = getAIPieces();
			for (var dir = 0; dir<4; dir++){
				//Check moves in each direction
				phalanx=[pieces[i]];

				var move = getMoveArguments(phalanx[0],dir);
				var origRot = phalanx[0].rot;

				movePiece(move.pRow,move.pCol,move.tRow,move.tCol,true);
				pieces = getAIPieces();
				var temp = copyState(defaultState);
				getValue(temp,pieces);
				if(temp.value>bestState.value){
					bestState=temp;
					// console.log("Found better state by MOVEMENT with a value of: " + bestState.value);
				}
				setGrid(defGrid,grid);
				pieces = getAIPieces();
				phalanx=[];
			}
		}
	}

	setGrid(defGrid,grid);

	//PHALANX CHECKING =====================
	for(var i=0; i<4; i++){
		var sameDir=[];
		for (var p=0; p<6; p++){
			if(pieces[p].rot==i){
				sameDir.push(pieces[p]);
			}
		}
		if(sameDir.length>1){
			var combinations = getCombinations(sameDir);
			combinations.forEach(function(e){
				phalanx = [];
				phalanx = e.slice(0);
				if(phalanx.length>1 && isPhalanx()){
					for(var rot=0;rot<4;rot++){
						if(rot!=i){
							rotatePiece(phalanx[0].row, phalanx[0].col, rot);
							pieces = getAIPieces();
							var temp = copyState(defaultState);
							getValue(temp,pieces);
							if(temp.value>bestState.value){
								bestState=temp;
								// console.log("Found better state by ROTATING A PHALANX with a value of: " + bestState.value);
							}
							setGrid(defGrid,grid);
							pieces = getAIPieces();
						}
					}
					setGrid(defGrid,grid);
					pieces = getAIPieces();
					var rot = phalanx[0].rot;

					var move = getMoveArguments(phalanx[0],rot);
					movePiece(move.pRow,move.pCol,move.tRow,move.tCol,true);

					phalanx = e.slice(0);
					pieces = getAIPieces();

					var temp = copyState(defaultState);
					getValue(temp,pieces);
					if(temp.value>bestState.value){
						bestState=temp;
						// console.log("Found better state by MOVING A PHALANX with a value of: " + bestState.value);
					}
					setGrid(defGrid,grid);
					pieces = getAIPieces();
				}
			});
		}
	}

	//AFTER ALL CHECKING IS DONE ===========
	setGrid(bestState.board,grid);
	phalanx=[];
	useAction();
	pushState();
}

function getValue(state,pieces){
	for (var i=0; i<6; i++){

		var val = 0;

		//Piece on Board
		if(pieces[i].kind!=3){ val+=aiP.values.ownPiecesOnBoard; }

		//Adjacent Check
		var adj = [];
		if(pieces[i].row-1>-1){ adj[0] = grid[pieces[i].row-1][pieces[i].col]; }//N
		if(pieces[i].col+1<grid[pieces[i].row].length){ adj[1] = grid[pieces[i].row][pieces[i].col+1]; } //E
		if(pieces[i].row+1<grid.length){ adj[2] = grid[pieces[i].row+1][pieces[i].col]; } //S
		if(pieces[i].col-1>0){ adj[3] = grid[pieces[i].row][pieces[i].col-1]; }//W

		for(var j=0; j<4; j++){
			if(adj[j]!=undefined && adj[j].kind!=-1 && adj[j].player>-1){
				//Own
				if(adj[j].player==pieces[i].player){
					if(adj[j].rot==pieces[i].rot){ val+=aiP.values.ownAdjInPhalanx; }//In Phalanx
					else{ val+=aiP.values.ownAdjNotInPhalanx; }//Not in Phalanx
				}

				//Ally
				else if(Math.abs((adj[j].player-pieces[i].player)%2)==0){
					if(adj[j].rot==pieces[i].rot){val+=aiP.values.allyAdjSameDir;} //Same Dir
					else{val+=aiP.values.allyAdjDiffDir;} //Diff Dir
				}

				//Enemy
				else{
					if(pieces[i].rot == j && Math.abs((adj[j].rot-j)%2)==0){
						val+=aiP.values.enemyAdjBlocked; //Facing eachother.
					}
					else if(pieces[i].rot==j){
						//If piece is facing adj, but they aren't facing eachother, then adj is routable
						if(gameMan.actions>1){ val+=aiP.values.enemyAdjRoutable[0]; }
						else{ val+=aiP.values.enemyAdjRoutable[1]; }
					}
					else if(Math.abs((adj[j].rot-j)%2)==0){
						//Else if we're not facing adjacent, check if he's facing us.
						if(gameMan.actions>1){ val+=aiP.values.enemyAdjCanRoutMe[0]; }
						else{ val+=aiP.values.enemyAdjCanRoutMe[1];}
					}
					else{
						//Adjacent but not facing each other.
						if(gameMan.actions>1){ val+=aiP.values.enemyAdjBothNotFacing[0]; }
						else { val+=aiP.values.enemyAdjBothNotFacing[1]; }
					}
				}
			}
		}
		val+=aiP.values.perSquareDistanceFromGoal*getDistanceFromGoal(pieces[i].row,pieces[i].col,gameMan.player);
		state.value+=val; //Adds piece value to total value
	}
	//Add points for every routed enemy piece
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player>-1 && Math.abs(gameMan.player-grid[row][col].player)%2!=0 && grid[row][col].kind==3) {
				state.value+=aiP.values.perRoutedEnemyPiece;
			}
		}
	}
}

function copyState(original){
	var o = original.board;
	var s = newState();
	var b = new Array(15);
	for (var row = 0; row < 15; ++row){
		b[row]=new Array(21);
		for (var col = 0; col < 21; ++col){
			var p = {}
			p.row=row;
			p.col=col;
			p.checked=o[row][col].checked;
			p.player=o[row][col].player;
			p.kind=o[row][col].kind;
			p.city=o[row][col].city;
			p.rot=o[row][col].rot;
			p.ring=o[row][col].ring;
			p.prompt=o[row][col].prompt;
			b[row][col]=p;
		}
	}
	s.board=b;
	return s;
}

function setGrid(gFrom, gTo){
	for (var row = 0; row < 15; ++row){
		for (var col = 0; col < 21; ++col){
			gTo[row][col].row=row;
			gTo[row][col].col=col;
			gTo[row][col].checked=gFrom[row][col].checked;
			gTo[row][col].player=gFrom[row][col].player;
			gTo[row][col].kind=gFrom[row][col].kind;
			gTo[row][col].city=gFrom[row][col].city;
			gTo[row][col].rot=gFrom[row][col].rot ;
			gTo[row][col].ring=gFrom[row][col].ring;
			gTo[row][col].prompt=gFrom[row][col].prompt;
		}
	}
}

// get distance to goal - to be used in ai evaluation
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

function storeGrid(){
	var pGrid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		pGrid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var cell = {
				checked: grid[row][col].checked,
				player : grid[row][col].player,
				kind   : grid[row][col].kind,
				city   : grid[row][col].city,
				rot    : grid[row][col].rot,
				ring   : grid[row][col].ring
			}
			pGrid[row][col] = cell;
		}
	}
	defGrid=pGrid;
}

function getAIPieces(){
	var p = [];
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			if (grid[row][col].player == gameMan.player) {
				p.push(grid[row][col]);
			}
		}
	}
	return p;
}

function getCombinations(pieces) {
	var result = [];

	var f = function(prefix, checking) {
		for (var i = 0; i < checking.length; i++) {
			result.push(prefix.concat(checking[i]));
			f(prefix.concat(checking[i]), checking.slice(i + 1));
		}
	}

	f([], pieces);
	return result;
}

function checkIfPiecesCanWin(pieces){
	for (var i = 0; i<6; i++){
		var d = getDistanceFromGoal(pieces[i].row,pieces[i].col,gameMan.player);
		if(d<=2){
			if(d==1){
				//1 move
				// console.log("1 space away.");
				return true;
			}
			else if(d==2){
				//2 moves
				// console.log("2 spaces away.");
				return true;
			}
		}
	}

	return false;
}

function getDirection(dir){
	var incRow = 0;
	var incCol = 0;
	switch(dir){
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
	return {row:incRow,col:incCol};
}

function getMoveArguments(p,dir){
	var d = getDirection(dir);
	var newRow = p.row+d.row;
	var newCol = p.col+d.col;
	return {
		pRow : p.row,
		pCol : p.col,
		tRow : newRow,
		tCol : newCol
	}
}

function getRallyArguments(p,target){
	return {
		pRow : p.row,
		pCol : p.col,
		tRow : target.row,
		tCol : target.col
	}
}
