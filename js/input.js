"use strict";

function getXY(event) {
	if (event.touches) {
		inputMan.x = event.touches[0].pageX;
		inputMan.y = event.touches[0].pageY;
	}
	else {
		inputMan.x = event.layerX;
		inputMan.y = event.layerY;
		if (navigator.msPointerEnabled && isCurrentTouch(event)) {
			inputMan.currentX = event.layerX;
			inputMan.currentY = event.layerY;
		}
	}

	var width = gpCanvas.width, height = gpCanvas.height;
	if (inputMan.x < width && inputMan.x > width - menuMan.width
	&& inputMan.y < height && inputMan.y > height - menuMan.height) {	// check menu
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				if (inputMan.x > width - menuMan.bWidth * (col+1) && inputMan.y > height - menuMan.bHeight * (row+1)) {
					menuMan.button = row * menuMan.cols + col;
					if (menuMan.button < buttons.length-1) {
						hudMan.inputText = buttons[menuMan.button+1];
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

function mouseDown(event) {
	inputMan.menu = getXY(event);
	if (setTouch(event)) {
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
		inputMan.click = true;
	}
}

function mouseMove(event) {

	if (inputMan.secondTouchId > -1) {
		pinch(event);
	}
	else if (inputMan.click) {
		getXY(event);
		if (!inputMan.menu && gameMan.winner < 0 && isCurrentTouch(event)) {
			var scene = scenes[gameMan.scene];
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

function mouseUp(event) {
	if (isSecondTouch(event)) {
		endSecondTouch(event);
	}
	if (inputMan.click && isCurrentTouch(event)) {
		hudMan.inputText += " up";
		if (inputMan.menu) {
			menuButton(menuMan.button);
		}
		else {
			var scene = scenes[gameMan.scene];
			var x = (inputMan.x - scene.x) / scene.scale;
			var y = (inputMan.y - scene.y) / scene.scale;
			if (gameMan.scene == "rules") {
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
			else if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {	// TODO: change order of this else if?
			}
			else if (gameMan.selection && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
				togglePhalanxPiece(inputMan.row, inputMan.col);
			}

			if (phalanx.length > 0 && grid[phalanx[0].row][phalanx[0].col].kind == 3) {
				phalanx.length = 0;
			}
		}

		clearRallyHighlights();
		endCurrentTouch();
		menuMan.button = 0;	// reset for key input
		gameMan.selection = false;
		inputMan.menu = false;
		inputMan.click = false;
	}
}

function setTouch(event) {
	if (event.changedTouches && event.changedTouches.length > 0) {	// respect touch ID if touch API supported
		if (inputMan.currentTouchId == -1) {
			inputMan.currentTouchId = event.changedTouches[0].identifier;
			if (event.changedTouches[1] && inputMan.secondTouchId == -1) { // if second touch hits simultaneously
				inputMan.secondTouchId = event.changedTouches[1].identifier;
				var currentTouch = getCurrentTouch(event);
				var secondTouch = getSecondTouch(event);
				if (currentTouch && secondTouch) {
					var x1 = currentTouch.pageX;
					var y1 = currentTouch.pageY;
					var x2 = secondTouch.pageX;
					var y2 = secondTouch.pageY;
					inputMan.pinchDistance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
				}
				return false;
			}
			return true;
		}
		else if (inputMan.secondTouchId == -1) {
			inputMan.secondTouchId = event.changedTouches[0].identifier;
			var currentTouch = getCurrentTouch(event);
			var secondTouch = getSecondTouch(event);
			if (currentTouch && secondTouch) {
				phalanx = [];
				revertGrid();
				var x1 = currentTouch.pageX;
				var y1 = currentTouch.pageY;
				var x2 = secondTouch.pageX;
				var y2 = secondTouch.pageY;
				inputMan.pinchDistance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
			}
		}
	}
	else if (navigator.msPointerEnabled) {
		if (inputMan.currentTouchId == -1) {
			inputMan.currentTouchId = event.pointerId;
			inputMan.currentX = event.layerX;
			inputMan.currentY = event.layerY;
			return true;
		}
		else if (inputMan.secondTouchId == -1) {
			phalanx = [];
			revertGrid();
			inputMan.secondX = event.layerX;
			inputMan.secondY = event.layerY;
			inputMan.secondTouchId = event.pointerId;
			var x1 = inputMan.currentX;
			var y1 = inputMan.currentY;
			var x2 = inputMan.secondX;
			var y2 = inputMan.secondY;
			inputMan.pinchDistance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
		}
	}
	else {	// cancel all touches if touch API not supported
		if (!inputMan.menu) {
			revertGrid();
		}
		return true;
	}
	return false;
}

function getCurrentTouch(event) {
	for (var i = event.touches.length-1; i >= 0; --i) {
		if (event.touches[i].identifier == inputMan.currentTouchId) {
			return event.touches[i];
		}
	}
}

function getSecondTouch(event) {
	for (var i = event.touches.length-1; i >= 0; --i) {
		if (event.touches[i].identifier == inputMan.secondTouchId) {
			return event.touches[i];
		}
	}
}

function endCurrentTouch(event) {
	inputMan.currentTouchId = -1;
	inputMan.secondTouchId = -1;
}

function endSecondTouch(event) {
	inputMan.currentTouchId = -1;
	inputMan.secondTouchId = -1;
}

function isCurrentTouch(event) {
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

function isSecondTouch(event) {
	if (event.changedTouches) {	// if touch API supported
		for (var i = event.changedTouches.length-1; i >= 0; --i) {
			if (event.changedTouches[i].identifier == inputMan.secondTouchId) {
				return true;
			}
		}
		return false;
	}
	else if (navigator.msPointerEnabled) {
		return event.pointerId == inputMan.secondTouchId;
	}

	return true;	// all touches are deemed to "match" if touch API is not supported
}

function pinch(event) {
	if (event.changedTouches) {
		var currentTouch = getCurrentTouch(event);
		var secondTouch = getSecondTouch(event);
		if (currentTouch && secondTouch) {
			var x1 = currentTouch.pageX;
			var y1 = currentTouch.pageY;
			var x2 = secondTouch.pageX;
			var y2 = secondTouch.pageY;
			var distance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
			var centerX = (x1 + x2) / 2;
			var centerY = (y1 +	y2) / 2;
			pinchZoom(distance, centerX, centerY);
		}
	}
	else if (navigator.msPointerEnabled) {
		if (isCurrentTouch(event)) {
			inputMan.currentX = event.layerX;
			inputMan.currentY = event.layerY;
		}
		else if (isSecondTouch(event)) {
			inputMan.secondX = event.layerX;
			inputMan.secondY = event.layerY;
			var x1 = inputMan.currentX;
			var y1 = inputMan.currentY;
			var x2 = inputMan.secondX;
			var y2 = inputMan.secondY;
			var distance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
			var centerX = (x1 + x2) / 2;
			var centerY = (y1 +	y2) / 2;
			pinchZoom(distance, centerX, centerY);
		}
	}
}

function pinchZoom(distance, centerX, centerY) {
	if (centerX == undefined) {
		centerX = canvas.width / 2;
	}
	if (centerY == undefined) {
		centerY = canvas.height / 2;
	}

	var scene = scenes[gameMan.scene];
	var dScale = (distance - inputMan.pinchDistance) / 500;
	inputMan.pinchDistance = distance;
	var oldScale = scene.scale
	scene.scale = Math.max(scene.minScale, Math.min(scene.maxScale, scene.scale + dScale));

	scene.x = centerX - (centerX - scene.x) * scene.scale / oldScale;
	scene.y = centerY - (centerY - scene.y) * scene.scale / oldScale;

	pan(0,0);
}

function keyDown(event) {
	inputMan.menu = true;	// highlight current button even when mouse isn't down
	var dX = 8;

	switch (event.keyCode) {
	case 13:	// enter
	case 90:	// Z
		hudMan.inputText = "Enter";
		menuButton(menuMan.button);
		break;
	case 27:	// escape
	case 88:	// X
		hudMan.inputText = "Escape";
		if (gameMan.scene == "rules") {
			setScene("board");
			hudMan.pageText = "";
		}
		else if (gameMan.tutorialStep >= 0) {
			endTutorial();
		}
		else {
			menuMan.show = false;
			menuMan.button = 0;
		}
		break;
	case 37:	// left
		if (!keyPrev() && !menuMan.show) {
			pan(dX, 0);
		}
		break;
	case 38:	// up
		if (!keyPrev() && !menuMan.show) {
			pan(0, dX);
		}
		break;
	case 39:	// right
		if (!keyNext() && !menuMan.show) {
			pan(-dX, 0);
		}
		break;
	case 40:	// down
		if (!keyNext() && !menuMan.show) {
			pan(0, -dX);
		}
		break;
	}
}

function keyPrev() {
	hudMan.inputText = "Prev";
	if (gameMan.scene == "rules" && gameMan.rules > 0) {
		gameMan.rules--;
		hudMan.pageText = "Rule " + gameMan.rules;
		return true;
	}
	else if (gameMan.tutorialStep > 0) {
		prevTutorialPart();
		return true;
	}
	else if (menuMan.show && menuMan.button < buttons.length-2) {
		menuMan.button++;
		return true;
	}
	return false;
}

function keyNext() {
	hudMan.inputText = "Next";
	if (gameMan.scene == "rules" && gameMan.rules < rulePages-1) {
		gameMan.rules++;
		hudMan.pageText = "Rule " + gameMan.rules;
		return true;
	}
	else if (gameMan.tutorialStep >= 0) {
		nextTutorialPart();
		return true;
	}
	else if (menuMan.show && menuMan.button > 0) {
		menuMan.button--;
		return true;
	}
	return false;
}
