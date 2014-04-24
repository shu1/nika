function initTutorials() {
	var numTuts = tutorialTurns.length;
	var tuts = new Array(numTuts);

	for (var i=0; i<numTuts; ++i) {
		var tut = {
			turn:0,
			turns:tutorialTurns[i],
			board:tutorialBoards[i]
		}
		tuts[i] = tut;
	}
	tutorialMan.tuts = tuts;
}

function tutorial(n) {
	generateGrid(tutorialBoards[n]);
	pushGameState();
	tutorialMan.step = n;
	tutorialMan.tuts[n].turn = 0;
	draw();
	tutStartAction();
	if (tutorialCompleted()) {
		nextTutorial();
	}
}

function tutStartAction() {
	switch (tutorialMan.step) {
	case 0:
		tutorialMessage("Welcome, strategos! You have been assigned command of our noble Athenian troops against the cruel Spartans and the treacherous Thebans.");
		tutorialMessage("Our objective is to reach the camp of the Messenians, our brave allies. If a single Athenian piece reaches any part of this area, we win, and so do the Messenians.");

		grid[2][10].ring = 3;
		mediaMan.draw = true;
		tutorialMessage("Drag our piece onto the highlighted space to claim victory.");
		break;
	case 1:
		grid[12][10].ring = 3;
		mediaMan.draw = true;

		tutorialMessage("We can also win by helping any Messenian piece reach our own camp.");
		moveOnePiece(11,10,12,10);
		mediaMan.draw = true;
		tutorialMessage("Victory!");
		break;
	case 2:
		grid[12][10].ring = 3;
		mediaMan.draw = true;

		tutorialMessage("Our enemies have allied against us. We must stop them from breaking through our lines at any cost!");
		moveOnePiece(7,17,7,18);
		mediaMan.draw = true;
		tutorialMessage("Defeat!");
		break;
	case 3:
		grid[12][10].ring = 3;
		mediaMan.draw = true;

		tutorialMessage("If any Spartan or Theban reaches the opposite camp, we will have failed in our mission, and the battle will be lost.");
		moveOnePiece(7,3,7,2);
		mediaMan.draw = true;
		tutorialMessage("Defeat!");
		break;
	case 4:
		tutorialMessage("The Spartans have sent a scout into our territory. We must drive him off!");
		tutorialMessage("We can take two actions on our turn.");
		grid[9][7].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("All hoplites carry shields which protect their front. The Spartan is FACING this piece, so this piece cannot attack.");

		grid[9][7].ring = -1;
		grid[10][5].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("But Athena smiles upon us today - we have him flanked! Let us MOVE our other soldier forward. Drag this piece in the direction you want to move it.");
		break;
	case 5:
		grid[9][11].ring = 2;
		grid[10][11].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("Strategos! While we were dealing with that Spartan, a contingent of Thebans has approached us from behind. Two of our men are in danger!");

		grid[9][11].ring = -1;
		mediaMan.draw = true;
		tutorialMessage("We must protect ourselves! To ROTATE a piece in place, drag it in the direction you want it to face, then end your touch on the same piece. Rotate this piece so that it faces the right.");
		break;
	case 6:
		tutorialMessage("Like all hoplites, our troops are trained to act in the powerful PHALANX formation. If two or more are adjacent and face the same way, they can move and rotate together.");
		grid[9][6].ring = 2;
		grid[10][6].ring = 2;
		grid[9][5].ring = 3;
		grid[10][5].ring = 3;
		mediaMan.draw = true;
		tutorialMessage("To move in a phalanx, just drag forward any piece that is part of a phalanx formation.");
		break;
	case 7:
		tutorialMessage("The Thebans have mounted a tough defense. If we move our whole phalanx forward, our piece nearest the main Theban formation will be in danger. Let us proceed with caution.");
		grid[10][14].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("Fortunately, we can split pieces off from a phalanx. Double tap the indicated piece to enter phalanx sub-selection mode.");
		break;
	case 8:
		grid[8][5].ring = 3;
		mediaMan.draw = true;
		tutorialMessage("This Spartan seeks to block our path. Well, the Spartans are known more for their bravery than their intelligence...");
		grid[9][5].ring = 2;
		grid[10][5].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("Our phalanx cannot rout the Spartan, as he is facing us. But, since we have two pieces lined up against a single enemy, we can PUSH him backward by simply moving our phalanx toward him.");
		break;
	case 9:
		tutorialMessage("We have gained an advantage on the Thebans. We have three soldiers against their two. But how best to proceed?");
		grid[8][15].ring = 3;
		grid[9][15].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("We cannot push in this line, as there is only one Athenian facing one Theban. Our soldier here is stuck.");

		grid[8][15].ring = -1;
		grid[9][15].ring = -1;
		grid[8][16].ring = 3;
		grid[9][16].ring = 2;
		grid[10][16].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("However, we have the advantage in this line. Our two pieces can push back the single Theban. Select only them, and move them forward.");
		break;
	case 10:
		grid[3][5].ring = 3;
		grid[4][5].ring = 2;
		grid[5][5].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("Good news, strategos! Our men have trapped a Spartan near the edge of the field.");
		tutorialMessage("If we push an enemy piece off the battlefield, that enemy is routed. Push that Spartan to take him out!");
		break;
	case 11:
		tutorialMessage("We can reap great rewards by coordinating with the Messenians, our allies.");
		grid[6][15].ring = 3;
		grid[7][15].ring = 2;
		grid[8][15].ring = 2;
		mediaMan.draw = true;
		tutorialMessage("If we push this piece into our ally, the Theban will be routed, regardless of our ally's facing. Pushing an enemy into our own piece does the same thing.");
		tutorialMessage("So, order the men forward!");
		break;
	}
}

