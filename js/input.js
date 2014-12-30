"use strict";

function menuButton(button) {
	switch(button) {
	case 0:
		if (gameMan.scene == "rules") {
			setScene("board");
		}
		else {
			menuMan.show = !menuMan.show;
		}
		break;
	case 1:
		gameMan.debug = !gameMan.debug;
		initAnimations();
		break;
	case 2:
		ai();
		break;
	case 3:
		zoom();
		break;
	case 4:
		pass();
		break;
	case 5:
		undo();
		break;
	case 6:
		setScene("rules");
		menuMan.show = false;
		break;
	case 7:
		if (gameMan.tutorialStep < 0) {
			nextTutorialStep();
		}
		else {
			endTutorial();
		}
		break;
	}
}

function getXY(event) {
	if (event.touches) {
		inputMan.x = event.touches[0].pageX;
		inputMan.y = event.touches[0].pageY;
	}
	else {
		inputMan.x = event.layerX;
		inputMan.y = event.layerY;
	}

	// check menu
	if (inputMan.x < canvas.width && inputMan.x > canvas.width - menuMan.width
	&& inputMan.y < canvas.height && inputMan.y > canvas.height - menuMan.height) {
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				if (inputMan.x > canvas.width - menuMan.bWidth * (col+1) && inputMan.y > canvas.height - menuMan.bHeight * (row+1)) {
					menuMan.button = row * menuMan.cols + col;
					if (menuMan.button < buttons.length-1) {
						hudMan.inputText = buttons[menuMan.button+1];
					}
					return true;
				}
			}
		}
	}

	// no menu, so grid
	var scene = scenes[gameMan.scene];
	inputMan.col = Math.floor((inputMan.x - scene.x) / (displayMan.cellSize * scene.scale));
	inputMan.row = Math.floor((inputMan.y - scene.y) / (displayMan.cellSize * scene.scale));
	inputMan.rot = -1;
	hudMan.inputText = inputMan.row + "," + inputMan.col;
	return false;
}

function getRot(dX, dY) {
	var scene = scenes[gameMan.scene];
	var radius = 4 * displayMan.cellSize*displayMan.cellSize*scene.scale*scene.scale;

	if (grid[gameMan.pRow][gameMan.pCol].kind != 3) {	// not for routed pieces
		inputMan.row = gameMan.pRow;
		inputMan.col = gameMan.pCol;

		if (dX >= dY && dX <= -dY) {	// up
			inputMan.rot = 0;
		}
		else if (dX >= dY && dX >= -dY) {	// right
			inputMan.rot = 1;
		}
		else if (dX <= dY && dX >= -dY) {	// down
			inputMan.rot = 2;
		}
		else {	// left
			inputMan.rot = 3;
		}

		if (gameMan.pRot == inputMan.rot || dX*dX + dY*dY < radius) {	// forward or inside radius
			if (inputMan.rot == 0) {
				inputMan.row--;
			}
			else if (inputMan.rot == 1) {
				inputMan.col++;
			}
			else if (inputMan.rot == 2) {
				inputMan.row++;
			}
			else if (inputMan.rot == 3) {
				inputMan.col--;
			}
		}
	}
}

function mouseDown(event) {
	if (setCurrentTouch(event)) {
		hudMan.actionText = "";
		hudMan.inputText = "";
		inputMan.menu = getXY(event);
		if (!inputMan.menu && gameMan.winner < 0) {
			getPiece(inputMan.row, inputMan.col);
			if (phalanx.length > 0) {
				setRallyHighlights(phalanx[0].row, phalanx[0].col);
			}
			var scene = scenes[gameMan.scene];
			if (gameMan.scene == "board" && gameMan.pRow >= 0 && gameMan.pCol >= 0 && !tutorialInputs[gameMan.tutorialStep]) {
				inputMan.pX = scene.x + (gameMan.pCol * displayMan.cellSize + displayMan.cellSize/2) * scene.scale;
				inputMan.pY = scene.y + (gameMan.pRow * displayMan.cellSize + displayMan.cellSize/2) * scene.scale;
				event.preventDefault();
			}
			else {
				inputMan.pX = inputMan.x;
				inputMan.pY = inputMan.y;
				gameMan.selection = false;	// back to normal selection if you deselect pieces
				phalanx.length = 0;
			}
		}
		hudMan.inputText += " down";
		inputMan.click = true;
	}
}

