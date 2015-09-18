"use strict";

function rallyCell(row, col) {
	return grid[row][col].kind == 2;
}

function emptyRallyCell(row, col, player) {
	return rallyCell(row, col) && grid[row][col].city == player && emptyCell(row, col)
}

function routedCell(row, col) {
	return grid[row][col].kind == 3;
}

function emptyRoutedCell(row, col, player) {
	return routedCell(row, col) && grid[row][col].city == player && emptyCell(row, col)
}

function outOfBounds(row, col) {
	return row < 0 || col < 0 || row >= 15 || col >= 21;
}

function emptyCell(row, col) {
	return grid[row][col].player < 0;
}

function invalidCell(row, col) {
	var cell = grid[row][col];
	return cell.kind < 0 || cell.kind == 3;
}

function getPiece(row, col) {
	gameMan.pRow = -1;
	gameMan.pCol = -1;
	gameMan.pRot = -1;

	if (row >= 0 && row < 15 && col >= 0 && col < 21 && grid[row][col].player >= 0 && (gameMan.debug || grid[row][col].player == gameMan.player)) {
		gameMan.pRow = row;
		gameMan.pCol = col;
		gameMan.pRot = grid[row][col].rot;

		if (canBeInPhalanx(row, col)) {
			gameMan.selection = true;
		}
		else {
			phalanx.length = 0;
			getPhalanx(row, col);
			clearChecked();
		}
	}
}

function resetRotation() {
	for (var i = phalanx.length - 1; i >= 0; --i) {
		grid[phalanx[i].row][phalanx[i].col].rot = gameMan.pRot;
	}
}

function rotatePiece(pRow, pCol, rot) {
	if (grid[pRow][pCol].kind != 3 && inPhalanx(pRow,pCol)) {
		for (var i = phalanx.length-1; i >= 0; --i) {
			grid[phalanx[i].row][phalanx[i].col].rot = rot;
		}
	}
}

function movePiece(pRow, pCol, row, col, pretend) {
	var moved = false;

	if (pRow >= 0 && pCol >= 0) {
		var currentPlayer = grid[pRow][pCol].player;
		if (phalanx.length > 1) {
			if (movePhalanx(pRow, pCol, row, col)) {
				if (eventMan[currentPlayer].length == 0) {
					eventMan[currentPlayer].push("move");
				}

				if (!pretend) {
					for(var i = phalanx.length - 1; i >= 0; --i) {
						animMan.phalanx.push({
							row: phalanx[i].row + (row - pRow),
							col: phalanx[i].col + (col - pCol)
						});
					}
					animMan["pieceSlide"] = 1;
					phalanx.length = 0;
					moved = true;
				}
			}
		}
		else if (checkMove(pRow, pCol, row, col) && pushPiece(pRow, pCol, row, col, grid[pRow][pCol].player, 1)) {
			moveOnePiece(pRow, pCol, row, col);

			if (!pretend) {
				for(var i = phalanx.length - 1; i >= 0; --i) {
					animMan.phalanx.push({
						row: phalanx[i].row + (row - pRow),
						col: phalanx[i].col + (col - pCol)
					});
				}
				animMan["pieceSlide"] = 1;
				phalanx.length = 0;
				moved = true;	// return if a piece was moved so it can be redrawn
			}

			if (routedCell(pRow, pCol) && grid[row][col].kind == 2) {	// rally
				grid[row][col].rot = grid[row][col].player;	// set rotation toward center of board
				eventMan[currentPlayer].push("rally");
			}
			else {
				eventMan[currentPlayer].push("move");
			}
		}

		if (grid[pRow][pCol].rot != gameMan.pRot) {
			if (eventMan[currentPlayer].length == 0) {
				eventMan[currentPlayer].push("rotate");
			}

			if (!pretend) {
				phalanx.length = 0;
				moved = true;
			}
		}

		if (moved) {
			if (!gameMan.debug) {
				useAction();
			}

			if (gameMan.tutorialStep < 0) {
				pushState();
			}
		}
	}

	return moved;	// return if a piece was moved, so it can be redrawn
}

