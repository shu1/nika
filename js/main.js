"use strict";

function playerAction(name) {
	if (audioMan.play) {
		switch (name) {
		case "rotate":
			sounds["rally"].volume = Math.pow(audioMan.sound / 10, 2);
			sounds["rally"].play();
			break;
		case "move":
			sounds["drop"].volume = Math.pow(audioMan.sound / 10, 2);
			sounds["drop"].play();
			break;
		case "push":
			sounds["push"].volume = Math.pow(audioMan.sound / 10, 2);
			sounds["push"].play();
			murals[gameMan.player].setAnim("push");
			if (gameMan.receiver >= 0) {
				murals[gameMan.receiver].setAnim("pushed");
				gameMan.receiver = -1;
			}
			break;
		case "rout":
			sounds["move"].volume = Math.pow(audioMan.sound / 10, 2);
			sounds["move"].play();
			murals[gameMan.player].setAnim("rout");
			if (gameMan.receiver >= 0) {
				murals[gameMan.receiver].setAnim("routed");
				gameMan.receiver = -1;
			}
			break;
		case "rally":
			sounds["push"].volume = Math.pow(audioMan.sound / 10, 2);
			sounds["push"].play();
			murals[gameMan.player].setAnim("rally");
			break;
		}
		hudMan.actionText = name;
		audioMan.play = false;
	}
}

function resetAnimations() {
	gameMan.receiver = -1;
	initAnimations();
}

function initAnimations() {
	for (var i = 0; i < 4; i++) {
		setIdleAnimation(i);
	}
}

function setIdleAnimation(player) {
	if (gameMan.tutorialStep >= 0 && player == 0) {
		if (tutorialInputs[gameMan.tutorialStep]) {
			murals[player].setAnim("idleActive");
		}
		else {
			murals[player].setAnim("idle");
		}
	}
	else {
		if (player == gameMan.player) {
			murals[player].setAnim("idleActive");
		} else {
			murals[player].setAnim("idle");
		}
	}
}

window.onload = init;
function init() {
	newGame();

	images["board"] = document.getElementById("board");
	images["player0"] = document.getElementById("athens");
	images["player1"] = document.getElementById("sparta");
	images["player2"] = document.getElementById("messene");
	images["player3"] = document.getElementById("thebes");
	images["sheen"] = document.getElementById("sheen");
	images["shadow"] = document.getElementById("shadow");
	images["gold"] = document.getElementById("gold");
	images["greenRing"] = document.getElementById("greenRing");
	images["greenComet"] = document.getElementById("greenComet");
	images["greenShadow"] = document.getElementById("greenShadow");
	images["board"] = document.getElementById("board");
	images["mural"] = document.getElementById("mural");
	images["helmet1"] = document.getElementById("helmet1");
	images["helmet2"] = document.getElementById("helmet2");

	for (var i = 0; i < rulePages; ++i) {
		images["rule" + i] = document.getElementById("rule" + i);
	}

	sounds["pick"] = document.getElementById("pick");
	sounds["drop"] = document.getElementById("drop");
	sounds["move"] = document.getElementById("move");
	sounds["push"] = document.getElementById("push");
	sounds["rout"] = document.getElementById("rout");
	sounds["rally"] = document.getElementById("rally");
	sounds["music"] = document.getElementById("music");

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	if (window.navigator.msPointerEnabled) {
		canvas.style.msTouchAction = "none";
		canvas.addEventListener("MSPointerDown", mouseDown);
		canvas.addEventListener("MSPointerMove", mouseMove);
		window.addEventListener("MSPointerUp", mouseUp);
	}
	else if ("ontouchstart" in window) {
		window.addEventListener("touchstart", mouseDown);
		window.addEventListener("touchmove", mouseMove);
		window.addEventListener("touchend", mouseUp);
	}
	else {
		canvas.addEventListener("mousedown", mouseDown);
		canvas.addEventListener("mousemove", mouseMove);
		window.addEventListener("mouseup", mouseUp);
	}

	if (screenType > 0) {
		window.addEventListener("resize", reSize);
	}
	else {
		menuMan.rows = 2;
	}

	var view_2d = new fo.view_2d(canvas);
	murals[0] = new spriter_animation("images/mural/", view_2d, muralWhite_data);
	murals[1] = new spriter_animation("images/mural/", view_2d, muralOrange_data);
	murals[2] = new spriter_animation("images/mural/", view_2d, muralBlue_data);
	murals[3] = new spriter_animation("images/mural/", view_2d, muralBlack_data);
	murals[0].onFinishAnimCallback(true, function() { setIdleAnimation(0) });
	murals[1].onFinishAnimCallback(true, function() { setIdleAnimation(1) });
	murals[2].onFinishAnimCallback(true, function() { setIdleAnimation(2) });
	murals[3].onFinishAnimCallback(true, function() { setIdleAnimation(3) });

	tick.frame = 0;
	tick.time = 0;
	tick.time_last = 0;
	tick.elapsed_time = 0;

	reSize();
	draw(0);
	sounds["music"].loop = true;
	sounds["music"].play();
}

