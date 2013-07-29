"use strict";

function getPlayerPiece() {
	inputMan.player = -1;
	inputMan.piece = -1;

	for (var i = 0; i < 4; ++i) {
		for (var j = 0; j < 6; ++j) {
			if (players[i].pieces[j].x == inputMan.x && players[i].pieces[j].y == inputMan.y) {
				inputMan.player = i;
				inputMan.piece = j;
				break;
			}
		}
	}
}

function rotatePiece() {
	if (inputMan.player >= 0 && inputMan.piece >= 0) {
		var piece = players[inputMan.player].pieces[inputMan.piece]

		if (inputMan.y < piece.y) {
			piece.r = 0;
		}
		else if (inputMan.x > piece.x) {
			piece.r = 1;
		}
		else if (inputMan.y > piece.y) {
			piece.r = 2;
		}
		else if (inputMan.x < piece.x) {
			piece.r = 3;
		}
	}
}

function movePiece() {
	if (inputMan.player >= 0 && inputMan.piece >= 0 && inputMan.x >= 0 && inputMan.x < 21 && inputMan.y >= 0 && inputMan.y < 15) {
		players[inputMan.player].pieces[inputMan.piece].x = inputMan.x;
		players[inputMan.player].pieces[inputMan.piece].y = inputMan.y;
	}
}