function moveOnePiece(pRow, pCol, row, col) {
	grid[row][col].player = grid[pRow][pCol].player;
	if (row < pRow) {		// up
		grid[row][col].rot = 0;
	}
	else if (col > pCol) {	// right
		grid[row][col].rot = 1;
	}
	else if (row > pRow) {	// down
		grid[row][col].rot = 2;
	}
	else if (col < pCol) {	// left
		grid[row][col].rot = 3;
	}

	grid[pRow][pCol].player = -1;
	grid[pRow][pCol].rot = -1;
}

function checkMove(pRow, pCol, row, col) {
	if (outOfBounds(pRow, pCol) || outOfBounds(row, col)
	|| invalidCell(row, col)
	|| (grid[pRow][pCol].kind != 3 && Math.abs(row - pRow) + Math.abs(col - pCol) > 1)	// non adjacent cell
	|| (grid[row][col].kind == 1 && (grid[row][col].city - grid[pRow][pCol].player)%2 != 0 )	// opponent win cell
	|| (routedCell(pRow, pCol) && (grid[row][col].kind != 2 || grid[pRow][pCol].player != grid[row][col].city))
	|| (grid[row][col].player >= 0 && (grid[row][col].player - grid[pRow][pCol].player)%2 == 0)	// same team
	|| !inPhalanx(pRow,pCol)) {	// didn't click current phalanx
		return false;
	}
	return true;
}

function pushPiece(pRow, pCol, row, col, pusher, weight) {
	var currentPlayer = grid[pRow][pCol].player;
	if (invalidCell(row, col)) {
		return false;
	}

	if (emptyCell(row, col)) {
		if (grid[row][col].kind == 0	// normal cell
		|| (grid[row][col].kind > 0 && Math.abs(grid[pRow][pCol].player - grid[row][col].city)%2 == 0)) {	// allied win or rally cell
			return true;
		}

		return false;
	}

	var fRow = 2*row - pRow;
	var fCol = 2*col - pCol;

	if (inPhalanx(row, col)) {
		if (pushPiece(row, col, fRow, fCol, pusher, weight+1)) {	// i'll push if the cell in front will too
			pushOnePiece(row, col, fRow, fCol, pusher);
			return true;
		}
		return false;
	}

	if (Math.abs(pusher - grid[row][col].player)%2 == 0) {	// non-phalanx ally
		return false;
	}
	else {	// enemy piece
		var comingFrom; // Which rotation direction the offensive piece is coming from
		if (pRow < row) {
			comingFrom = 0;
		} else if (pRow > row) {
			comingFrom = 2;
		} else if (pCol > col) {
			comingFrom = 1;
		} else {
			comingFrom = 3;
		}

		if (grid[row][col].rot != comingFrom && grid[pRow][pCol].player == pusher) {	// not facing enemy
			routPiece(row,col, currentPlayer);
			return true;
		}

		if (weight > 1) {	// check line weight
			if (invalidCell(fRow, fCol)
			|| (grid[fRow][fCol].player >= 0 && Math.abs(grid[fRow][fCol].player - grid[row][col].player)%2 == 1)	// pushed into enemy piece
			|| (grid[fRow][fCol].kind == 1 && Math.abs(grid[fRow][fCol].city - grid[row][col].player)%2 == 1)) {	// pushed into enemy win cell
				routPiece(row,col, currentPlayer);
				return true;
			}

			if (pushPiece(row, col, fRow, fCol, pusher, weight-1)) {	// i'll be pushed if the piece behind me will too
				pushOnePiece(row, col, fRow, fCol, pusher);
				return true;
			}
		}
	}
	return false;
}

function pushOnePiece(row, col, fRow, fCol, pusher) {
	if (Math.abs((grid[row][col].player - pusher)%2) == 1) {
		// gameMan.receivers.push(grid[row][col].player);
		eventMan[pusher].push("push");
		eventMan[grid[row][col].player].push("pushed");
	}

	grid[fRow][fCol].player = grid[row][col].player;
	grid[fRow][fCol].rot = grid[row][col].rot;
}

// move piece to rout cell
function routPiece(row, col, router) {
	if (grid[row][col].player >= 0) {
		eventMan[router].push("rout");
		eventMan[grid[row][col].player].push("routed");
		var cell = getRoutCell(grid[row][col].player);

		grid[cell.row][cell.col].player = grid[row][col].player;
		grid[cell.row][cell.col].rot = grid[row][col].player;
	}
}

