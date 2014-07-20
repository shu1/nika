"use strict";

function menuButton(button) {
	if (button == 0) {
		menuMan.show = !menuMan.show;
	}
	else if (menuMan.show) {
		switch(button) {
		case 1:
			setScene(gameMan.scene ? 0 : 1);
			break;
		case 2:
			if (gameMan.tutorialStep < 0) {
				nextTutorialStep();
			}
			else {
				endTutorial();
			}
			break;
		case 3:
			setScene(gameMan.scene ? 0 : 2);
			break;
		case 4:
			useAction(2);
			break;
		case 5:
			undo();
			break;
		case 6:
			ai();
			break;
		case 7:
			gameMan.debug = !gameMan.debug;
			break;
		}
	}
}

function getSettingsButton() {
	var scene = scenes[gameMan.scene];
	var row = Math.floor((inputMan.y - scene.y - settingsMan.y * scene.scale) / (menuMan.bHeight * scene.scale)) - 1;
	var col = Math.floor((inputMan.x - scene.x - settingsMan.x * scene.scale) / (menuMan.bWidth * scene.scale)) - 1;
	return {row: row, col: col}
}

function settingsButton(row, col) {
	var button = getSettingsButton();
	var row = button.row;
	var col = button.col;
	if (row == 0) {
		if (col == 1) {
			settingsMan.music = Math.max(0, settingsMan.music - 1);
		}
		else if (col == 2) {
			settingsMan.music = Math.min(10, settingsMan.music + 1);
		}
		sounds["music"].volume = volumeCurve(settingsMan.music / 10);

	}
	else if (row == 1) {
		if (col == 1) {
			settingsMan.sound = Math.max(0, settingsMan.sound - 1);
		}
		else if (col == 2) {
			settingsMan.sound = Math.min(10, settingsMan.sound + 1);
		}
	}
	else if (row == 5) {
		if (col == 4) {
			setScene(0);
		}
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
	inputMan.col = Math.floor((inputMan.x - scene.x) / (cellSize * scene.scale));
	inputMan.row = Math.floor((inputMan.y - scene.y) / (cellSize * scene.scale));
	inputMan.rot = -1;
	hudMan.inputText = inputMan.row + "," + inputMan.col;
	return false;
}

function getRot(dX, dY) {
	if (grid[gameMan.pRow][gameMan.pCol].kind != 3) {	// not for routed pieces
		inputMan.row = gameMan.pRow;
		inputMan.col = gameMan.pCol;

		if (dX >= dY && dX <= -dY) {	// up
			inputMan.row--;
			inputMan.rot = 0;
		}
		else if (dX >= dY && dX >= -dY) {	// right
			inputMan.col++;
			inputMan.rot = 1;
		}
		else if (dX <= dY && dX >= -dY) {	// down
			inputMan.row++;
			inputMan.rot = 2;
		}
		else {	// left
			inputMan.col--;
			inputMan.rot = 3;
		}
	}
}

function mouseDown(event) {
	hudMan.soundText = "";
	hudMan.inputText = "";
	inputMan.menu = getXY(event);
	if (!inputMan.menu) {
		getPiece(inputMan.row, inputMan.col);
		var scene = scenes[gameMan.scene];
		if (gameMan.scene == 0 && gameMan.pRow >= 0 && gameMan.pCol >= 0 && !tutorialInputs[gameMan.tutorialStep]) {
			inputMan.pX = scene.x + (gameMan.pCol * cellSize + cellSize/2) * scene.scale;
			inputMan.pY = scene.y + (gameMan.pRow * cellSize + cellSize/2) * scene.scale;
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
	mediaMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		getXY(event);
		if (!inputMan.menu) {
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;
			var scene = scenes[gameMan.scene];
			if (gameMan.scene == 0 && gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
				if (Math.abs(dX) > cellSize/2 * scene.scale || Math.abs(dY) > cellSize/2 * scene.scale) {	// inside cell is deadzone
					getRot(dX, dY);
					rotatePiece(gameMan.pRow, gameMan.pCol, inputMan.rot);
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
		mediaMan.draw = true;
	}
}

function mouseUp(event) {
	if (inputMan.click) {
		hudMan.inputText += " up";

		if (inputMan.menu) {
			menuButton(menuMan.button);
		}
		else if (!dblClick(event)) {
			var scene = scenes[gameMan.scene];
			if (gameMan.scene == 1) {	// settings
				if (inputMan.x - scene.x > settingsMan.x * scene.scale && inputMan.x - scene.x < (settingsMan.x + settingsMan.width) * scene.scale
				&& inputMan.y - scene.y > settingsMan.y * scene.scale && inputMan.y - scene.y < (settingsMan.y + settingsMan.height) * scene.scale) {
					// sounds[6].volume = 1 - sounds[6].volume;
					// getSettingsButton();
					settingsButton(0);
				}
			}
			else if (gameMan.scene == 2) {	// rules
				if (inputMan.x > canvas.width - cellSize*2) {
					gameMan.rules++;
					if (gameMan.rules > rulePages-1) {
						gameMan.rules = 0;
					}
				}
				else if (inputMan.x < cellSize*2) {
					gameMan.rules--;
					if (gameMan.rules < 0) {
						gameMan.rules = rulePages-1;
					}
				}
			}
			else if (gameMan.tutorialStep >= 0 && (tutorialInputs[gameMan.tutorialStep] || gameMan.debug)) {	// tutorial
				if (inputMan.x - scene.x > dialogMan.x * scene.scale && inputMan.x - scene.x < (dialogMan.x + dialogMan.width) * scene.scale
				&& inputMan.y - scene.y > dialogMan.y * scene.scale && inputMan.y - scene.y < (dialogMan.y + dialogMan.height) * scene.scale) {
					inputMan.time = 0;
					nextTutorialStep();
				}
			}
			else if (gameMan.pRow >= 0 && gameMan.pCol >= 0 && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol
			&& grid[gameMan.pRow][gameMan.pCol].rot == gameMan.pRot) {	// one-click selection
			 	if (!gameMan.selection) {
			 		phalanx.length = 0;
			 	}
			 	gameMan.selection = true;
			 	togglePhalanxPiece(gameMan.pRow, gameMan.pCol);
			 	checkTutorialSelection();
			}
			else if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
				inputMan.time = 0;
				gameMan.selection = false;	// after move always get out of selection mode
			}
			else if (gameMan.selection && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
				togglePhalanxPiece(inputMan.row, inputMan.col);
			}

			if (phalanx.length > 0) {
				if (grid[phalanx[0].row][phalanx[0].col].kind == 3) {
					gameMan.selection = false;
					phalanx.length = 0;
				}
			}
		}
		inputMan.menu = false;
		inputMan.click = false;
		mediaMan.play = true;
		mediaMan.draw = true;
	}
}

function dblClick(event) {
	if (gameMan.scene == 1 || gameMan.scene == 2) {
		return false;
	}
	var time = Date.now();
	if (time - inputMan.time < 300) {	// double click time in milliseconds
		hudMan.inputText += " " + (time - inputMan.time) + "ms";
		event.preventDefault();

		if (maxScale != minScale) {	// zoom not disabled
			zoom();
		}
		inputMan.time = 0;	// reset so next click is not double click
		return true;
	}
	inputMan.time = time;
	return false;
}
