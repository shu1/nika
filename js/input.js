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
		getXY(event);
		var handled = handleHud(true);
		if (!handled) {
			var scene = scenes[gameMan.scene];
			var x = (inputMan.x - scene.x) / scene.scale;
			var y = (inputMan.y - scene.y) / scene.scale;

			handled = handleScreen(scene, x, y);	// shared code with mouseMove

			if (gameMan.screen == "option") {
				x -= (scene.width - drawMan.screenWidth)/2 + 156;	// offset to near x of volume line
				y -= (scene.height - drawMan.screenHeight)/2;

				var radius = 96;	// bigger radius for fat fingers
				var musicX = 1210 * soundMan.music, soundX = 1210 * soundMan.sound;
				if (x > musicX - radius && x < musicX + radius && y > 446 - radius && y < 446 + radius) {
					inputMan.drag = "music";	// only drag if touch started on button
					handled = true;
				}
				else if (x > soundX - radius && x < soundX + radius && y > 710 - radius && y < 710 + radius) {
					inputMan.drag = "sound";
					handled = true;
				}
			}
			else if (gameMan.screen == "board" && gameMan.winner < 0 && !gameMan.ais[gameMan.player]) {
				getRowCol(scene);
				getPiece(inputMan.row, inputMan.col);
				if (phalanx.length > 0) {
					setRallyHighlights(phalanx[0].row, phalanx[0].col);
				}

				if (gameMan.pRow >= 0 && gameMan.pCol >= 0 && (gameMan.tutorialStep < 0 || !tutorials[gameMan.tutorialStep].input)) {
					inputMan.pX = scene.x + (gameMan.pCol * drawMan.cellSize + drawMan.cellSize/2) * scene.scale;
					inputMan.pY = scene.y + (gameMan.pRow * drawMan.cellSize + drawMan.cellSize/2) * scene.scale;
					handled = true;

					if (inPhalanx(gameMan.pRow, gameMan.pCol) && !routedCell(gameMan.pRow, gameMan.pCol)) {
						animMan["radiusFlag"] = 1;
					}
				} else {
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

function getXY(event) {
	if (navigator.msPointerEnabled) {
		if (event.pointerId == inputMan.touchID) {
			inputMan.x = event.layerX * drawMan.pixelRatio;
			inputMan.y = event.layerY * drawMan.pixelRatio;
		}

		if (event.pointerId == inputMan.touchID2) {
			inputMan.x2 = event.layerX * drawMan.pixelRatio;
			inputMan.y2 = event.layerY * drawMan.pixelRatio;
		}
	}
	else if (event.changedTouches) {
		for (var i = event.changedTouches.length-1; i >= 0; --i) {
			var touch = event.changedTouches[i];
			if (touch.identifier == inputMan.touchID) {
				inputMan.x = touch.pageX * drawMan.pixelRatio;
				inputMan.y = touch.pageY * drawMan.pixelRatio;
			}
			else if (touch.identifier == inputMan.touchID2) {
				inputMan.x2 = touch.pageX * drawMan.pixelRatio;
				inputMan.y2 = touch.pageY * drawMan.pixelRatio;
			}
		}
	}
	else {	// mouse
		inputMan.x = event.layerX * drawMan.pixelRatio;
		inputMan.y = event.layerY * drawMan.pixelRatio;
	}
}

function getRowCol(scene) {
	inputMan.col = Math.floor((inputMan.x - scene.x) / (drawMan.cellSize * scene.scale));
	inputMan.row = Math.floor((inputMan.y - scene.y) / (drawMan.cellSize * scene.scale));
	inputMan.rot = -1;
	hudMan.inputText = inputMan.row + "," + inputMan.col;
}

function handleHud(down) {
	var handled = inputMan.drag == "debug" || inputMan.drag == "button" || inputMan.drag == "popup" || gameMan.screen == "popup";
	var scene = scenes["hud"];

	// TODO refactor out to debug.js?
	if (gameMan.debugBuild && inputMan.x < gpCanvas.width && inputMan.x > gpCanvas.width - scene.debugWidth
	&& inputMan.y < gpCanvas.height && inputMan.y > gpCanvas.height - scene.debugHeight) {	// debug menu
		for (var row = 0; row < debugMan.rows; ++row) {
			for (var col = 0; col < debugMan.cols; ++col) {
				if (inputMan.x > gpCanvas.width - scene.buttonWidth * (col+1) && inputMan.y > gpCanvas.height - scene.buttonHeight * (row+1)) {
					menuMan["debug"] = row * debugMan.cols + col;
					if (menuMan["debug"] < debugTexts.length) {
						hudMan.inputText = debugTexts[menuMan["debug"]];
					}
					if (down) {
						inputMan.drag = "debug";
					}
					return down || handled;
				}
			}
		}
	} else {
		menuMan["debug"] = -1;
	}

	var x = inputMan.x - (gpCanvas.width - scene.popupWidth)/2;	// offset to topleft of popup
	var y = inputMan.y - (gpCanvas.height - scene.popupHeight)/2;
	if (gameMan.screen == "popup") {
		if (x > 0 && x < scene.popupWidth && y > 0 && y < scene.popupHeight) {
			var i = Math.floor(y / (scene.popupHeight/4));
			if (menuMan["popup"] != i || !animMan["activeAlpha"]) {	// newly clicking within popup
				menuMan["popup"] = i;
				animMan["activeAlpha"] = 0;
				animMan["activeFade"] = 1;
			}

			if (down) {
				inputMan.drag = "popup";
			}
			return down || handled;
		} else {
			animMan["activeFade"] = -1;
		}
	}

	if ((gameMan.screen != "board" && gameMan.screen != "title")
	&& inputMan.y > gpCanvas.height - scene.buttonHeight && inputMan.x < scene.buttonWidth) {	// close/back button
		menuMan["button"] = 0;
		if (down) {
			inputMan.drag = "button";
		}
		return down || handled;
	} else {
		menuMan["button"] = -1;
	}

	if (gameMan.screen == "board" && inputMan.y > gpCanvas.height - scene.buttonHeight && inputMan.x < scene.buttonWidth * 3) {	// board buttons
		menuMan["button"] = Math.floor(inputMan.x / scene.buttonWidth);
		if (down) {
			inputMan.drag = "button";
		}
		return down || handled;
	} else {
		menuMan["button"] = -1;
	}

	return handled;	// TODO figure out why the above returns are necessary
}

function handleScreen(scene, x, y) {
	if (gameMan.screen == "rules") {
		menuMan["rules"] = -1;
		if (y > (scene.height - drawMan.arrowHeight)/2 && y < (scene.height + drawMan.arrowHeight)/2) {
			if (x > scene.width - drawMan.arrowWidth*1.5 && gameMan.rules < rulePages-1) {
				menuMan["rules"] = 1;
				return true;
			}
			else if (x < drawMan.arrowWidth*1.5 && gameMan.rules > 0) {
				menuMan["rules"] = 0;
				return true;
			}
		}
	}
	else if (gameMan.screen == "title") {
		x -= (scene.width - drawMan.screenWidth)/2;
		y -= (scene.height - drawMan.screenHeight)/2 + 282;	// offset to top of menu
		if (x > 128 && x < 528 && y > 0 && y < drawMan.activeHeight*6) {
			var i = Math.floor(y / drawMan.activeHeight);
			if (menuMan["title"] != i) {
				menuMan["title"] = i;
				animMan["activeSlide"] = 1;
			}
			return true;
		}
	}

	return false;
}

function mouseMove(event) {
	if (inputMan.touchID >= 0) {
		getXY(event);
		var handled = false;
		var scene = scenes[gameMan.scene];

		if (inputMan.touchID2 >= 0) {	// 2nd touch is down, so pinch
			var pDistance = inputMan.pDistance;
			setPinchDistance();

			var dScale = 2 * (inputMan.pDistance - pDistance) / drawMan.screenDistance;	// TODO check on this scaling algorithm
			var x = (inputMan.x + inputMan.x2) / 2;	// center of pinch
			var y = (inputMan.y + inputMan.y2) / 2;
			pinch(scene, dScale, x, y);
			handled = true;
		}
		else if (isTouch(event, inputMan.touchID) && !(handled = handleHud())) {
			var preventPan = false;
			var dX = inputMan.x - inputMan.pX;
			var dY = inputMan.y - inputMan.pY;
			var x = (inputMan.x - scene.x) / scene.scale;
			var y = (inputMan.y - scene.y) / scene.scale;
			hudMan.inputText = Math.floor(x) + "," + Math.floor(y);

			handled = handleScreen(scene, x, y);	// shared code with mouseDown

			if (gameMan.screen == "option") {
				x -= (scene.width - drawMan.screenWidth)/2 + 156;	// offset to near x of volume line
				y -= (scene.height - drawMan.screenHeight)/2;

				if (inputMan.drag == "music") {
					soundMan.music = Math.max(0, Math.min(1, Math.round(x / 12.1) / 100));
					sounds["music"].volume = Math.pow(soundMan.music, 2);
					sounds["menu"].volume = Math.pow(soundMan.music, 2);
					handled = true;
				}
				else if (inputMan.drag == "sound") {
					soundMan.sound = Math.max(0, Math.min(1, Math.round(x / 12.1) / 100));
					handled = true;
				}
			}
			else if (gameMan.screen == "board" && gameMan.winner < 0) {
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

							var radius = drawMan.cellSize * drawMan.cellSize * 4;
							if (dX*dX + dY*dY < radius) {
								inputMan.row = gameMan.pRow;
								inputMan.col = gameMan.pCol;
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
			menuDebug(menuMan["debug"]);
		}
		else if (inputMan.drag == "button") {
			menuButton(menuMan["button"]);
		}
		else if (inputMan.drag == "popup") {
			var scene = scenes["hud"];
			var x = inputMan.x - (gpCanvas.width - scene.popupWidth)/2;	// offset to topleft of popup
			var y = inputMan.y - (gpCanvas.height - scene.popupHeight)/2;
			if (x > 0 && x < scene.popupWidth && y > 0 && y < scene.popupHeight) {
				menuPopup(menuMan["popup"]);
			}
		}
		else {
			var scene = scenes[gameMan.scene];
			var x = (inputMan.x - scene.x) / scene.scale;
			var y = (inputMan.y - scene.y) / scene.scale;

			if (gameMan.scene == "menus") {
				x -= (scene.width - drawMan.screenWidth)/2;	// offset to coordinates of image
				y -= (scene.height - drawMan.screenHeight)/2;

				if (gameMan.screen == "title") {
					y -= 282;
					if (x > 128 && x < 528 && y > 0 && y < drawMan.activeHeight*6) {
						menuTitle(menuMan["title"]);
					}
				}
				else if (gameMan.screen == "tutorial") {
					y -= 190;
					if (x > 285 && x < 1245 && y > 0 && y < 800) {
						menuTutorial(Math.floor(y / 200));
					}
				}
				else if (gameMan.screen == "setup") {
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
					else if (x > 810 && x < 1050 && y > 650 && y < 775) {
						menuSetup(4);
					}
					else if (x > 480 && x < 1050 && y > 785 && y < 900) {
						menuSetup(5);
					}
				}
			}
			else if (gameMan.screen == "rules") {
				menuRules(menuMan["rules"]);
				menuMan["rules"] = -1;
			}
			else if (gameMan.screen == "board") {
				var margin = 11;

				if (gameMan.winner >= 0) {
					if (x > drawMan.muralX && x < drawMan.muralX + drawMan.muralWidth
					&& y > drawMan.muralY && y < drawMan.muralY + drawMan.muralHeight) {
						localStorage.removeItem("NikaGameSave");
						fadeScreen("title");
						fadeMusic("menu");
					}
				}
				else if (gameMan.tutorialStep >= 0 && x > drawMan.tutorialPrevX && x < drawMan.tutorialPrevX + drawMan.tutorialButtonWidth
				&& y > drawMan.tutorialButtonY - margin && y < drawMan.tutorialButtonY + drawMan.tutorialButtonHeight + margin) {
					prevTutorialPart();
				}
				else if (gameMan.tutorialStep >= 0 && (tutorials[gameMan.tutorialStep].input || gameMan.debug)) {
					if (x > drawMan.tutorialNextX && x < drawMan.tutorialNextX + drawMan.tutorialButtonWidth
					&& y > drawMan.tutorialButtonY - margin && y < drawMan.tutorialButtonY + drawMan.tutorialButtonHeight + margin) {
						nextTutorialStep();
					}
					else {
						animMan["tutorialFlash"] = 1.5;
					}
				}
				else if (gameMan.pRow >= 0 && gameMan.pCol >= 0 && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol
				&& grid[gameMan.pRow][gameMan.pCol].rot == gameMan.pRot) {	// one-click selection
				 	if (!gameMan.selection) {
				 		phalanx.length = 0;
				 	}
				 	togglePhalanxPiece(gameMan.pRow, gameMan.pCol);
				}
				else if (!gameMan.ais[gameMan.player]) {
					if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
						animMan["pieceSlide"] = 1;
					}
				}

				if (animMan["radius"]) {
					animMan["radiusFlag"] = -1;	// TODO refactor and put this in elseif chain above?
				}

				if (gameMan.tutorialStep >= 0) {
					checkTutorialMove();
				}

				if (phalanx.length > 0 && grid[phalanx[0].row][phalanx[0].col].kind == 3) {
					phalanx.length = 0;
				}

				playerAction();
				revertState();
				clearRallyHighlights();	// TODO refactor highlights?
			}
		}

		gameMan.selection = false;
		inputMan.drag = "";
		menuMan["button"] = -1;
		inputMan.touchID2 = inputMan.touchID = -1;	// end touches
		event.preventDefault();	// prevent firing twice in environments with both touch and mouse
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

	if (screenType % 2) {	// zoom center of screen
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
	var dir = 0;
	if (event.deltaY > 0) {
		dir = 1;
	} else if (event.deltaY < 0) {
		dir = -1;
	}
	var dScale = -60 * dir / drawMan.screenDistance;
	pinch(scene, dScale, event.layerX, event.layerY);
	event.preventDefault();
}

function keyDown(event) {
	var dX = 8;

	if (gameMan.debugBuild) {
		switch (event.keyCode) {
		case 68:	// D
			hudMan.inputText = "Debug";
			gameMan.debug = !gameMan.debug;
			initAnimations();
			break;
		case 77:	// M
			hudMan.inputText = "Debug Mural";
			debugMural();
			break;
		case 82:	// R
			hudMan.inputText = "Replay";
			replay();
			break;
		case 84:	// T
			hudMan.inputText = "Replay Prev";
			replayPrev();
			break;
		case 89:	// Y
			hudMan.inputText = "Replay Next";
			replayNext();
			break;
		}
	}

	switch (event.keyCode) {
	case 83:	// S
	case 228:	// forward
		hudMan.inputText = "Zoom";
		if (gameMan.screen != "popup") {
			zoom();
		}
		break;
	case 65:	// A
	case 179:	// pause
		hudMan.inputText = "Menu";
		if (gameMan.scene == "board") {
			menuButton(0);
		}
		break;
	case 13:	// enter
	case 90:	// Z
		hudMan.inputText = "Enter";
		if (gameMan.screen == "popup" && menuMan["popup"] < 4) {
			menuPopup(menuMan["popup"]);
		}
		else if (gameMan.screen == "title" && menuMan["title"] < 6) {
			menuTitle(menuMan["title"]);
		}
		else if (gameMan.screen == "setup" && menuMan["setup"] < 6) {
			menuSetup(menuMan["setup"]);
		}
		else if (gameMan.screen == "tutorial" && menuMan["tutorial"] < 4) {
			menuTutorial(menuMan["tutorial"]);
		}
		break;
	case 27:	// escape
	case 88:	// X
	case 227:	// rewind
		hudMan.inputText = "Back";
		if (gameMan.tutorialStep >= 0) {
			endTutorial();
		}
		else if (gameMan.screen != "board") {
			menuButton(0);
		}
		break;
	case 37:	// left
		if (gameMan.screen == "option") {
			if (menuMan["option"] == 0 && soundMan.music > 0) {
				soundMan.music -= 0.1;
				if (soundMan.music < 0) {
					soundMan.music = 0;
				}
				sounds["music"].volume = Math.pow(soundMan.music, 2);
				sounds["menu"].volume = Math.pow(soundMan.music, 2);
			}
			else if (menuMan["option"] == 1 && soundMan.sound > 0) {
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
		if (gameMan.screen == "option") {
			if (menuMan["option"] > 0) {
				menuMan["option"]--;
			}
		}
		else if (!keyPrev()) {
			pan(0, dX);
		}
		break;
	case 39:	// right
		if (gameMan.screen == "option") {
			if (menuMan["option"] == 0 && soundMan.music < 1) {
				soundMan.music += 0.1;
				if (soundMan.music > 1) {
					soundMan.music = 1;
				}
				sounds["music"].volume = Math.pow(soundMan.music, 2);
				sounds["menu"].volume = Math.pow(soundMan.music, 2);
			}
			else if (menuMan["option"] == 1 && soundMan.sound < 1) {
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
		if (gameMan.screen == "option") {
			if (menuMan["option"] < 2) {
				menuMan["option"]++;
			}
		}
		else if (!keyNext()) {
			pan(0, -dX);
		}
		break;
	}
}

function keyPrev() {
	hudMan.inputText = "Prev";
	if (gameMan.screen == "popup" && menuMan["popup"] > 0) {
		menuMan["popup"]--;
		return true;
	}
	else if (gameMan.screen == "title" && menuMan["title"] > 0) {
		menuMan["title"]--;
		animMan["activeSlide"] = 1;
		return true;
	}
	else if (gameMan.screen == "tutorial" && menuMan["tutorial"] > 0) {
		menuMan["tutorial"]--;
		return true;
	}
	else if (gameMan.screen == "setup" && menuMan["setup"] > 0) {
		switch (menuMan["setup"]) {
		case 3:
		case 2:
			menuMan["setup"] -= 2;
			break;
		case 1:
			menuMan["setup"]++;
			break;
		default:
			menuMan["setup"]--;
		}
		return true;
	}
	else if (gameMan.screen == "rules" && gameMan.rules > 0) {
		var scene = scenes[gameMan.scene];
		if (scene.scale == scene.minScale) {	// allow panning if zoomed in
			menuRules(0);
			return true;
		}
	}
	else if (gameMan.tutorialStep > 0) {
		prevTutorialPart();
		return true;
	}
	return gameMan.screen == "popup";	// don't pan during popup
}

function keyNext() {
	hudMan.inputText = "Next";
	if (gameMan.screen == "popup" && menuMan["popup"] < 3) {
		menuMan["popup"]++;
		return true;
	}
	else if (gameMan.screen == "title" && menuMan["title"] < 5) {
		menuMan["title"]++;
		animMan["activeSlide"] = 1;
		return true;
	}
	else if (gameMan.screen == "tutorial" && menuMan["tutorial"] < 3) {
		menuMan["tutorial"]++;
		return true;
	}
	else if (gameMan.screen == "setup" && menuMan["setup"] < 4) {
		switch (menuMan["setup"]) {
		case 0:
		case 1:
			menuMan["setup"] += 2;
			break;
		case 2:
			menuMan["setup"]--;
			break;
		default:
			menuMan["setup"]++;
		}
		return true;
	}
	else if (gameMan.screen == "rules" && gameMan.rules < rulePages-1) {
		var scene = scenes[gameMan.scene];
		if (scene.scale == scene.minScale) {	// allow panning if zoomed in
			menuRules(1);
			return true;
		}
	}
	else if (gameMan.screen == "board" && gameMan.tutorialStep >= 0) {
		if (tutorials[gameMan.tutorialStep].input) {
			nextTutorialStep();
		}
		return true;
	}
	return gameMan.screen == "popup";	// don't pan during popup
}