function tutCorrectMoveAction() {
	switch (tutorialMan.step) {
	case 0:
		tutorialMessage("Victory!");
		break;

/*		case 1:
		alert("Victory!");
		break;
*/
	case 4:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			grid[9][6].ring = 3;
			grid[10][6].ring = 2;
			mediaMan.draw = true;
			tutorialMessage("We can ROUT an enemy piece by moving into it from the side or back, but not from the front. Take out that Spartan!");
			break;
		case 1:
			tutorialMessage("Bravo! Now, listen - this is important. A piece can move forward, left, right, or back in one action. As you saw, it turns to face the direction it moved in.");
			break;
		}
		break;

	case 5:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			grid[9][11].ring = 2;
			mediaMan.draw = true;
			tutorialMessage("Excellent! Now, rotate our other soldier to face the Theban. Since the Theban is blocking movement in that direction, you can just drag our piece toward the Theban.");
			break;

		case 1:
			tutorialMessage("Pieces can rotate to face any direction in one action. Well done - the men are safe, for now.");

			moveOnePiece(11,14,11,13);
			moveOnePiece(11,13,11,12);
			mediaMan.draw = true;

			tutorialMessage("Beware! The accursed Thebans are trying to get around the edge of our line. We must rally!");

			grid[13][8].ring = 2;
			mediaMan.draw = true;

			tutorialMessage("Routed pieces are not out of the battle forever. You can rally one routed piece at a time back onto the battlefield into the areas indicated.");

			grid[13][9].ring = 3;
			grid[13][10].ring = 3;
			grid[13][11].ring = 3;
			mediaMan.draw = true;

			tutorialMessage("To RALLY a piece, drag it into one of your rally spaces. Let's deploy our man here so he can hurry back to the fight.");

			tutResetActions(0);
			break;

		case 2:
			for (var i=9; i<=11; ++i) {
				if (grid[13][i].player == 0) {
					grid[12][i].ring = 3;
				}
			}
			tutorialMessage("We move through these spaces normally, but our enemies are not allowed to enter them.");
			tutorialMessage("Let's move up our fresh soldier in support.");
			break;

		case 3:
			tutorialMessage("Brilliant!");
			break;
		}
		break;

	case 6:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			grid[9][5].ring = 3;
			grid[10][5].ring = 3;
			mediaMan.draw = true;
			tutorialMessage("Exactly. Now, rotate our phalanx to face the Spartan. Drag any piece in the phalanx in the direction you want it to face.");
			break;

		case 1:
			tutorialMessage("Good! You'll notice that pieces in a phalanx can only move forward. Moving in a different direction requires two actions: first rotating the phalanx, then moving it.");
			break;
		}
		break;

	case 7:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			grid[11][16].ring = 2;
			grid[10][16].ring = 3;
			mediaMan.draw = true;
			tutorialMessage("Now, to the attack! Select only the forward piece by double-tapping it, then rout the exposed Theban. Remember - unlike a phalanx, a single piece can move in any direction!");
			break;
		case 1:
			tutorialMessage("We have struck first without leaving our men vulnerable. Masterful!");
			break;
		}
		break;

	case 8:
		tutorialMessage("Just so. We can push no further, as there are now two enemies lined up to block our way, even though the farther Spartan is not facing us. Still, it is important to gain ground when we can.");
		break;

	case 9:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			grid[8][16].ring = 2;
			grid[8][15].ring = 3;
			mediaMan.draw = true;
			tutorialMessage("Ha! Now, seize the advantage and destroy that Theban! Double tap to select only this piece so it can move to the left without rotating first - but I'm sure you knew that already. Then attack!");
			break;

		case 1:
			tutorialMessage("This a common tactical maneuver. The Thebans may take the piece that just attacked, but that's okay - we can counter-attack next turn, leaving our two soldiers masters of the field.");
			break;
		}
		break;

	case 10:
		tutorialMessage("Yes! We can rout enemies by pushing them into any invalid space. That includes our and our ally's victory areas, as well as the center or outside of the board.");
		break;

	case 11:
		tutorialMessage("Perfect! At this point, we'll have to wait for the Messenians to move their soldier out of our way. We are never allowed to push or rout our allies - or our own men.");
		break;
	}
}