// find first empty rout cell
function getRoutCell(player) {
	switch (player) {
	case 0:
		for (var row = 0; row < 15; ++row) {
			for (var col = 0; col < 21; ++col) {
				if (emptyRoutedCell(row, col, player)) {
					return {row:row, col:col};
				}
			}
		}
		break;
	case 1:
		for (var col = 20; col >= 0; --col) {
			for (var row = 0; row < 15; ++row) {
				if (emptyRoutedCell(row, col, player)) {
					return {row:row, col:col};
				}
			}
		}
		break;
	case 2:
		for (var row = 14; row >= 0; --row) {
			for (var col = 20; col >= 0; --col) {
				if (emptyRoutedCell(row, col, player)) {
					return {row:row, col:col};
				}
			}
		}
		break;
	case 3:
		for (var col = 0; col < 21; ++col) {
			for (var row = 14; row >= 0; --row) {
				if (emptyRoutedCell(row, col, player)) {
					return {row:row, col:col};
				}
			}
		}
		break;
	}
}

function inPhalanx(row, col) {
	for (var i = phalanx.length - 1; i >= 0; --i) {
		if (phalanx[i].row == row && phalanx[i].col == col) {
			return true;
		}
	}
	return false;
}

function inAnimPhalanx(row, col) {
	for (var i = animMan.phalanx.length - 1; i >= 0; --i) {
		if (animMan.phalanx[i].row == row && animMan.phalanx[i].col == col) {
			return true;
		}
	}
	return false;
}

function getPhalanx(row, col) {
	var me = grid[row][col];
	me.checked = true;
	phalanx.push({row:row, col:col});

	if (me.kind != 3) { // check adjacent if not-routed-square
		if (row-1 >= 0) {
			var up = grid[row-1][col];
			if (up.player == me.player && up.rot == me.rot && !up.checked && up.kind != 3) {
				getPhalanx(row-1, col);
			}
		}

		if (col-1 >= 0) {
			var left = grid[row][col-1];
			if (left.player == me.player && left.rot == me.rot && !left.checked && left.kind != 3) {
				getPhalanx(row, col-1);
			}
		}

		if (row+1 < grid.length) {
			var down = grid[row+1][col];
			if (down.player == me.player && down.rot == me.rot && !down.checked && down.kind != 3) {
				getPhalanx(row+1, col);
			}
		}

		if (col+1 < grid[row].length) {
			var right = grid[row][col+1];
			if (right.player == me.player && right.rot == me.rot && !right.checked && right.kind != 3) {
				getPhalanx(row, col+1);
			}
		}
	}
}

function movePhalanx(pRow, pCol, row, col) {
	var phalanxIndex = [];
	var currentPlayer = grid[pRow][pCol].player;
	if (checkMovePhalanx(pRow, pCol, row, col)) {
		var dRow = row - pRow;
		var dCol = col - pCol;
		var moved = false;
		var flag = true;

		// find all pieces to push
		for (var i=phalanx.length-1; i>=0; --i) {
			if(!inPhalanx(phalanx[i].row-dRow, phalanx[i].col-dCol)) {
				phalanxIndex.push(i);
			}
		}

		// push them
		for (var i = phalanxIndex.length - 1; i >= 0 && flag; --i) {
			if (pushPiece(phalanx[phalanxIndex[i]].row, phalanx[phalanxIndex[i]].col, phalanx[phalanxIndex[i]].row + dRow, phalanx[phalanxIndex[i]].col + dCol, grid[phalanx[phalanxIndex[i]].row][phalanx[phalanxIndex[i]].col].player, 1)) {
				moveOnePiece(phalanx[phalanxIndex[i]].row, phalanx[phalanxIndex[i]].col, phalanx[phalanxIndex[i]].row + dRow, phalanx[phalanxIndex[i]].col + dCol);
				moved = true;
			}
			else {
				revertState();
				moved = false;
				eventMan[currentPlayer] = [];
				flag = false;
			}
		}
		clearChecked();
	}
	return moved;
}

