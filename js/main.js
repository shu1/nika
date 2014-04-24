"use strict";

function playSound(name) {
	if (mediaMan.play) {
		switch (name) {
		case "rotate":
			sounds[5].play();
			break;
		case "move":
			sounds[1].play();
			break;
		case "push":
			sounds[3].play();
			break;
		case "rout":
			sounds[2].play();
			break;
		case "rally":
			sounds[4].play();
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
	initTutorials();

	images = new Array(8);
	images[0] = document.getElementById("athens");
	images[1] = document.getElementById("sparta");
	images[2] = document.getElementById("mesene");
	images[3] = document.getElementById("thebes");
	images[4] = document.getElementById("shadow");
	images[5] = document.getElementById("golden");
	images[6] = document.getElementById("silver");
	images[7] = document.getElementById("board");

	for (var i = 0; i < rulePages; ++i) {
		images[8+i] = document.getElementById("rule" + i);
	}

	sounds = new Array(6);
	sounds[0] = document.getElementById("pick");
	sounds[1] = document.getElementById("drop");
	sounds[2] = document.getElementById("move");
	sounds[3] = document.getElementById("push");
	sounds[4] = document.getElementById("rout");
	sounds[5] = document.getElementById("raly");

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
	menuMan.cols = Math.ceil((buttons.length-1) / menuMan.rows);
	menuMan.bWidth = cellSize*2;
	menuMan.bHeight = menuMan.rows == 1 ? cellSize*2 : cellSize;
	menuMan.width = menuMan.bWidth * menuMan.cols;
	menuMan.height = menuMan.bHeight * menuMan.rows;

	dialogMan.x = cellSize*6;
	dialogMan.y = cellSize*6;
	dialogMan.width = cellSize*9;
	dialogMan.height = cellSize*3;

	reSize();
	draw();
}

function reSize() {
	if (fullScreen) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;	// height-5 to remove scrollbars on some browsers

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
	scenes[1] = scene;

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
		drawTurnUI();

		if (tutorialMan.step >= 0) {
			drawDialog();
		}

		context.restore();

		if (gameMan.scene == 1) {
			scene = scenes[1];
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
	context.drawImage(images[7], 0, 0, scene.width, scene.height);
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

function clearRings() {
	for (var row=0; row<15; ++row) {
		for (var col=0; col<21; ++col) {
			grid[row][col].ring = -1;
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
					context.drawImage(images[cell.player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);	// piece
					context.rotate(cell.rot * Math.PI/-2);	// rotate back
					context.drawImage(images[4], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);	// shadow
				}

				if (cell.ring >= 0) {
					context.drawImage(images[5 + cell.ring%2], -cellSize/2, -cellSize/2, cellSize, cellSize);	// ring
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}
		}
	}
}

//TODO: Temporary, will most likely be replaced by any central mural UI/animation
function drawTurnUI() {
	var x, y;
	switch (gameMan.player) {
	case 0:
		x = cellSize * 13.5;
		y = cellSize * 14;
		context.fillStyle   = "#D1CBAD";
		context.strokeStyle = "#84BBCB";
		break;
	case 1:
		x = cellSize;
		y = cellSize * 10.5;
		context.fillStyle   = "#C56828";
		context.strokeStyle = "#292526";
		break;
	case 2:
		x = cellSize *  7.5;
		y = cellSize;
		context.fillStyle   = "#84BBCB";
		context.strokeStyle = "#D1CBAD";
		break;
	case 3:
		x = cellSize * 20;
		y = cellSize *  4.5;
		context.fillStyle   = "#292526";
		context.strokeStyle = "#C56828";
		break;
	}
	context.lineWidth = 2;
	context.beginPath();
	context.arc(x, y, cellSize*0.85, (gameMan.player+1)*Math.PI/2, (gameMan.player+1+gameMan.actions*2)*Math.PI/2);
	context.closePath();
	context.fill();
	context.stroke();
	context.beginPath();
	context.arc(x, y, cellSize*0.7, (gameMan.player+1)*Math.PI/2, (gameMan.player+1+gameMan.actions*2)*Math.PI/2);
	context.stroke();
}

function drawDialog() {
	if (tutorialMan.step < tutorialTexts.length) {
		context.clearRect(dialogMan.x, dialogMan.y, dialogMan.width, dialogMan.height);
		var lines = tutorialTexts[tutorialMan.step];
		for (var i = 0; i < lines.length; ++i) {
			context.fillText(lines[i], dialogMan.x, dialogMan.y + mediaMan.retina*20*(i+1), dialogMan.width);
		}
	}
}

function drawRules(scene) {
	context.fillStyle = "rgba(255, 255, 255, 0.9)";
	context.fillRect(0, 0, scene.width, scene.height);
	context.drawImage(images[8 + gameMan.rules], 0, 0, scene.width, scene.height);
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
					if (inputMan.menu && button == menuMan.button || button == 1 && gameMan.debug || button == 3 && tutorialMan.step >= 0 || button == 4 && gameMan.scene == 1) {
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
	context.fillText(text, canvas.width - menuMan.bWidth * (col+0.75), canvas.height - menuMan.bHeight * (row+0.5)+6);
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