function reSize() {
	if (screenType > 0) {	// fullscreen
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;	// height-4 to remove scrollbars on some browsers
	}

	var minScale = 1/2, maxScale = 2/3;	// defaults for browser and ipad
	if (screenType == 3) {	// large screen, no zoom
		maxScale = minScale = canvas.height / displayMan.boardHeight;
	}
	else if (canvas.width == 2048 && canvas.height == 1536) {	// ipad retina
		minScale = 1;
		maxScale = 4/3;
	}
	else if (screenType == 2) {	// tablets
		minScale = canvas.height / displayMan.boardHeight;
		maxScale = canvas.width / displayMan.boardWidth;
	}
	else if (canvas.width != 1024 || canvas.height != 768) {	// else if not ipad then it's a phone
		minScale = canvas.width / displayMan.boardWidth;
		maxScale = minScale * 5/3;
		if (maxScale > 0.9 && maxScale < 1.11) {
			maxScale = 1;
		}
		else if (maxScale > 1.4 && maxScale < 1.6) {
			maxScale = 1.5;
		}
	}

	displayMan.hudHeight = Math.floor(44 * minScale);
	displayMan.hudFont = Math.floor(32 * minScale);
	context.font = displayMan.hudFont + "px sans-serif";

	menuMan.cols = Math.ceil((buttons.length-1) / menuMan.rows);
	menuMan.bWidth = displayMan.cellSize * 2 * minScale;
	menuMan.bHeight = menuMan.rows == 1 ? menuMan.bWidth : menuMan.bWidth/2;
	menuMan.width = menuMan.bWidth * menuMan.cols;
	menuMan.height = menuMan.bHeight * menuMan.rows;

	murals[0].set_position(678, 794);
	murals[1].set_position(1148, 844);
	murals[2].set_position(848, 794);
	murals[3].set_position(1320, 844);

	var scene = {};
	scene.width = displayMan.boardWidth;
	scene.height = displayMan.boardHeight;
	scene.maxScale = maxScale;
	scene.minScale = minScale;
	scene.scale = minScale;
	scenes[0] = scene;

	scene = {};
	scene.width = displayMan.boardWidth;
	scene.height = displayMan.boardHeight;
	scene.maxScale = maxScale;
	scene.minScale = minScale;
	scene.scale = minScale;
	scenes[1] = scene;

	scene = {};
	scene.width = displayMan.ruleWidth;
	scene.height = displayMan.ruleHeight;
	if (maxScale == minScale) {
		scene.maxScale = 1;
		scene.minScale = canvas.height / displayMan.ruleHeight;
	}
	else if (canvas.width > displayMan.ruleWidth) {
		scene.maxScale = canvas.width / displayMan.ruleWidth;
		scene.minScale = 1;
	}
	else{
		scene.maxScale = 1;
		scene.minScale = canvas.width / displayMan.ruleWidth;
	}
	scene.scale = scene.minScale;
	scenes[2] = scene;

	setScene();
}

function setScene(sceneIndex) {
	if (sceneIndex >= 0) {
		gameMan.scene = sceneIndex;
	}

	var scene = scenes[gameMan.scene];
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;

	displayMan.zoom = 0;
}

