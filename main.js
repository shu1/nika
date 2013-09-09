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
	generateGrid();
	pushGameState();
	useAction(0);	// init debug text

	images = new Array(8);
	images[0] = document.getElementById("athens");
	images[1] = document.getElementById("sparta");
	images[2] = document.getElementById("mesene");
	images[3] = document.getElementById("thebes");
	images[4] = document.getElementById("shadow");
	images[5] = document.getElementById("golden");
	images[6] = document.getElementById("silver");
	images[7] = document.getElementById("board");

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
		menuMan.rows = 2;
	}
	menuMan.cols = Math.ceil(buttons.length / menuMan.rows);
	menuMan.bWidth = cellSize*2;
	menuMan.bHeight = cellSize*2/menuMan.rows;
	menuMan.width = menuMan.bWidth * menuMan.cols;
	menuMan.height = menuMan.bHeight * menuMan.rows;

	reSize();
	draw();
}

function reSize() {
	if (fullScreen) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;	// reduce height to remove scrollbars on some browsers

		if (canvas.width / boardWidth > maxScale) {
			maxScale = canvas.width / boardWidth;
		}

/*		if (canvas.height / boardHeight > minScale) {
			minScale = canvas.height / boardHeight;
		}
*/	}
	context.font = "14px sans-serif";
	mediaMan.scale = minScale;
	mediaMan.x = (canvas.width - boardWidth * mediaMan.scale)/2;
	mediaMan.y = (canvas.height - boardHeight * mediaMan.scale)/2;
	mediaMan.draw = true;
}

function zoom() {
	if (mediaMan.scale == minScale) {
		mediaMan.zoom = 1;
	}
	else {
		mediaMan.zoom = -1;
	}
	mediaMan.draw = true;
}

function zooming(dTime) {
	if (mediaMan.zoom != 0) {
		var speed = (maxScale - minScale)/200 * dTime;	// animation speed
		if (mediaMan.zoom > 0) {
			if (mediaMan.scale + speed < maxScale) {
				mediaMan.scale += speed;
			}
			else {
				mediaMan.scale = maxScale;
				mediaMan.zoom = 0;
			}
		}
		else {
			if (mediaMan.scale - speed > minScale) {
				mediaMan.scale -= speed;
			}
			else {
				mediaMan.scale = minScale;
				mediaMan.zoom = 0;
			}
		}
		mediaMan.x = (canvas.width - boardWidth)/2 - (inputMan.col * cellSize + cellSize/2) * (mediaMan.scale-1);
		mediaMan.y = (canvas.height - boardHeight)/2 - (inputMan.row * cellSize + cellSize/2) * (mediaMan.scale-1);
		pan(0, 0);	// hack to fix if clicked outside board
	}
}

function pan(dX, dY) {
	var panned = false;

	if (boardWidth * mediaMan.scale >= canvas.width) {
		var width = canvas.width - boardWidth * mediaMan.scale;

		if (mediaMan.x + dX < width) {
			mediaMan.x = width;
		}
		else if (mediaMan.x + dX > 0) {
			mediaMan.x = 0;
		}
		else {
			mediaMan.x += dX;
			panned = true;
		}
	}

	if (boardHeight * mediaMan.scale >= canvas.height) {
		var height = canvas.height - boardHeight * mediaMan.scale;

		if (mediaMan.y + dY < height) {
			mediaMan.y = height;
		}
		else if (mediaMan.y + dY > 0) {
			mediaMan.y = 0;
		}
		else {
			mediaMan.y += dY;
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

		context.save();
		context.translate(mediaMan.x, mediaMan.y);
		context.scale(mediaMan.scale, mediaMan.scale);
		
		drawBoard();
		setRings();
		drawPieces();

		context.restore();
		drawMenu(dTime);
		mediaMan.draw = mediaMan.zoom != 0 || mediaMan.menu;
	}
	drawHud(time);
	mediaMan.time = time;
	window.requestAnimationFrame(draw);
}

function drawBoard() {
	context.drawImage(images[7], 0, 0, boardWidth, boardHeight);
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
					context.drawImage(images[cell.player], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);	// piece
					context.rotate(cell.rot * Math.PI/-2);	// rotate back
					context.drawImage(images[4], -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);	// shadow
				}

				if (cell.ring >= 0) {
					context.drawImage(images[5 + cell.ring], -cellSize/2, -cellSize/2, cellSize, cellSize);	// ring
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}
		}
	}
}

function drawMenu(dTime) {
	mediaMan.menu = false;
	var factor = 200;

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

	context.fillStyle = "#073c50";
	context.fillRect(canvas.width - menuMan.width, canvas.height - menuMan.height, menuMan.width, menuMan.height);

	if (menuMan.show && !mediaMan.menu) {
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				var button = row * menuMan.cols + col;
				if (button < buttons.length) {
					if (button == 1 && gameMan.debug) {
						drawButton(row, col, buttons[button], "black", "white");
					}
					else {
						drawButton(row, col, buttons[button], "white", "black");
					}
				}
			}
		}
	}
	else {
		drawButton(0, 0, "Menu", "white");
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
	context.fillText(text, canvas.width - menuMan.bWidth * (col+0.7), canvas.height - menuMan.bHeight * (row+0.5)+7);	
}

function drawHud(time) {
	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;
	hudMan.drawText = canvas.width + "x" + canvas.height + " " + mediaMan.scale + "x";
	hudMan.pieceText = (gameMan.mode == 0) ? "" : "SELECTION";
	context.fillStyle = "white";
	context.clearRect(0, 0, canvas.width, 20);
	context.fillText(hudMan.fpsText + "  |  " + hudMan.drawText + "  |  " + hudMan.gameText + "  |  "
	+ hudMan.inputText + "  |  " + hudMan.soundText + "  |  " + hudMan.pieceText, 120, 14);
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
