"use strict";

function mouseDown(event) {
	hudMan.inputText = "";

	var multiTouch = false;
	if (navigator.msPointerEnabled) {
		if (inputMan.touchID < 0) {
			inputMan.touchID = event.pointerId;
		}
		else if (inputMan.touchID2 < 0) {	// 2nd touch
			resetState();
			inputMan.touchID2 = event.pointerId;
			inputMan.x2 = event.layerX;
			inputMan.y2 = event.layerY;
			setPinchDistance();
			multiTouch = true;
		}
	}
	else if (event.changedTouches) {
		if (inputMan.touchID < 0) {
			inputMan.touchID = event.changedTouches[0].identifier;
			inputMan.x = event.changedTouches[0].pageX;
			inputMan.y = event.changedTouches[0].pageY;

			if (event.changedTouches[1] && inputMan.touchID2 < 0) {	// 2nd touch hit simultaneously
				setPinch(event.changedTouches[1]);
				multiTouch = true;
			}
		}
		else if (inputMan.touchID2 < 0) {
			setPinch(event.changedTouches[0]);
			multiTouch = true;
		}
	}
	else {	// mouse
		if (inputMan.touchID < 0) {
			inputMan.touchID = 1;
		} else {
			resetState();
		}
	}

	if (!multiTouch) {
		var handled = getXYDrag(event, true);
		if (!handled) {
			var scene = scenes[gameMan.scene];
			var x = (inputMan.x - scene.x) / scene.scale - (scene.width - drawMan.screenWidth)/2;
			var y = (inputMan.y - scene.y) / scene.scale - (scene.height - drawMan.screenHeight)/2;

			if (gameMan.menu == "title") {
				x -= 128;	// offset to coordinates of buttons
				y -= 330;
				if (x > 0 && x < 400 && y > 0 && y < drawMan.activeHeight*6) {
					menus["title"] = Math.floor(y / drawMan.activeHeight);
					handled = true;
				}
			}
			else if (gameMan.menu == "option") {
				x += 40 - 62;	// offset to x of volume line - button radius
				var radius = 93;	// bigger radius for fat fingers
				var musicX = 1484 * soundMan.music, soundX = 1484 * soundMan.sound;
				if (x > musicX - radius && x < musicX + radius && y > 446 - radius && y < 446 + radius) {
					inputMan.drag = "music";	// only drag if touch started on button
					handled = true;
				}
				else if (x > soundX - radius && x < soundX + radius && y > 710 - radius && y < 710 + radius) {
					inputMan.drag = "sound";
					handled = true;
				}
			}
			else if (gameMan.scene == "board" && gameMan.winner < 0 && !gameMan.thinking) {
				getRowCol(scene);
				getPiece(inputMan.row, inputMan.col);
				if (phalanx.length > 0) {
					setRallyHighlights(phalanx[0].row, phalanx[0].col);
				}

				if (gameMan.pRow >= 0 && gameMan.pCol >= 0 && !tutorialInputs[gameMan.tutorialStep]) {
					inputMan.pX = scene.x + (gameMan.pCol * drawMan.cellSize + drawMan.cellSize/2) * scene.scale;
					inputMan.pY = scene.y + (gameMan.pRow * drawMan.cellSize + drawMan.cellSize/2) * scene.scale;
					handled = true;
				}
				else {
					gameMan.selection = false;	// back to normal selection if you deselect pieces
					phalanx.length = 0;
				}
			}

			if (!handled) {	// prepare for pan
				inputMan.pX = inputMan.x;
				inputMan.pY = inputMan.y;
			}
		}
	}
	hudMan.inputText += " down";
}

