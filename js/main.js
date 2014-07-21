"use strict";

function volumeCurve(input) {
	return Math.pow(input, 2);
}

function playSound(name) {
	if (mediaMan.play) {
		switch (name) {
		case "rotate":
			sounds["rally"].volume = volumeCurve(settingsMan.sound / 10);
			sounds["rally"].play();
			break;
		case "move":
			sounds["drop"].volume = volumeCurve(settingsMan.sound / 10);
			sounds["drop"].play();
			break;
		case "push":
			sounds["push"].volume = volumeCurve(settingsMan.sound / 10);
			sounds["push"].play();
			break;
		case "rout":
			sounds["move"].volume = volumeCurve(settingsMan.sound / 10);
			sounds["move"].play();
			break;
		case "rally":
			sounds["push"].volume = volumeCurve(settingsMan.sound / 10);
			sounds["push"].play();
			break;
		}
		hudMan.soundText = name;
		mediaMan.play = false;
	}
}

window.onload = init;
function init() {
	generateGrid(mainBoard);
	pushGameState();
	useAction(0);	// init debug text

	images = {}
	images["player0"] = document.getElementById("athens");
	images["player1"] = document.getElementById("sparta");
	images["player2"] = document.getElementById("mesene");
	images["player3"] = document.getElementById("thebes");
	images["shading"] = document.getElementById("shading");
	images["golden"] = document.getElementById("golden");
	images["silver"] = document.getElementById("silver");
	images["shadow"] = document.getElementById("shadow");
	images["board"] = document.getElementById("board");
	images["helmet1"] = document.getElementById("helmet1");
	images["helmet2"] = document.getElementById("helmet2");

	for (var i = 0; i < rulePages; ++i) {
		images["rule" + i] = document.getElementById("rule" + i);
	}

	sounds = {};
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
		window.addEventListener("MSPointerUp",   mouseUp);
	}
	else if ("ontouchstart" in window) {
		window.addEventListener("touchstart", mouseDown);
		window.addEventListener("touchmove",  mouseMove);
		window.addEventListener("touchend",   mouseUp);
	}
	else {
		canvas.addEventListener("mousedown",  mouseDown);
		canvas.addEventListener("mousemove",  mouseMove);
		window.addEventListener("mouseup",    mouseUp);
	}

	if (fullScreen) {
		window.addEventListener("resize", reSize);
	}
	else {
		menuMan.rows = 3;
	}

	reSize();

	menuMan.cols = Math.ceil((buttons.length-1) / menuMan.rows);
	menuMan.bWidth = cellSize*2;
	menuMan.bHeight = menuMan.rows == 1 ? cellSize*2 : cellSize;
	menuMan.width = menuMan.bWidth * menuMan.cols;
	menuMan.height = menuMan.bHeight * menuMan.rows;

	dialogMan.x = 393*mediaMan.retina;
	dialogMan.y = 312*mediaMan.retina;
	dialogMan.width = 300*mediaMan.retina;
	dialogMan.height = 96*mediaMan.retina;

	settingsMan.x = cellSize*4;
	settingsMan.y = cellSize*4;
	settingsMan.width = cellSize*13;
	settingsMan.height = cellSize*7;
	settingsMan.music = 10;
	settingsMan.sound = 10;

	var lineWidth = 36;
	for (var i = tutorialTexts.length-1; i >= 0; --i) {
		var lines = tutorialTexts[i];
		for (var j = 0; lines[j].length > lineWidth; ++j) {
			lines.push(lines[j].slice(lineWidth));
			lines[j] = lines[j].slice(0, lineWidth);
		}
	}

	draw();
	sounds["music"].play();
}