function zoom() {
	var scene = scenes[gameMan.scene];

	if (scene.scale == scene.minScale) {
		displayMan.zoom = 1;
	}
	else {
		displayMan.zoom = -1;
	}
}

function zooming(dTime) {
	if (displayMan.zoom != 0) {
		var scene = scenes[gameMan.scene];
		var speed = (scene.maxScale - scene.minScale) * dTime/250;	// animation speed
		if (displayMan.zoom > 0) {
			if (scene.scale + speed < scene.maxScale) {
				scene.scale += speed;
			}
			else {
				scene.scale = scene.maxScale;
				displayMan.zoom = 0;
			}
		}
		else {
			if (scene.scale - speed > scene.minScale) {
				scene.scale -= speed;
			}
			else {
				scene.scale = scene.minScale;
				displayMan.zoom = 0;
			}
		}

		if (screenType == 2) {	// tablets should always zoom centered
			scene.x = (canvas.width - scene.width * scene.scale)/2;
			scene.y = (canvas.height - scene.height * scene.scale)/2;
		}
		else {
			scene.x = (canvas.width - scene.width * scene.minScale)/2 - (inputMan.col+0.5) * displayMan.cellSize * (scene.scale - scene.minScale);
			scene.y = (canvas.height - scene.height * scene.minScale)/2 - (inputMan.row+0.5) * displayMan.cellSize * (scene.scale - scene.minScale);
		}
		pan(0, 0);	// hack to fix if clicked outside board
	}
}

function pan(dX, dY) {
	var panned = false;
	var scene = scenes[gameMan.scene];

	if (scene.width * scene.scale >= canvas.width) {
		var width = canvas.width - scene.width * scene.scale;

		if (scene.x + dX < width) {
			scene.x = width;
		}
		else if (scene.x + dX > 0) {
			scene.x = 0;
		}
		else {
			scene.x += dX;
			panned = true;
		}
	}

	if (scene.height * scene.scale >= canvas.height) {
		var height = canvas.height - scene.height * scene.scale;

		if (scene.y + dY < height) {
			scene.y = height;
		}
		else if (scene.y + dY > 0) {
			scene.y = 0;
		}
		else {
			scene.y += dY;
			panned = true;
		}
	}

	return panned;
}

function draw(time) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	var dTime = time - displayMan.time;
	zooming(dTime);

	var scene = scenes[0];
	context.save();
	context.translate(scene.x, scene.y);
	context.scale(scene.scale, scene.scale);

	drawMural(time);
	drawBoard();
	setRings();
	drawPieces(time);
	drawHelmets(dTime);

	if (gameMan.tutorialStep >= 0 || gameMan.winner >= 0) {
		drawDialog(time);
	}

	context.restore();

	if (gameMan.scene == 1) {
		scene = scenes[1];
		context.save();
		context.translate(scene.x, scene.y);
		context.scale(scene.scale, scene.scale);
		drawSettings();
		context.restore();
	}
	else if (gameMan.scene == 2) {
		scene = scenes[2];
		context.save();
		context.translate(scene.x, scene.y);
		context.scale(scene.scale, scene.scale);
		drawRules();
		context.restore();
	}

	drawMenu(dTime);

	if (gameMan.debug) {
		drawHud(time);
	}
	displayMan.time = time;
	window.requestAnimationFrame(draw);
}

function drawMural(time) {
	context.drawImage(images["mural"], 628, 624);
	tick.frame++;
	tick.time = time;
	tick.elapsed_time = Math.min(time - tick.time_last, 50);
	murals[0].update(tick);
	murals[0].draw();
	if (gameMan.tutorialStep < 0) {
		murals[2].update(tick);
		murals[2].draw();
		murals[1].update(tick);
		murals[1].draw();
		murals[3].update(tick);
		murals[3].draw();
	}
	tick.time_last = time;
}

function drawBoard() {
	context.drawImage(images["board"], 0, 0);
}