function getXYDrag(event, down) {
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
	else if (event.changedTouches) {
		for (var i = event.changedTouches.length-1; i >= 0; --i) {
			var touch = event.changedTouches[i];
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

	var handled = inputMan.drag == "debug" || inputMan.drag == "button" || inputMan.drag == "popup" || gameMan.menu == "popup";

	if (inputMan.x < gpCanvas.width && inputMan.x > gpCanvas.width - menuMan.width
	&& inputMan.y < gpCanvas.height && inputMan.y > gpCanvas.height - menuMan.height) {	// debug menu
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				if (inputMan.x > gpCanvas.width - menuMan.bWidth * (col+1) && inputMan.y > gpCanvas.height - menuMan.bHeight * (row+1)) {
					menus["debug"] = row * menuMan.cols + col;
					if (menus["debug"] < buttons.length) {
						hudMan.inputText = buttons[menus["debug"]];
					}
					if (down) {
						inputMan.drag = "debug";
					}
					return down || handled;
				}
			}
		}
	} else {
		menus["debug"] = -1;
	}

	var x = inputMan.x - (gpCanvas.width - menuMan.pWidth)/2;	// offset to topleft of popup
	var y = inputMan.y - (gpCanvas.height - menuMan.pHeight)/2;
	if (gameMan.menu == "popup" && x > 0 && x < menuMan.pWidth && y > 0 && y < menuMan.pHeight) {	// popup
		menus["popup"] = Math.floor(y / (menuMan.pHeight/4));
		if (down) {
			inputMan.drag = "popup";
		}
		return down || handled;
	} else {
		menus["popup"] = -1;
	}

	if ((gameMan.scene == "rules" || gameMan.menu == "popup" || gameMan.menu == "setup" || gameMan.menu == "option" || gameMan.menu == "credit")
	&& inputMan.y > gpCanvas.height - menuMan.bHeight && inputMan.x < menuMan.bWidth) {	// close/back button
		menus["button"] = 0;
		if (down) {
			inputMan.drag = "button";
		}
		return down || handled;
	} else {
		menus["button"] = -1;
	}

	if (gameMan.scene == "board" && gameMan.menu != "popup"
	&& inputMan.y > gpCanvas.height - menuMan.bHeight && inputMan.x < menuMan.bWidth * 3) {	// board buttons
		menus["button"] = Math.floor(inputMan.x / menuMan.bWidth);
		if (down) {
			inputMan.drag = "button";
		}
		return down || handled;
	} else {
		menus["button"] = -1;
	}

	return handled;	// TODO figure out why the above returns are necessary
}

function getRowCol(scene) {
	inputMan.col = Math.floor((inputMan.x - scene.x) / (drawMan.cellSize * scene.scale));
	inputMan.row = Math.floor((inputMan.y - scene.y) / (drawMan.cellSize * scene.scale));
	inputMan.rot = -1;
	hudMan.inputText = inputMan.row + "," + inputMan.col;
}