function reSize() {
	if (fullScreen) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;	// height-4 to remove scrollbars on some browsers

		if (canvas.height >= 1536) {
			mediaMan.retina = 2;
		}
		else {
			mediaMan.retina = 1;
		}

		if (maxScale == 0 && minScale == 0) {	// special case, fit to large screens
			maxScale = minScale = canvas.height / boardHeight;
		}
		else {
			if (canvas.width / (1024*mediaMan.retina) > maxScale) {
				maxScale = canvas.width / boardWidth;
			}
			else if (canvas.width / (1024*mediaMan.retina) > minScale) {
				minScale = canvas.width / boardWidth;
			}
		}
	}

	var scene = {};
	scene.width = boardWidth;
	scene.height = boardHeight;
	scene.maxScale = maxScale;
	scene.minScale = minScale;
	scenes[0] = scene;

	scene = {};
	scene.width = boardWidth;
	scene.height = boardHeight;
	scene.maxScale = maxScale;
	scene.minScale = minScale;
	scenes[1] = scene;

	scene = {};
	scene.width = ruleWidth;
	scene.height = ruleHeight;
	
	if (maxScale == minScale) {
		scene.maxScale = 1;
		scene.minScale = canvas.height / ruleHeight;
	}
	else if (canvas.width > ruleWidth) {
		scene.maxScale = canvas.width / ruleWidth;
		scene.minScale = 1;
	}
	else{
		scene.maxScale = 1;
		scene.minScale = canvas.width / ruleWidth;
	}
	scenes[2] = scene;

	setScene();
	context.font = mediaMan.retina*16 + "px sans-serif";
}

function setScene(sceneIndex) {
	if (sceneIndex >= 0) {
		gameMan.scene = sceneIndex;
	}

	var scene = scenes[gameMan.scene];
	scene.scale = scene.minScale;
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;

	mediaMan.zoom = 0;
	mediaMan.draw = true;
}

function zoom() {
	var scene = scenes[gameMan.scene];

	if (scene.scale == scene.minScale) {
		mediaMan.zoom = 1;
	}
	else {
		mediaMan.zoom = -1;
	}
	mediaMan.draw = true;
}

function zooming(dTime) {
	if (mediaMan.zoom != 0) {
		var scene = scenes[gameMan.scene];
		var speed = (scene.maxScale - scene.minScale)/200 * dTime;	// animation speed
		if (mediaMan.zoom > 0) {
			if (scene.scale + speed < scene.maxScale) {
				scene.scale += speed;
			}
			else {
				scene.scale = scene.maxScale;
				mediaMan.zoom = 0;
			}
		}
		else {
			if (scene.scale - speed > scene.minScale) {
				scene.scale -= speed;
			}
			else {
				scene.scale = scene.minScale;
				mediaMan.zoom = 0;
			}
		}
		scene.x = (canvas.width - scene.width)/2 - (inputMan.col * cellSize + cellSize/2) * (scene.scale-1);
		scene.y = (canvas.height - scene.height)/2 - (inputMan.row * cellSize + cellSize/2) * (scene.scale-1);
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
	if (mediaMan.draw) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var dTime = time - mediaMan.time;
		zooming(dTime);

		var scene = scenes[0];
		context.save();
		context.translate(scene.x, scene.y);
		context.scale(scene.scale, scene.scale);

		drawBoard(scene);
		setRings();
		drawPieces();
		drawHelmets();

		if (gameMan.tutorialStep >= 0) {
			drawDialog();
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
			drawRules(scene);
			context.restore();
		}

		drawMenu(dTime);
		mediaMan.draw = mediaMan.zoom != 0 || mediaMan.menu;
	}
	if (gameMan.debug) {
		drawHud(time);
	}
	mediaMan.time = time;
	window.requestAnimationFrame(draw);
}

function drawBoard(scene) {
	context.drawImage(images["board"], 0, 0, scene.width, scene.height);
}

function setRings() {
	for (var i = phalanx.length-1; i >= 0; --i) {
		grid[phalanx[i].row][phalanx[i].col].ring = 0;
	}

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
		else if (checkMove(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
			grid[inputMan.row][inputMan.col].ring = 1;
		}
	}
}