function setRings() {
	for (var i = phalanx.length-1; i >= 0; --i) {
		grid[phalanx[i].row][phalanx[i].col].ring = 0;
	}
	clearRallyHighlights();

	if (inputMan.click) {
		if (phalanx.length > 1) {
			if (checkMovePhalanx(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
				var dRow = inputMan.row - gameMan.pRow;
				var dCol = inputMan.col - gameMan.pCol;

				for (var i = phalanx.length-1; i >= 0; --i) {
					grid[phalanx[i].row + dRow][phalanx[i].col + dCol].ring = 1;
				}
			}
		}
		else {
			if (checkMove(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
				grid[inputMan.row][inputMan.col].ring = 1;
			}
			if (phalanx.length > 0) {
				setRallyHighlights(phalanx[0].row, phalanx[0].col);
			}
		}
	}
}

function setRallyHighlights(pRow, pCol) {
	if (gameMan.tutorialStep < 0 && routedCell(pRow, pCol)) {
		for (var row = 0; row < 15; ++row) {
			for (var col = 0; col < 21; ++col) {
				if (emptyRallyCell(row, col, grid[pRow][pCol].player)) {
					grid[row][col].prompt = 2;
				}
			}
		}
	}
}

function clearRallyHighlights() {
	if (gameMan.tutorialStep < 0) {
		for (var row = 0; row < 15; ++row) {
			for (var col = 0; col < 21; ++col) {
				grid[row][col].prompt = -1;
			}
		}
	}
}

function drawPieces(time) {
	var theta = time/500 % (Math.PI*2);
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			var cell = grid[row][col];
			if (cell.player >= 0 || cell.ring >= 0 || cell.prompt >= 0) {
				context.save();
				context.translate(col * displayMan.cellSize + displayMan.cellSize/2, row * displayMan.cellSize + displayMan.cellSize/2);

				if (cell.player >= 0) {
					context.rotate(cell.rot * Math.PI/2);
					context.drawImage(images["player" + cell.player], -displayMan.pieceSize/2, -displayMan.pieceSize/2);
					context.rotate(cell.rot * Math.PI/-2);
					context.drawImage(images["sheen"], -displayMan.pieceSize/2, -displayMan.pieceSize/2);
				}

				if (cell.prompt == 0) {
					context.rotate(theta);
					context.drawImage(images["greenComet"], -displayMan.pieceSize/2, -displayMan.pieceSize/2);
					context.rotate(-theta);
				}
				else if (cell.prompt == 1) {
					context.rotate(theta);
					context.drawImage(images["greenRing"], -displayMan.cellSize/2, -displayMan.cellSize/2);
					context.rotate(-theta);
				}
				else if (cell.prompt == 2) {
					context.drawImage(images["greenShadow"], -displayMan.pieceSize/2, -displayMan.pieceSize/2);
				}

				if (cell.ring == 0) {
					context.rotate(theta);
					context.drawImage(images["gold"], -displayMan.cellSize/2, -displayMan.cellSize/2);
					context.rotate(-theta);
				}
				else if (cell.ring == 1) {
					var rotation = cell.kind == 2 ? cell.city : inputMan.rot;
					context.rotate(rotation * Math.PI/2);
					context.drawImage(images["shadow"], -displayMan.pieceSize/2, -displayMan.pieceSize/2);
					context.rotate(rotation * Math.PI/-2);
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}
		}
	}
}

function drawHelmets(dTime) {
	context.save();
	switch (gameMan.player) {
	case 0:
		context.translate(displayMan.cellSize * 13.5, displayMan.cellSize * 14);
		break;
	case 1:
		context.translate(displayMan.cellSize, displayMan.cellSize * 10.5);
		break;
	case 2:
		context.translate(displayMan.cellSize * 7.5, displayMan.cellSize);
		break;
	case 3:
		context.translate(displayMan.cellSize * 20, displayMan.cellSize * 4.5);
		break;
	}
	if (dTime) {
		displayMan.helmetTheta += dTime/400;
		if (displayMan.helmetScale == 1) {
			displayMan.helmetTheta = 0;	// reset alpha every zoom
		}
		if (displayMan.helmetScale > 0) {
			var scale = 1 + displayMan.helmetScale*7;
			context.scale(scale, scale);
			displayMan.helmetScale -= dTime/400;
			if (displayMan.helmetScale <= 0) {
				displayMan.helmetFlash = 1;
			}
		}
		if (displayMan.helmetFlash > 0) {
			displayMan.helmetFlash -= dTime/600;
			displayMan.helmetTheta += dTime/50;
		}
	}
	context.rotate(gameMan.player * Math.PI/2);
	context.globalAlpha = (Math.sin(displayMan.helmetTheta % (Math.PI*2))+1)/4 + 0.5;
	context.drawImage(images["helmet" + gameMan.actions], -128, -128);
	context.restore();
}

function drawDialog(time) {
	if (gameMan.tutorialStep >= 0 && gameMan.tutorialStep < tutorialTexts.length || gameMan.winner >= 0) {
		context.save();
		context.fillStyle = "#221E1F";
		var frame = 1;
//		context.fillRect(displayMan.dialogX, displayMan.dialogY - frame, -frame, displayMan.dialogHeight + frame*2);
		context.fillRect(displayMan.dialogX, displayMan.dialogY, displayMan.tutorialOffset, -frame);
		context.fillRect(displayMan.dialogX, displayMan.dialogY + displayMan.dialogHeight, displayMan.tutorialOffset, frame);
		context.fillRect(displayMan.dialogX + displayMan.tutorialOffset, displayMan.dialogY - frame,
			displayMan.dialogWidth - displayMan.tutorialOffset + frame, displayMan.dialogHeight + frame*2);
		context.fillStyle = "#BEB783";

		var lines;
		if (gameMan.winner >= 0) {
			lines = [getWinnerText(gameMan.winner)];
		}
		else {
			lines = tutorialTexts[gameMan.tutorialStep];
		}

		var spacing = 36, topPadding = 26, bottomPadding = 14, buttonOffset = 306, font = "px Georgia";
		if (lines.length > 4 && tutorialInputs[gameMan.tutorialStep]) {	// text too crowded
			context.font = (fontType ? 28 : 30) + font;
			spacing -= 4;
			topPadding -= 2;
			bottomPadding -= 2;
			buttonOffset += 18;
		}
		else {
			context.font = (fontType ? 30 : 32) + font;
		}

		for (var i = lines.length-1; i >= 0; --i) {
			context.fillText(lines[i], displayMan.dialogX + displayMan.tutorialOffset+8, displayMan.dialogY + topPadding + spacing * i);
		}
		if (tutorialInputs[gameMan.tutorialStep]) {
			context.globalAlpha = (Math.sin(time/250 % (Math.PI*2))+1)/4 + 0.5;
			context.fillText("Tap here to continue", displayMan.dialogX + displayMan.tutorialOffset + buttonOffset, displayMan.dialogY + displayMan.dialogHeight - bottomPadding);
		}
		context.restore();
	}
}

function drawSettings() {
	var fontSize = 20;
	context.font = fontSize + "px sans-serif";
	context.fillStyle = "white";
	context.clearRect(displayMan.settingsX, displayMan.settingsY, displayMan.settingsWidth, displayMan.settingsHeight);
	context.fillText("Settings", displayMan.settingsX + 4, displayMan.settingsY + fontSize + 4);

	for(var row = 0; row < settingsButtons.length; row++) {
		var buttonRow = settingsButtons[row];
		drawSettingsButton(row, 0, settingsButtons[row][0], "white", "#00384C");
		for(var col = 1; col < buttonRow.length; col++) {
			drawSettingsButton(row, col, settingsButtons[row][col], "white", "#004157");
		}
	}

	drawSettingsButton(0, 3, audioMan.music, "white", "#00384C");
	drawSettingsButton(1, 3, audioMan.sound, "white", "#00384C");
	drawSettingsButton(5, 4, "Close", "white", "#004157");
}

function drawSettingsButton(row, col, text, textColor, bgColor) {
	var padding = 4;
	if (bgColor) {
		context.fillStyle = bgColor;
		context.fillRect(displayMan.settingsX + menuMan.bWidth * (col+1) + padding, displayMan.settingsY + menuMan.bHeight * (row+1) + padding,
			menuMan.bWidth - padding*2, menuMan.bHeight - padding*2);
	}
	context.fillStyle = textColor;
	context.fillText(text, displayMan.settingsX + menuMan.bWidth * (col+1.2), displayMan.settingsY + menuMan.bHeight * (row+1.5)+6);
}

function drawRules() {
	if (rulePages > 0) {
		context.drawImage(images["rule" + gameMan.rules], 0, 0);
	}
}

function drawMenu(dTime) {
	var factor = 200;
	displayMan.menu = false;	// whether menu is animating

	if (menuMan.show && (menuMan.width < menuMan.bWidth * menuMan.cols || menuMan.height < menuMan.bHeight * menuMan.rows)) {
		var speed = menuMan.bWidth * (menuMan.cols-1) * dTime / factor;
		if (menuMan.width + speed < menuMan.bWidth * menuMan.cols) {
			menuMan.width += speed;
			displayMan.menu = true;
		}
		else {
			menuMan.width = menuMan.bWidth * menuMan.cols;
		}

		speed = menuMan.bHeight * (menuMan.rows-1) * dTime / factor;
		if (menuMan.height + speed < menuMan.bHeight * menuMan.rows) {
			menuMan.height += speed;
			displayMan.menu = true;
		}
		else {
			menuMan.height = menuMan.bHeight * menuMan.rows;
		}
	}
	else if (!menuMan.show && (menuMan.width > menuMan.bWidth || menuMan.height > menuMan.bHeight)) {
		var speed = menuMan.bWidth * (menuMan.cols-1) * dTime / factor;
		if (menuMan.width - speed > menuMan.bWidth) {
			menuMan.width -= speed;
			displayMan.menu = true;
		}
		else {
			menuMan.width = menuMan.bWidth;
		}

		speed = menuMan.bHeight * (menuMan.rows-1) * dTime / factor;
		if (menuMan.height - speed > menuMan.bHeight) {
			menuMan.height -= speed;
			displayMan.menu = true;
		}
		else {
			menuMan.height = menuMan.bHeight;
		}
	}

	context.clearRect(canvas.width - menuMan.width, canvas.height - menuMan.height, menuMan.width, menuMan.height);

	if (menuMan.show && !displayMan.menu) {
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				var button = row * menuMan.cols + col;
				if (button < buttons.length-1) {
					if (inputMan.menu && button == menuMan.button
					|| button == 1 && gameMan.debug
					|| button == 2 && gameMan.tutorialStep >= 0
					|| button == 3 && gameMan.scene == 2) {
						drawButton(row, col, buttons[button+1], "#004157", "white");
					}
					else {
						drawButton(row, col, buttons[button+1], "white", "#004157");
					}
				}
			}
		}
	}
	else if (inputMan.menu && menuMan.button == 0) {
		drawButton(0, 0, buttons[0], "#00384C", "white");
	}
	else {
		drawButton(0, 0, buttons[0], "white");
	}
}

function drawButton(row, col, text, textColor, bgColor) {
	var padding = 4;
	if (bgColor) {
		context.fillStyle = bgColor;
		context.fillRect(canvas.width - menuMan.bWidth * (col+1) + padding, canvas.height - menuMan.bHeight * (row+1) + padding,
			menuMan.bWidth - padding*2, menuMan.bHeight - padding*2);
	}
	context.fillStyle = textColor;
	context.fillText(text, canvas.width - menuMan.bWidth * (col+0.8), canvas.height - menuMan.bHeight * (row+0.5)+6);
}

function drawHud(time) {
	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;
	hudMan.drawText = canvas.width + "x" + canvas.height + " " + scenes[gameMan.scene].scale + "x";
	hudMan.pieceText = !gameMan.selection ? "" : "Phalanx selection";
	context.fillStyle = "white";
	context.clearRect(0, 0, canvas.width, displayMan.hudHeight);
	context.fillText(hudMan.fpsText + "  |  " + hudMan.drawText + "  |  " + hudMan.gameText + "  |  " + hudMan.inputText
	+ "  |  " + hudMan.pieceText + hudMan.actionText + hudMan.tutorialText, 120, displayMan.hudFont);
}

// browser compatibility
(function() {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());
