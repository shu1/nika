"use strict";

function mouseDown(event) {
	var singleClick = setTouch(event);
	inputMan.menu = getXY(event);
	if (singleClick) {
		hudMan.inputText = "";
		if (!inputMan.menu && gameMan.winner < 0) {
			var scene = scenes[gameMan.scene];
			getRowCol(scene);

			getPiece(inputMan.row, inputMan.col);
			if (phalanx.length > 0) {
				setRallyHighlights(phalanx[0].row, phalanx[0].col);
			}

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
	}
}

function mouseMove(event) {
	if (inputMan.touchID >= 0) {
		getXY(event);
		if (inputMan.touchID2 >= 0) {
			pinchZoom(inputMan.x, inputMan.y, inputMan.x2, inputMan.y2);
		}
		else if (!inputMan.menu && isTouch(event, inputMan.touchID)) {
			var scene = scenes[gameMan.scene];
			if (gameMan.scene == "menus") {
				var x = (inputMan.x - scene.x) / scene.scale - (scene.width - displayMan.screenWidth)/2;
				var y = (inputMan.y - scene.y) / scene.scale - (scene.height - displayMan.screenHeight)/2;
				if (gameMan.menu == "title") {
					x -= 128;	// offset to coordinates of buttons
					y -= 330;
					if (x > 0 && x < 400 && y > 0 && y < displayMan.activeHeight*5) {
						menus["title"] = Math.floor(y / displayMan.activeHeight);
					}
				}
				else if (gameMan.menu == "option") {
					x += 40;	// offset to coordinates of image
					if (x > 0 && x < 1484 && y > 384 && y < 508) {
						audioMan.music = Math.round(x / 148.4) / 10;
						sounds["music"].volume = Math.pow(audioMan.music, 2);
					}
					if (x > 0 && x < 1484 && y > 648 && y < 772) {
						audioMan.sound = Math.round(x / 148.4) / 10;
					}
				}
			}
			else if (gameMan.scene == "board" && gameMan.winner < 0) {
				getRowCol(scene);
				var dX = inputMan.x - inputMan.pX;
				var dY = inputMan.y - inputMan.pY;
				if (gameMan.scene == "board" && gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
					dX /= scene.scale;
					dY /= scene.scale;
					if (Math.abs(dX) > displayMan.cellSize/2 || Math.abs(dY) > displayMan.cellSize/2) {	// inside cell is deadzone
						getRot(dX, dY, scene);
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
						event.preventDefault();
					}
					inputMan.pX = inputMan.x;
					inputMan.pY = inputMan.y;
				}
			}
		}
	}
}

function mouseUp(event) {
	if (isTouch(event, inputMan.touchID2)) {
		inputMan.touchID2 = inputMan.touchID = -1;	// end touches
	}
	if (isTouch(event, inputMan.touchID)) {
		hudMan.inputText += " up";
		if (inputMan.menu) {
			menuButton(menuMan.button);
		}
		else {
			var scene = scenes[gameMan.scene];
			var x = (inputMan.x - scene.x) / scene.scale;
			var y = (inputMan.y - scene.y) / scene.scale;
			if (gameMan.menu == "title") {
				x -= (scene.width - displayMan.screenWidth)/2 + 128;	// offset to coordinates of buttons
				y -= (scene.height - displayMan.screenHeight)/2 + 330;
				if (x > 0 && x < 400 && y > 0 && y < displayMan.activeHeight*5) {
					menuTitle(Math.floor(y / displayMan.activeHeight));
				}
			}
			else if (gameMan.menu == "option") {
				x -= (scene.width - displayMan.screenWidth)/2;	// offset to coordinates of image
				y -= (scene.height - displayMan.screenHeight)/2;
				if (x > 656 && x < 888 && y > 868 && y < 924) {
					gameMan.menu = "credit";
				}
			}
			else if (gameMan.scene == "rules") {
				if (y > (scene.height - displayMan.arrowHeight)/2 && y < (scene.height + displayMan.arrowHeight)/2) {
					if (x > scene.width - displayMan.arrowWidth*1.5 && gameMan.rules < rulePages-1) {
						gameMan.rules++;
						hudMan.pageText = "Rule " + gameMan.rules;
					}
					else if (x < displayMan.arrowWidth*1.5 && gameMan.rules > 0) {
						gameMan.rules--;
						hudMan.pageText = "Rule " + gameMan.rules;
					}
				}
			}
			else if (gameMan.tutorialStep >= 0 && (tutorialInputs[gameMan.tutorialStep] || gameMan.debug)) {	// tutorial
				if (x > displayMan.muralX && x < displayMan.muralX + displayMan.muralWidth
				&& y > displayMan.muralY && y < displayMan.muralY + displayMan.muralHeight) {
					nextTutorialStep();
				}
			}
			else if (gameMan.winner >= 0) {	// win screen
				if (x > displayMan.muralX && x < displayMan.muralX + displayMan.muralWidth
				&& y > displayMan.muralY && y < displayMan.muralY + displayMan.muralHeight) {
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
			else if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {	// TODO change order of this else if?
			}
			else if (gameMan.selection && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
				togglePhalanxPiece(inputMan.row, inputMan.col);
			}

			if (phalanx.length > 0 && grid[phalanx[0].row][phalanx[0].col].kind == 3) {
				phalanx.length = 0;
			}
		}

		clearRallyHighlights();
		inputMan.touchID2 = inputMan.touchID = -1;	// end touches
		gameMan.selection = false;	
		inputMan.menu = false;
		menuMan.button = 0;	// reset for key input
	}
}

function setTouch(event) {
	if (event.changedTouches && event.changedTouches.length > 0) {
		if (inputMan.touchID < 0) {
			inputMan.touchID = event.changedTouches[0].identifier;
			inputMan.x = event.changedTouches[0].pageX;
			inputMan.y = event.changedTouches[0].pageY;
			if (event.changedTouches[1] && inputMan.touchID2 < 0) {	// if second touch hits simultaneously
				pinch(event.changedTouches[1]);
				return false;
			}
			return true;
		}
		else if (inputMan.touchID2 < 0) {
			pinch(event.changedTouches[0]);
		}
	}
	else if (navigator.msPointerEnabled) {
		if (inputMan.touchID < 0) {
			inputMan.touchID = event.pointerId;
			inputMan.x = event.layerX;
			inputMan.y = event.layerY;
			return true;
		}
		else if (inputMan.touchID2 < 0) {
			if (gameMan.scene == "board") {
				phalanx.length = 0;
				revertGrid();
			}

			inputMan.touchID2 = event.pointerId;
			inputMan.x2 = event.layerX;
			inputMan.y2 = event.layerY;
			setPinchDistance(inputMan.x, inputMan.y, inputMan.x2, inputMan.y2);
		}
	}
	else {	// mouse
		if (gameMan.scene == "board" && !inputMan.menu) {	// TODO "!inputMan.menu" is workaround for AI
			revertGrid();	// prevent right click allowing rotate without using actions
		}
		inputMan.touchID = 0;	// set arbitrary ID greater than -1
		return true;
	}
	return false;
}

function isTouch(event, touchID) {
	if (navigator.msPointerEnabled) {
		return event.pointerId == touchID;
	}
	else if (event.changedTouches) {
		for (var i = event.changedTouches.length-1; i >= 0; --i) {
			if (event.changedTouches[i].identifier == touchID) {
				return true;
			}
		}
		return false;
	}
	return true;	// mouse, all clicks are valid
}

function pinch(changedTouch) {
	if (gameMan.scene == "board") {
		phalanx.length = 0;
		revertGrid();
	}

	inputMan.touchID2 = changedTouch.identifier;
	inputMan.x2 = changedTouch.pageX;
	inputMan.y2 = changedTouch.pageY;
	setPinchDistance(inputMan.x, inputMan.y, inputMan.x2, inputMan.y2);
}

function setPinchDistance(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	inputMan.pinchDistance = Math.sqrt(dx*dx + dy*dy); // TODO sqrt necessary?
}

function pinchZoom(x1, y1, x2, y2) {
	var distance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	var centerX = (x1 + x2) / 2;
	var centerY = (y1 +	y2) / 2;

	var scene = scenes[gameMan.scene];
	var dScale = (distance - inputMan.pinchDistance) / 500;
	var oldScale = scene.scale;

	inputMan.pinchDistance = distance;
	scene.scale = Math.max(scene.minScale, Math.min(scene.maxScale, scene.scale + dScale));	// TODO min/maxScales need to be set for menus
	scene.x = centerX - (centerX - scene.x) * scene.scale / oldScale;
	scene.y = centerY - (centerY - scene.y) * scene.scale / oldScale;

	pan(0,0);
}

function getXY(event) {
	if (navigator.msPointerEnabled) {
		if (event.pointerId == inputMan.touchID) {
			inputMan.x = event.layerX;
			inputMan.y = event.layerY;
		}

		if (event.pointerId == inputMan.touchID2) {
			inputMan.x2 = event.layerX;
			inputMan.y2 = event.layerY;
		}
	}
	else if (event.touches) {
		for (var i = event.touches.length-1; i >= 0; --i) {
			var touch = event.touches[i];
			if (touch.identifier == inputMan.touchID) {
				inputMan.x = touch.pageX;
				inputMan.y = touch.pageY;
			}
			else if (touch.identifier == inputMan.touchID2) {
				inputMan.x2 = touch.pageX;
				inputMan.y2 = touch.pageY;
			}
		}
	}
	else {	// mouse
		inputMan.x = event.layerX;
		inputMan.y = event.layerY;
	}

	var width = gpCanvas.width, height = gpCanvas.height;
	if (inputMan.x < width && inputMan.x > width - menuMan.width
	&& inputMan.y < height && inputMan.y > height - menuMan.height) {	// check menu
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				if (inputMan.x > width - menuMan.bWidth * (col+1) && inputMan.y > height - menuMan.bHeight * (row+1)) {
					menuMan.button = row * menuMan.cols + col;
					if (menuMan.button < buttons.length) {
						hudMan.inputText = buttons[menuMan.button];
					}
					return true;
				}
			}
		}
	}
	return false;
}

function getRowCol(scene) {
	inputMan.col = Math.floor((inputMan.x - scene.x) / (displayMan.cellSize * scene.scale));
	inputMan.row = Math.floor((inputMan.y - scene.y) / (displayMan.cellSize * scene.scale));
	inputMan.rot = -1;
	hudMan.inputText = inputMan.row + "," + inputMan.col;
}

function getRot(dX, dY) {
	if (grid[gameMan.pRow][gameMan.pCol].kind != 3) {	// not for routed pieces
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

		inputMan.row = gameMan.pRow;
		inputMan.col = gameMan.pCol;
		var radius = displayMan.cellSize * displayMan.cellSize * 3;
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

function keyDown(event) {
	var dX = 8;

	switch (event.keyCode) {
	case 13:	// enter
	case 90:	// Z
		hudMan.inputText = "Enter";
		if (menuMan.show || gameMan.menu == "credit") {
			menuButton(menuMan.button);
		}
		else if (gameMan.menu == "title" && menus["title"] < 5) {
			menuTitle(menus["title"]);
		}
		else if (gameMan.menu == "option" && menus["option"] == 2) {
			gameMan.menu = "credit";
		}
		else if (!(gameMan.scene == "menus" && gameMan.menu == "option" && menus["option"] < 3)) {
			menuButton(0);
		}
		break;
	case 8: 	// backspace
	case 27:	// escape
	case 88:	// X
	case 227:	// rewind
		hudMan.inputText = "Back";
		if (menuMan.show) {
			menuMan.show = false;
			menuMan.button = 0;
		}
		else if (gameMan.menu == "option") {
			gameMan.menu = "title";
		}
		else if (gameMan.menu == "credit") {
			gameMan.menu = "option";
		}
		else if (gameMan.scene == "rules") {
			setScene("board");
			hudMan.pageText = "";
		}
		else if (gameMan.tutorialStep >= 0) {
			endTutorial();
		}
		break;
	case 65:	// A
	case 83:	// S
	case 179:	// pause
	case 228:	// forward
		hudMan.inputText = "Menu";
		menuMan.show = !menuMan.show;
		menuMan.button = 0;
		break;
	case 37:	// left
		if (!menuMan.show && gameMan.menu == "option") {
			if (menus["option"] == 0 && audioMan.music > 0) {
				audioMan.music -= 0.1;
				if (audioMan.music < 0) {
					audioMan.music = 0;
				}
				sounds["music"].volume = Math.pow(audioMan.music, 2);
			}
			else if (menus["option"] == 1 && audioMan.sound > 0) {
				audioMan.sound -= 0.1;
				if (audioMan.sound < 0) {
					audioMan.sound = 0;
				}
			}
		}
		else if (!keyPrev()) {
			pan(dX, 0);
		}
		break;
	case 38:	// up
		if (!menuMan.show && gameMan.menu == "option") {
			if (menus["option"] > 0) {
				menus["option"]--;
			}
		}
		else if (!keyPrev()) {
			pan(0, dX);
		}
		break;
	case 39:	// right
		if (!menuMan.show && gameMan.menu == "option") {
			if (menus["option"] == 0 && audioMan.music < 1) {
				audioMan.music += 0.1;
				if (audioMan.music > 1) {
					audioMan.music = 1;
				}
				sounds["music"].volume = Math.pow(audioMan.music, 2);
			}
			else if (menus["option"] == 1 && audioMan.sound < 1) {
				audioMan.sound += 0.1;
				if (audioMan.sound > 1) {
					audioMan.sound = 1;
				}
			}
		}
		else if (!keyNext()) {
			pan(-dX, 0);
		}
		break;
	case 40:	// down
		if (!menuMan.show && gameMan.menu == "option") {
			if (menus["option"] < 3) {
				menus["option"]++;
			}
		}
		else if (!keyNext()) {
			pan(0, -dX);
		}
		break;
	}

	// highlight menu button
	inputMan.menu = menuMan.show || gameMan.scene == "board" || gameMan.scene == "rules" || gameMan.menu == "credit" ||
		gameMan.menu == "title" && menus["title"] == 5 || gameMan.menu == "option" && menus["option"] == 3;
}

function keyPrev() {
	hudMan.inputText = "Prev";
	if (menuMan.show) {
		if (menuMan.button < buttons.length-1) {
			menuMan.button++;
		}
		return true;	// never pan when menu is showing
	}
	else if (gameMan.menu == "title" && menus["title"] > 0) {
		menus["title"]--;
		return true;
	}
	else if (gameMan.scene == "rules" && gameMan.rules > 0) {
		gameMan.rules--;
		hudMan.pageText = "Rule " + gameMan.rules;
		return true;
	}
	else if (gameMan.tutorialStep > 0) {
		prevTutorialPart();
		return true;
	}
	return false;
}

function keyNext() {
	hudMan.inputText = "Next";
	if (menuMan.show) {
		if (menuMan.button > 0) {
			menuMan.button--;
		}
		return true;	// never pan when menu is showing
	}
	else if (gameMan.menu == "title" && menus["title"] < 5) {
		menus["title"]++;
		return true;
	}
	else if (gameMan.scene == "rules" && gameMan.rules < rulePages-1) {
		gameMan.rules++;
		hudMan.pageText = "Rule " + gameMan.rules;
		return true;
	}
	else if (gameMan.tutorialStep >= 0) {
		nextTutorialStep();
		return true;
	}
	return false;
}