function mouseMove(event) {
	if (inputMan.touchID >= 0) {
		var handled = getXYDrag(event);
		var scene = scenes[gameMan.scene];

		if (inputMan.touchID2 >= 0) {	// 2nd touch is down, so pinch
			var pDistance = inputMan.pDistance;
			setPinchDistance();

			var dScale = (inputMan.pDistance - pDistance) / drawMan.screenDistance;	// TODO check on this scaling algorithm
			var x = (inputMan.x + inputMan.x2) / 2;	// center of pinch
			var y = (inputMan.y + inputMan.y2) / 2;
			pinch(scene, dScale, x, y);
			handled = true;
		}
		else if (!handled && isTouch(event, inputMan.touchID)) {
			var preventPan = false;
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;
			var x = (inputMan.x - scene.x) / scene.scale - (scene.width - drawMan.screenWidth)/2;
			var y = (inputMan.y - scene.y) / scene.scale - (scene.height - drawMan.screenHeight)/2;

			if (gameMan.menu == "title") {
				x -= 128;	// offset to coordinates of buttons
				y -= 330;
				if (x > 0 && x < 400 && y > 0 && y < drawMan.activeHeight*6) {
					menus["title"] = Math.floor(y / drawMan.activeHeight);
					handled = true;
				}
			}
			else if (gameMan.menu == "option") {
				x += 40 - 62;	// offset to x of volume line - button radius
				if (inputMan.drag == "music") {
					soundMan.music = Math.max(0, Math.min(1, Math.round(x / 14.84) / 100));
					sounds["music"].volume = Math.pow(soundMan.music, 2);
					handled = true;
				}
				else if (inputMan.drag == "sound") {
					soundMan.sound = Math.max(0, Math.min(1, Math.round(x / 14.84) / 100));
					handled = true;
				}
			}
			else if (gameMan.scene == "board" && gameMan.winner < 0) {
				getRowCol(scene);
				if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
					dX /= scene.scale;
					dY /= scene.scale;
					if (Math.abs(dX) > drawMan.cellSize/2 || Math.abs(dY) > drawMan.cellSize/2) {	// inside cell is deadzone
						if (grid[gameMan.pRow][gameMan.pCol].kind != 3) {	// get rotation for non-routed pieces
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
							var radius = drawMan.cellSize * drawMan.cellSize * 4;
							if (dX*dX + dY*dY < radius) {
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
						rotatePiece(gameMan.pRow, gameMan.pCol, inputMan.rot);
					}
					else {
						resetRotation();
						inputMan.row = gameMan.pRow;
						inputMan.col = gameMan.pCol;
					}
					handled = true;
					preventPan = true;
				}
			}

			if (!handled && pan(dX, dY)) {	// if not handled then pan
				handled = true;
			}

			if (!preventPan) {
				inputMan.pX = inputMan.x;
				inputMan.pY = inputMan.y;
			}
		}

		if (handled) {
			event.preventDefault();
		}
	}
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
	else {
		return touchID == 1;
	}
}

function mouseUp(event) {
	hudMan.inputText += " up";

	if (isTouch(event, inputMan.touchID2)) {
		inputMan.touchID2 = inputMan.touchID = -1;	// end touches
	}

	if (isTouch(event, inputMan.touchID)) {
		if (inputMan.drag == "debug") {
			menuDebug(menus["debug"]);
		}
		else if (inputMan.drag == "button") {
			menuButton(menus["button"]);
		}
		else if (inputMan.drag == "popup") {
			menuPopup(menus["popup"]);
		}
		else {
			var scene = scenes[gameMan.scene];
			var x = (inputMan.x - scene.x) / scene.scale;
			var y = (inputMan.y - scene.y) / scene.scale;

			if (gameMan.scene == "rules") {
				if (y > (scene.height - drawMan.arrowHeight)/2 && y < (scene.height + drawMan.arrowHeight)/2) {
					if (x > scene.width - drawMan.arrowWidth*1.5 && gameMan.rules < rulePages-1) {
						gameMan.rules++;
						hudMan.pageText = "Rule " + gameMan.rules;
					}
					else if (x < drawMan.arrowWidth*1.5 && gameMan.rules > 0) {
						gameMan.rules--;
						hudMan.pageText = "Rule " + gameMan.rules;
					}
				}
			}
			else if (gameMan.scene == "menus") {
				x -= (scene.width - drawMan.screenWidth)/2;	// offset to coordinates of image
				y -= (scene.height - drawMan.screenHeight)/2;

				if (gameMan.menu == "title") {
					x -= 128;	// offset to coordinates of buttons
					y -= 330;
					if (x > 0 && x < 400 && y > 0 && y < drawMan.activeHeight*6) {
						menuTitle(Math.floor(y / drawMan.activeHeight));
					}
				}
				else if (gameMan.menu == "setup") {
					if (y > 220 && y < 610) {
						if (x > 20 & x < 240) {
							menuSetup(0);
						}
						else if (x > 320 & x < 540) {
							menuSetup(2);
						}
						else if (x > 1000 & x < 1220) {
							menuSetup(1);
						}
						else if (x > 1280 & x < 1500) {
							menuSetup(3);
						}
					}
					else if (x > 480 && x < 1050 && y > 750 && y < 900) {
						menuSetup(4);
					}
				}
				else if (gameMan.menu == "option") {
					if (x > 656 && x < 888 && y > 868 && y < 924) {
						gameMan.menu = "credit";
					}
				}
			}
			else if (gameMan.scene == "board") {
				if (gameMan.tutorialStep >= 0 && (tutorialInputs[gameMan.tutorialStep] || gameMan.debug)) {	// tutorial
					if (x > drawMan.muralX && x < drawMan.muralX + drawMan.muralWidth
					&& y > drawMan.muralY && y < drawMan.muralY + drawMan.muralHeight) {
						nextTutorialStep();
					}
				}
				else if (gameMan.winner >= 0) {	// win screen
					if (x > drawMan.muralX && x < drawMan.muralX + drawMan.muralWidth
					&& y > drawMan.muralY && y < drawMan.muralY + drawMan.muralHeight) {
						localStorage.removeItem("nikaGameSave");
						setScene("menus");
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
				else {
					movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col);
				}

				if (phalanx.length > 0 && grid[phalanx[0].row][phalanx[0].col].kind == 3) {
					phalanx.length = 0;
				}

				revertState();
				clearRallyHighlights();	// TODO refactor highlights?
			}
		}

		gameMan.selection = false;
		inputMan.drag = "";
		menus["debug"] = 0;	// reset for key input
		menus["button"] = -1;
		inputMan.touchID2 = inputMan.touchID = -1;	// end touches
	}
}

function setPinch(changedTouch) {
	resetState();
	inputMan.touchID2 = changedTouch.identifier;
	inputMan.x2 = changedTouch.pageX;
	inputMan.y2 = changedTouch.pageY;
	setPinchDistance();
}

function setPinchDistance() {
	var dX = inputMan.x2 - inputMan.x;
	var dY = inputMan.y2 - inputMan.y;
	inputMan.pDistance = Math.sqrt(dX*dX + dY*dY);	// TODO sqrt necessary?
}

function pinch(scene, dScale, x, y) {
	var pScale = scene.scale;
	scene.scale = Math.max(scene.minScale, Math.min(scene.maxScale, scene.scale + dScale));

	if (screenType == 2) {	// zoom center of screen
		scene.x -= scene.width * (scene.scale - pScale) / 2;
		scene.y -= scene.height * (scene.scale - pScale) / 2;
	}
	else {	// zoom center of pinch
		scene.x = x - (x - scene.x) * scene.scale / pScale;
		scene.y = y - (y - scene.y) * scene.scale / pScale;
	}
	pan(0, 0);
}

function mouseWheel(event) {
	var scene = scenes[gameMan.scene];
	var dScale = -30*Math.sign(event.deltaY) / drawMan.screenDistance;
	pinch(scene, dScale, event.layerX, event.layerY);
	event.preventDefault();
}

function keyDown(event) {
	var dX = 8;

	switch (event.keyCode) {
	case 68:	// D
		gameMan.debug = !gameMan.debug;
		initAnimations();
		break;
	case 77:	// M
		debugMural();
		break;
	case 82:	// R
		replay();
		break;
	case 84:	// T
		replayPrev();
		break;
	case 89:	// Y
		replayNext();
		break;
	case 13:	// enter
	case 90:	// Z
		hudMan.inputText = "Enter";
		if (menuMan.show || gameMan.menu == "credit") {
			menuDebug(menus["debug"]);
		}
		else if (gameMan.menu == "title" && menus["title"] < 6) {
			menuTitle(menus["title"]);
		}
		else if (gameMan.menu == "option" && menus["option"] == 2) {
			gameMan.menu = "credit";
		}
		else if (!(gameMan.scene == "menus" && gameMan.menu == "option" && menus["option"] < 3)) {
			menuDebug(0);
		}
		break;
	case 8: 	// backspace
	case 27:	// escape
	case 88:	// X
	case 227:	// rewind
		hudMan.inputText = "Back";
		if (menuMan.show) {
			menuMan.show = false;
			menus["debug"] = 0;
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
		menus["debug"] = 0;
		break;
	case 37:	// left
		if (!menuMan.show && gameMan.menu == "option") {
			if (menus["option"] == 0 && soundMan.music > 0) {
				soundMan.music -= 0.1;
				if (soundMan.music < 0) {
					soundMan.music = 0;
				}
				sounds["music"].volume = Math.pow(soundMan.music, 2);
			}
			else if (menus["option"] == 1 && soundMan.sound > 0) {
				soundMan.sound -= 0.1;
				if (soundMan.sound < 0) {
					soundMan.sound = 0;
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
			if (menus["option"] == 0 && soundMan.music < 1) {
				soundMan.music += 0.1;
				if (soundMan.music > 1) {
					soundMan.music = 1;
				}
				sounds["music"].volume = Math.pow(soundMan.music, 2);
			}
			else if (menus["option"] == 1 && soundMan.sound < 1) {
				soundMan.sound += 0.1;
				if (soundMan.sound > 1) {
					soundMan.sound = 1;
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

	if (menuMan.show || gameMan.scene == "board" || gameMan.scene == "rules" || gameMan.menu == "credit"
	|| gameMan.menu == "title" && menus["title"] == 6 || gameMan.menu == "option" && menus["option"] == 3) {
		inputMan.drag = "debug";	// highlight menu button
	} else {
		inputMan.drag = "";
	}
}

function keyPrev() {
	hudMan.inputText = "Prev";
	if (menuMan.show) {
		if (menus["debug"] < buttons.length-1) {
			menus["debug"]++;
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
		if (menus["debug"] > 0) {
			menus["debug"]--;
		}
		return true;	// never pan when menu is showing
	}
	else if (gameMan.menu == "title" && menus["title"] < 6) {
		menus["title"]++;
		return true;
	}
	else if (gameMan.scene == "rules" && gameMan.rules < rulePages-1) {
		gameMan.rules++;
		hudMan.pageText = "Rule " + gameMan.rules;
		return true;
	}
	else if (gameMan.scene == "board" && gameMan.tutorialStep >= 0) {
		if (tutorialInputs[gameMan.tutorialStep]) {
			nextTutorialStep();
		}
		return true;
	}
	return false;
}