function drawPieces() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			var cell = grid[row][col];
			if (cell.player >= 0 || cell.ring >= 0) {
				context.save();
				context.translate(col * cellSize + cellSize/2, row * cellSize + cellSize/2);

				if (cell.player >= 0) {
					context.rotate(cell.rot * Math.PI/2);
					context.drawImage(images["player" + cell.player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);	// piece
					context.rotate(cell.rot * Math.PI/-2);	// rotate back
					context.drawImage(images["shading"], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);	// shading
				}

				if (cell.ring == 0) {
					context.drawImage(images["golden"], -cellSize/2, -cellSize/2, cellSize, cellSize);	// ring
				} else if (cell.ring == 1) {
					var rotation = cell.kind == 2 ? cell.city : inputMan.rot;
					context.rotate(rotation * Math.PI/2);
					context.drawImage(images["shadow"], -cellSize/2, -cellSize/2, cellSize, cellSize);	// ring
					context.rotate(rotation * Math.PI/-2);	// rotate back
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}

			if (cell.prompt == 0) {
				context.save();
				context.translate(col * cellSize + cellSize/2, row * cellSize + cellSize/2);
				context.drawImage(images["golden"], -cellSize/2, -cellSize/2, cellSize, cellSize);	// ring
				context.restore();
			} else if (cell.prompt == 1) {
				context.save();
				context.translate(col * cellSize + cellSize/2, row * cellSize + cellSize/2);
				context.drawImage(images["silver"], -cellSize/2, -cellSize/2, cellSize, cellSize);	// ring
				context.restore();
			}
		}
	}
}

function drawHelmets() {
	context.save();
	switch (gameMan.player) {
	case 0:
		context.translate(cellSize * 13.5, cellSize * 14);
		break;
	case 1:
		context.translate(cellSize, cellSize * 10.5);
		break;
	case 2:
		context.translate(cellSize * 7.5, cellSize);
		break;
	case 3:
		context.translate(cellSize * 20, cellSize * 4.5);
		break;
	}
	context.rotate(gameMan.player * Math.PI/2);
	context.drawImage(images["helmet" + gameMan.actions], -helmetSize/2, -helmetSize/2, helmetSize, helmetSize);
	context.restore();
}

function drawDialog() {
	if (gameMan.tutorialStep < tutorialTexts.length) {
		context.fillStyle = "#292526";
		context.fillRect(dialogMan.x, dialogMan.y, dialogMan.width, dialogMan.height);
		context.fillStyle = "#d1cbad";
		var lines = tutorialTexts[gameMan.tutorialStep];
		for (var i = lines.length-1; i >= 0; --i) {
			context.fillText(lines[i], dialogMan.x + 1, dialogMan.y - 3 + mediaMan.retina * (i+1) * 16);
		}
		if (tutorialInputs[gameMan.tutorialStep]) {
			context.fillText("Tap here to continue", dialogMan.x + 153*mediaMan.retina, dialogMan.y + dialogMan.height - 5);
		}
	}
}

function drawSettings() {
	var fontSize = 20;
	context.font = mediaMan.retina * fontSize + "px sans-serif";
	context.fillStyle = "white";
	context.clearRect(settingsMan.x, settingsMan.y, settingsMan.width, settingsMan.height);
	context.fillText("Settings", settingsMan.x + 4, settingsMan.y + mediaMan.retina * fontSize + 4);

	for(var row = 0; row < settingsButtons.length; row++) {
		var buttonRow = settingsButtons[row];
		drawSettingsButton(row, 0, settingsButtons[row][0], "white", "#073c50");
		for(var col = 1; col < buttonRow.length; col++) {
			drawSettingsButton(row, col, settingsButtons[row][col], "white", "#13485d");
		}
	}

	drawSettingsButton(0, 3, settingsMan.music, "white", "#073c50");
	drawSettingsButton(1, 3, settingsMan.sound, "white", "#073c50");
	drawSettingsButton(5, 4, "Close", "white", "#13485d");
}