function checkMovePhalanx(pRow, pCol, row, col) {
	var dRow = row - pRow;
	var dCol = col - pCol;
	for (var i = phalanx.length - 1; i >= 0; --i) {
		var iRow = phalanx[i].row;
		var iCol = phalanx[i].col;

		if (outOfBounds(iRow, iCol) || outOfBounds(iRow + dRow, iCol + dCol)
		||  invalidCell(iRow+dRow, iCol+dCol)
		|| (grid[iRow + dRow][iCol + dCol].kind == 1 && (grid[iRow + dRow][iCol + dCol].city - grid[iRow][iCol].player) % 2 != 0 )	// opponent win cell
		|| (grid[iRow + dRow][iCol + dCol].player >= 0 && !inPhalanx(iRow + dRow, iCol + dCol)
		&& (grid[iRow + dRow][iCol + dCol].player - grid[iRow][iCol].player) % 2 == 0)	// same team, not part of phalanx
		|| !inPhalanx(pRow,pCol)) {	// didn't click current phalanx
			return false;
		}
	}

	var eRow = 0;
	var eCol = 0;
	switch (gameMan.pRot) {	// move one step forward only
		case 0:
			eRow = -1;
			break;
		case 1:
			eCol = 1;
			break;
		case 2:
			eRow = 1;
			break;
		case 3:
			eCol = -1;
			break;
	}

	if (dRow != eRow || dCol != eCol) {
		return false;
	}

	return true;
}

function togglePhalanxPiece(row, col) {
	if (inPhalanx(row, col) && phalanx.length > 1) {	// if in phalanx, find and remove
		for (var i = phalanx.length-1; i >= 0; --i) {
			if (phalanx[i].row == row && phalanx[i].col == col) {
				phalanx = phalanx.splice(i, 1);
				return;
			}
		}
	}
	else {	// else add to phalanx if you can
		if (phalanx.length == 0) {
			phalanx.push({row:row, col:col});
			return;
		}

		for (var i = phalanx.length-1; i >= 0; --i) {
			if (Math.abs(phalanx[i].row-row) + Math.abs(phalanx[i].col-col) == 1	// adjacent cell
			&& grid[phalanx[i].row][phalanx[i].col].player == grid[row][col].player	// same player
			&& grid[phalanx[i].row][phalanx[i].col].rot == grid[row][col].rot	// same rotation
			&& !routedCell(row, col)) {
				phalanx.push({row:row, col:col});
				return;
			}
		}

		phalanx.length = 0;
		phalanx.push({row:row, col:col});
	}
}

function canBeInPhalanx(row, col) {
	phalanx.push({row: row, col: col});
	var result = isPhalanx() && (phalanx.length > 1);
	phalanx.pop();
	return result;
}

function isPhalanx() {
	for (var i = phalanx.length-1; i >= 0; --i) {
		for (var j = i - 1; j >= 0; --j) {
			if (!findMember(phalanx[i].row, phalanx[i].col, phalanx[j].row, phalanx[j].col)) {
				clearChecked();
				return false;
			}
			if (grid[phalanx[i].row][phalanx[i].col].rot != grid[phalanx[j].row][phalanx[j].col].rot) {
				clearChecked();
				return false;
			}
			clearChecked();
		}
	}

	return true;
}

function findMember(sRow, sCol, eRow, eCol) {
	if (sRow == eRow && sCol == eCol) {
		return true;
	}

	grid[sRow][sCol].checked = true;
	var found = false;

	if (inPhalanx(sRow, sCol+1) && !grid[sRow][sCol+1].checked) {
		found = found || findMember(sRow, sCol+1, eRow, eCol);
	}
	if (inPhalanx(sRow, sCol-1) && !grid[sRow][sCol-1].checked) {
		found = found || findMember(sRow, sCol-1, eRow, eCol);
	}
	if (inPhalanx(sRow+1, sCol) && !grid[sRow+1][sCol].checked) {
		found = found || findMember(sRow+1, sCol, eRow, eCol);
	}
	if (inPhalanx(sRow-1, sCol) && !grid[sRow-1][sCol].checked) {
		found = found || findMember(sRow-1, sCol, eRow, eCol);
	}

	return found;
}