function tutCorrectMove() {
	var correct = false;

	switch (tutorialMan.step) {
	case 0:
		if (grid[2][10].player == 0) {
			correct = true;
		}
		break;

	case 1:
		correct = true;
		break;

	case 2:
		correct = true;
		break;

	case 3:
		correct = true;
		break;

	case 4:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			if (grid[10][6].player == 0) {
				correct = true;
			}
			break;

		case 1:
			if (grid[9][6].player == 0) {
				correct = true;
			}
			break;
		}
		break;

	case 5:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			if (grid[10][11].rot == 1) {
				correct = true;
			}
			break;

		case 1:
			if (grid[9][11].rot == 1) {
				correct = true;
			}
			break;

		case 2:
			if (grid[13][9].player == 0 || grid[13][10].player == 0 || grid[13][11].player == 0) {
				correct = true;
			}
			break;

		case 3:
			if (grid[12][9].player == 0 || grid[12][10].player == 0 || grid[12][11].player == 0) {
				correct = true;
			}
			break;
		}
		break;

	case 6:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			if (grid[9][5].player == 0 && grid[10][5].player == 0) {
				correct = true;
			}
			break;

		case 1:
			if (grid[9][5].rot == 0 && grid[10][5].rot == 0) {
				correct = true;
			}
			break;
		}
		break;

	case 7:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			if (grid[10][15].player == 0 && grid[11][15].player == 0 && grid[11][16].player == 0
				&& grid[9][14].player == 0) {
				correct = true;
			}
			break;
		case 1:
			if (grid[10][16].player == 0) {
				correct = true;
			}
			break;
		}
		break;

	case 8:
		if (grid[8][5].player == 0) {
			correct = true;
		}
		break;

	case 9:
		switch (tutorialMan.tuts[tutorialMan.step].turn) {
		case 0:
			if (grid[8][16].player == 0) {
				correct = true;
			}
			break;

		case 1:
			if (grid[8][15].player == 0) {
				correct = true;
			}
			break;
		}
		break;

	case 10:
		if (grid[3][5].player == 0) {
			correct = true;
		}
		break;

	case 11:
		if (grid[6][15].player == 0) {
			correct = true;
		}
		break;
	}

	if (correct) {
		clearRings();
		mediaMan.draw = true;
		draw();
		tutCorrectMoveAction();
		tutorialMan.tuts[tutorialMan.step].turn += 1;
	}

	return correct;
}

function tutorialCompleted() {
	return (tutorialMan.tuts[tutorialMan.step].turn >= tutorialMan.tuts[tutorialMan.step].turns)
}

function nextTutorial() {
	tutorialMan.step++;

	if (tutorialMan.step >= tutorialBoards.length) {
		alert("Tutorial completed. Time to play.");
		endTutorial();
	}
	else {
		tutorial(tutorialMan.step);
	}

	tutResetActions(0);
}

function endTutorial() {
	generateGrid(mainBoard);
	tutorialMan.step = -1;
	draw();
/*	alert("Congratulations! You now know everything you need to play Nika.");
	alert("Always remember your ultimate goal - get one of your pieces across the board into the victory area on your ally's side, or help your ally do the same.");
	alert("As you play, take some time to explore the user interface. You can, for example, UNDO an unwanted move, or PASS if you feel you cannot better your position by taking an action.");
	alert("Though the rules are few, you will find that the strategies are deep and varied. Now then, proserchou kai nika - go forth and conquer!");
*/}

function tutorialMessage(text) {
	tutorialMan.text = text;
}

testFunction = function () {
	alert("This is a test.");
}

function tutResetActions(player) {
	gameMan.player = player;
	gameMan.actions = 2;
}