function mouseMove(event) {
	if (inputMan.click && isMatchingTouch(event)) {
		getXY(event);
		if (!inputMan.menu && gameMan.winner < 0) {
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;
			var scene = scenes[gameMan.scene];
			if (gameMan.scene == "board" && gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
				if (Math.abs(dX) > displayMan.cellSize/2 * scene.scale
				|| Math.abs(dY) > displayMan.cellSize/2 * scene.scale) {	// inside cell is deadzone
					getRot(dX, dY);
					rotatePiece(gameMan.pRow, gameMan.pCol, inputMan.rot);
				}
				else {
					resetRotation();
					inputMan.row = gameMan.pRow;
					inputMan.col = gameMan.pCol;
				}
				event.preventDefault();
			}
			else {	// pan
				if (pan(dX, dY)) {
					hudMan.inputText = -scene.x + "," + -scene.y;
					event.preventDefault();
				}
				inputMan.pX = inputMan.x;
				inputMan.pY = inputMan.y;
			}
		}
	}
}

function mouseUp(event) {
	if (inputMan.click && isMatchingTouch(event)) {
		hudMan.inputText += " up";
		if (inputMan.menu) {
			menuButton(menuMan.button);
		}
		else {
			var scene = scenes[gameMan.scene];
			if (gameMan.scene == "rules") {
				if (inputMan.y > canvas.height / 2 - displayMan.cellSize * 1.5
				 && inputMan.y < canvas.height / 2 + displayMan.cellSize * 1.5) {
					if (inputMan.x > canvas.width - displayMan.cellSize*2) {
						gameMan.rules = Math.min(gameMan.rules + 1, rulePages - 1);
					}
					else if (inputMan.x < displayMan.cellSize*2) {
						gameMan.rules = Math.max(gameMan.rules - 1, 0);
					}
				}

				if (inputMan.x < displayMan.cellSize*3.5 && inputMan.y > canvas.height - displayMan.cellSize*2.5) {
					setScene("board");
				}
			}
			else if (gameMan.tutorialStep >= 0 && (tutorialInputs[gameMan.tutorialStep] || gameMan.debug)) {	// tutorial
				if (inputMan.x - scene.x > displayMan.dialogX * scene.scale
				&& inputMan.x - scene.x < (displayMan.dialogX + displayMan.dialogWidth) * scene.scale
				&& inputMan.y - scene.y > displayMan.dialogY * scene.scale
				&& inputMan.y - scene.y < (displayMan.dialogY + displayMan.dialogHeight) * scene.scale) {
					inputMan.time = 0;
					nextTutorialStep();
				}
			}
			else if (gameMan.winner >= 0) {	// win screen
				if (inputMan.x - scene.x > displayMan.dialogX * scene.scale
				&& inputMan.x - scene.x < (displayMan.dialogX + displayMan.dialogWidth) * scene.scale
				&& inputMan.y - scene.y > displayMan.dialogY * scene.scale
				&& inputMan.y - scene.y < (displayMan.dialogY + displayMan.dialogHeight) * scene.scale) {
					inputMan.time = 0;
					newGame();
				}
			}
			else if (gameMan.pRow >= 0 && gameMan.pCol >= 0 && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol
			&& grid[gameMan.pRow][gameMan.pCol].rot == gameMan.pRot) {	// one-click selection
			 	if (!gameMan.selection) {
			 		phalanx.length = 0;
			 	}
			 	togglePhalanxPiece(gameMan.pRow, gameMan.pCol);
			 	checkTutorialSelection();
			}
			else if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
				inputMan.time = 0;
			}
			else if (gameMan.selection && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
				togglePhalanxPiece(inputMan.row, inputMan.col);
			}

			if (phalanx.length > 0) {
				if (grid[phalanx[0].row][phalanx[0].col].kind == 3) {
					phalanx.length = 0;
				}
			}
		}
		clearRallyHighlights();
		endCurrentTouch();
		gameMan.selection = false;
		inputMan.menu = false;
		inputMan.click = false;
		audioMan.play = true;
	}
}

function setCurrentTouch(event) {
	if (event.changedTouches && event.changedTouches.length > 0) {	// respect touch ID if touch API supported
		if (inputMan.currentTouchId == -1) {
			inputMan.currentTouchId = event.changedTouches[0].identifier;
			return true;
		}
	}
	else if (navigator.msPointerEnabled) {
		if (inputMan.currentTouchId == -1) {
			inputMan.currentTouchId = event.pointerId;
			return true;
		}
	}
	else {	// cancel all touches if touch API not supported
		revertGrid();
		return true;
	}

	return false;
}

function endCurrentTouch(event) {
	inputMan.currentTouchId = -1;
}

function isMatchingTouch(event) {
	if (event.changedTouches) {	// if touch API supported
		for (var i = event.changedTouches.length-1; i >= 0; --i) {
			if (event.changedTouches[i].identifier == inputMan.currentTouchId) {
				return true;
			}
		}
		return false;
	}
	else if (navigator.msPointerEnabled) {
		return event.pointerId == inputMan.currentTouchId;
	}

	return true;	// all touches are deemed to "match" if touch API is not supported
}