function drawRules(scene) {
	if (rulePages > 0) {
		context.drawImage(images["rule" + gameMan.rules], 0, 0, scene.width, scene.height);
	}
}

function drawMenu(dTime) {
	var factor = 200;
	mediaMan.menu = false;	// whether menu is animating

	if (menuMan.show && (menuMan.width < menuMan.bWidth * menuMan.cols || menuMan.height < menuMan.bHeight * menuMan.rows)) {
		var speed = menuMan.bWidth * (menuMan.cols-1) / factor * dTime;
		if (menuMan.width + speed < menuMan.bWidth * menuMan.cols) {
			menuMan.width += speed;
			mediaMan.menu = true;
		}
		else {
			menuMan.width = menuMan.bWidth * menuMan.cols;
		}

		speed = menuMan.bHeight * (menuMan.rows-1) / factor * dTime;
		if (menuMan.height + speed < menuMan.bHeight * menuMan.rows) {
			menuMan.height += speed;
			mediaMan.menu = true;
		}
		else {
			menuMan.height = menuMan.bHeight * menuMan.rows;
		}
	}
	else if (!menuMan.show && (menuMan.width > menuMan.bWidth || menuMan.height > menuMan.bHeight)) {
		var speed = menuMan.bWidth * (menuMan.cols-1) / factor * dTime;
		if (menuMan.width - speed > menuMan.bWidth) {
			menuMan.width -= speed;
			mediaMan.menu = true;
		}
		else {
			menuMan.width = menuMan.bWidth;
		}

		speed = menuMan.bHeight * (menuMan.rows-1) / factor * dTime;
		if (menuMan.height - speed > menuMan.bHeight) {
			menuMan.height -= speed;
			mediaMan.menu = true;
		}
		else {
			menuMan.height = menuMan.bHeight;
		}
	}

	context.clearRect(canvas.width - menuMan.width, canvas.height - menuMan.height, menuMan.width, menuMan.height);

	if (menuMan.show && !mediaMan.menu) {
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				var button = row * menuMan.cols + col;
				if (button < buttons.length-1) {
					if (inputMan.menu && button == menuMan.button
					|| button == 1 && gameMan.scene == 1
					|| button == 2 && gameMan.tutorialStep >= 0
					|| button == 3 && gameMan.scene == 2
					|| button == 7 && gameMan.debug) {
						drawButton(row, col, buttons[button+1], "#13485d", "white");
					}
					else {
						drawButton(row, col, buttons[button+1], "white", "#13485d");
					}
				}
			}
		}
	}
	else if (inputMan.menu && menuMan.button == 0) {
		drawButton(0, 0, buttons[0], "#073c50", "white");
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

function drawSettingsButton(row, col, text, textColor, bgColor) {
	var padding = 4;
	if (bgColor) {
		context.fillStyle = bgColor;
		context.fillRect(settingsMan.x + menuMan.bWidth * (col+1) + padding, settingsMan.y + menuMan.bHeight * (row+1) + padding,
			menuMan.bWidth - padding*2, menuMan.bHeight - padding*2);
	}
	context.fillStyle = textColor;
	context.fillText(text, settingsMan.x + menuMan.bWidth * (col+1.2), settingsMan.y + menuMan.bHeight * (row+1.5)+6);
}

function drawHud(time) {
	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;
	hudMan.drawText = canvas.width + "x" + canvas.height + " " + scenes[gameMan.scene].scale + "x";
	hudMan.pieceText = (!gameMan.selection) ? "" : "SELECTION";
	context.fillStyle = "white";
	context.clearRect(0, 0, canvas.width, mediaMan.retina*22);
	context.fillText(hudMan.fpsText + "  |  " + hudMan.drawText + "  |  " + hudMan.gameText + "  |  "
	+ hudMan.inputText + "  |  " + hudMan.soundText + "  |  " + hudMan.pieceText, 120, mediaMan.retina*16);
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
