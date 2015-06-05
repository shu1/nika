"use strict";

window.onload = function() {
	try {
		var soundSave = JSON.parse(localStorage.getItem("nikaSoundSave"));
		if (soundSave) {
			soundMan = soundSave;
		}
	} catch (e) {
		console.log('Error: nikaSoundSave corrupt');
	}

	function loadImage(name, i) {
		i = i ? i : "";
		do {
			images[name + i] = document.createElement("img");
			images[name + i].src = "images/" + name + i + ".png";
			--i;	// exploit how decrementing an empty string becomes -1
		} while (i >= 0);
	}

	loadImage("menuTitle", 1);
	loadImage("menuTitleActive");
	loadImage("board", 1);
	loadImage("mural");
	loadImage("player", 3);
	loadImage("sheen");
	loadImage("shadow");
	loadImage("goldRing");
	loadImage("greenRing");
	loadImage("greenComet");
	loadImage("greenShadow");
	loadImage("helmet1");
	loadImage("helmet2");
	loadImage("buttonMenu");
	loadImage("buttonPass");
	loadImage("buttonUndo");
	loadImage("buttonBack");
	loadImage("buttonClose");
	loadImage("buttonActive");
	loadImage("menuPopup");
	loadImage("menuPopupActive");
	loadImage("menuSetup", 1);
	loadImage("menuSetupAI", 2);
	loadImage("menuOption", 1);
	loadImage("menuOptionSlider");
	loadImage("menuCredit", 1);
	loadImage("ruleArrow", 1);

	for (var i = 0; i < rulePages; ++i) {
		loadImage("rule" + i, 1);
	}

	function loadAudio(name, file, type) {
		type = type ? type : audioType;
		sounds[name] = document.createElement("audio");
		sounds[name].src = "audio/" + file + "." + type;
	}

	loadAudio("rotate",	"rally");
	loadAudio("move",	"drop");
	loadAudio("push",	"push");
	loadAudio("rout",	"move");
	loadAudio("rally",	"rout");
	loadAudio("music",	"nika2", "ogg");

	sounds["music"].volume = Math.pow(soundMan.music, 2);
	sounds["music"].loop = true;
	sounds["music"].play();

	gpCanvas = document.getElementById("canvas");
	muralCanvas = document.createElement("canvas");	// buffer
	muralCanvas.width = drawMan.muralWidth;
	muralCanvas.height = drawMan.muralHeight;
	var view_2d = new fo.view_2d(muralCanvas);

	murals[0] = new spriter_animation("images/mural/", view_2d, muralWhite_data);
	murals[1] = new spriter_animation("images/mural/", view_2d, muralOrange_data);
	murals[2] = new spriter_animation("images/mural/", view_2d, muralBlue_data);
	murals[3] = new spriter_animation("images/mural/", view_2d, muralBlack_data);

	murals[0].set_position( 50, 170);
	murals[1].set_position(520, 220);
	murals[2].set_position(220, 170);
	murals[3].set_position(692, 220);

	murals[0].onFinishAnimCallback(true, function() { setIdleAnimation(0) });
	murals[1].onFinishAnimCallback(true, function() { setIdleAnimation(1) });
	murals[2].onFinishAnimCallback(true, function() { setIdleAnimation(2) });
	murals[3].onFinishAnimCallback(true, function() { setIdleAnimation(3) });

	if (navigator.msPointerEnabled) {
		gpCanvas.addEventListener("MSPointerDown", mouseDown);
		gpCanvas.addEventListener("MSPointerMove", mouseMove);
		window.addEventListener("MSPointerUp", mouseUp);
	}
	else if ("ontouchstart" in window && !window.nwf) {	// NWF should use mouse events
		window.addEventListener("touchstart", mouseDown);
		window.addEventListener("touchmove", mouseMove);
		window.addEventListener("touchend", mouseUp);
	}
	else {
		gpCanvas.addEventListener("mousedown", mouseDown);
		gpCanvas.addEventListener("mousemove", mouseMove);
		window.addEventListener("mouseup", mouseUp);
	}
	window.addEventListener("mousewheel", mouseWheel);
	window.addEventListener("keydown", keyDown);

	if (screenType > 0) {
		window.addEventListener("resize", reSize);
	}

	menuMan.cols = 3;
	menuMan.rows = Math.ceil(buttons.length / menuMan.cols);

	menus["title"] = 0;
	menus["option"] = 0;
	gameMan.menu = "title";

	scenes["board"] = {};
	scenes["menus"] = scenes["rules"] = {};	// menus and rules have the same properties for now
	gameMan.scene = "menus";
	reSize();

	if (window.nwf) {
		var tvDisplay = nwf.display.DisplayManager.getInstance().getTVDisplay();

		tvDisplay.addEventListener("load", function() {
			var tvCanvas = tvDisplay.window.document.getElementById("canvas");
			tvCanvas.width = tvDisplay.width;
			tvCanvas.height = tvDisplay.height;

			scenes["tvboard"] = {};
			scenes["tvmenus"] = scenes["tvrules"] = {};
			var scale = tvCanvas.height / drawMan.boardHeight;
			initScenes(tvCanvas, scale, scale, "tv");

			draw(0);
		});

		tvDisplay.load("wiiutv.html");
	}
	else {
		draw(0);
	}
}

function reSize() {
	if (screenType > 0) {	// fullscreen
		gpCanvas.width = window.innerWidth;
		gpCanvas.height = window.innerHeight;	// height-4 to remove scrollbars on some browsers
	}
	drawMan.screenDistance = Math.sqrt(gpCanvas.width*gpCanvas.width + gpCanvas.height*gpCanvas.height);

	var minScale = 1/2, maxScale = 2/3;	// defaults for browser and ipad
	if (gpCanvas.width == 2048 && gpCanvas.height == 1536) {	// ipad retina
		minScale = 1;
		maxScale = 4/3;
	}
	else if (screenType == 2) {	// tablet or tv
		minScale = gpCanvas.height / drawMan.boardHeight;
		maxScale = gpCanvas.width / drawMan.boardWidth;
	}
	else if (gpCanvas.width != 1024 || gpCanvas.height != 768) {	// else if not ipad then it's a phone
		minScale = gpCanvas.width / drawMan.boardWidth;
		maxScale = minScale * drawMan.boardWidth / 1281;	// make maxScale = 2/3 on WiiU gamepad
		if (maxScale > 0.9 && maxScale < 1.1) {
			maxScale = 1;
		}
		else if (maxScale > 1.4 && maxScale < 1.6) {
			maxScale = 1.5;
		}
		else if (maxScale > 0.7 && maxScale < 0.8) {
			maxScale = 0.75;
		}
	}

	drawMan.hudHeight = Math.floor(44*minScale);
	drawMan.hudFont = Math.floor(32*minScale);
	gpCanvas.getContext("2d").font = drawMan.hudFont + "px sans-serif";

	menuMan.bWidth = drawMan.cellSize*2 * minScale;
	menuMan.bHeight = menuMan.bWidth/2;
	menuMan.bPadding = 8 * minScale;
	menuMan.width = menuMan.bWidth * menuMan.cols;
	menuMan.height = menuMan.bHeight * menuMan.rows;
	menuMan.pWidth = 1024 * minScale;
	menuMan.pHeight = 512 * minScale;

	initScenes(gpCanvas, maxScale, minScale);
	setScene();
}

function initScenes(canvas, maxScale, minScale, tv) {
	tv = tv ? tv : "";

	var scene = scenes[tv + "board"];
	scene.width = drawMan.boardWidth;
	scene.height = drawMan.boardHeight;
	scene.maxScale = maxScale;
	scene.minScale = minScale;
	scene.scale = minScale;
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;

	var ratio = canvas.width / canvas.height;
	scene = scenes[tv + "rules"];
	scene.height = (canvas.height <= 480) ? drawMan.screenHeight : (ratio >= 1.5) ? 1152 : 1536;
	scene.width = scene.height * ratio;
	scene.minScale = scene.scale = canvas.height / scene.height;
	scene.maxScale = Math.max(maxScale, scene.scale);
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;
}

function setScene(sceneIndex) {
	if (sceneIndex) {
		if (gameMan.scene == "rules") {
			hudMan.pageText = "";
		}

		gameMan.scene = sceneIndex;

		if (sceneIndex == "menus") {
			gameMan.menu = "title";
			menus["title"] = 1;
		} else {
			gameMan.menu = "";

			if (sceneIndex == "rules") {
				hudMan.pageText = "Rule " + gameMan.rules;
			}
		}
	}

	var scene = scenes[gameMan.scene];
	scene.x = (gpCanvas.width - scene.width * scene.scale)/2;
	scene.y = (gpCanvas.height - scene.height * scene.scale)/2;

	drawMan.zoom = 0;
	menuMan.show = false;
	menus["debug"] = 0;
}

function zoom() {
	var scene = scenes[gameMan.scene];
	if (scene.scale == scene.minScale) {
		drawMan.zoom = 1;
	} else {
		drawMan.zoom = -1;
	}
}

function zooming(dTime) {
	var scene = scenes[gameMan.scene];
	var speed = (scene.maxScale - scene.minScale) * dTime/250 * drawMan.zoom;	// set positive/negative

	if (drawMan.zoom > 0) {
		if (scene.scale + speed < scene.maxScale) {
			scene.scale += speed;
		} else {
			speed = scene.maxScale - scene.scale;	// move exactly the remainder of the animation
			scene.scale = scene.maxScale;
			drawMan.zoom = 0;
		}
	} else {
		if (scene.scale + speed > scene.minScale) {
			scene.scale += speed;
		} else {
			speed = scene.minScale - scene.scale;
			scene.scale = scene.minScale;
			drawMan.zoom = 0;
		}
	}

	scene.x -= scene.width * speed/2;
	scene.y -= scene.height * speed/2;
	pan(0, 0);	// prevent moving off screen

	if (Math.abs(scene.x) < 1) {
		scene.x = 0;
	}
	if (Math.abs(scene.y) < 1) {
		scene.y = 0;
	}
}

function pan(dX, dY) {
	var panned = false;
	var scene = scenes[gameMan.scene];
	var width = gpCanvas.width - scene.width * scene.scale;
	var height = gpCanvas.height - scene.height * scene.scale;

	if (width < 0) {
		if (scene.x + dX < width) {
			scene.x = width;
		}
		else if (scene.x + dX > 0) {
			scene.x = 0;
		}
		else if (dX) {
			scene.x += dX;
			panned = true;
		}
	}

	if (height < 0) {
		if (scene.y + dY < height) {
			scene.y = height;
		}
		else if (scene.y + dY > 0) {
			scene.y = 0;
		}
		else if (dY) {
			scene.y += dY;
			panned = true;
		}
	}

	if (panned) {
		hudMan.inputText = -scene.x + "," + -scene.y;
	}
	return panned;
}

function draw(time) {
	var dTime = time - drawMan.time;
	drawMan.time = time;

	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;

	if (gameMan.scene == "board" && gameMan.menu != "popup") {
		drawMural(muralCanvas.getContext("2d"), dTime);	// draw mural to buffer
	}

	drawContext(gpCanvas.getContext("2d"), dTime);	// draw main screen
	if (window.nwf) {
		drawContext(tvCanvas.getContext("2d"), dTime, "tv");	// draw tv
	}

	if (gameMan.scene == "board" && gameMan.tutorialStep < 0 && gameMan.ais[gameMan.player] && !gameMan.thinking && !gameMan.replaying) {
		gameMan.thinking = true;
		setTimeout(function() {
			if (gameMan.thinking) {
				ai();
				gameMan.thinking = false;
			}
		}, 1200);
	}

	window.requestAnimationFrame(draw);
}

function drawMural(context, dTime) {
	context.drawImage(images["mural"], 0, 0);

	var tick = {elapsed_time: dTime};
	murals[0].update(tick);
	murals[0].draw();
	if (gameMan.tutorialStep < 0 && gameMan.winner < 0) {
		murals[2].update(tick);
		murals[2].draw();
		murals[1].update(tick);
		murals[1].draw();
		murals[3].update(tick);
		murals[3].draw();
	}
	else {	// draw dialog
		context.fillStyle = "#221E1F";
		context.fillRect(drawMan.tutorialOffset, 0, drawMan.muralWidth - drawMan.tutorialOffset, drawMan.muralHeight);
		context.fillStyle = "#E0D9B3";

		var lines;
		if (gameMan.winner >= 0) {
			lines = [getWinnerText(gameMan.winner)];
		} else {
			lines = tutorialTexts[gameMan.tutorialStep];
		}

		var spacing = 36, topPadding = 26, bottomPadding = 14, nextX = 672, font = "px Georgia";
		if (lines.length > 4 && tutorialInputs[gameMan.tutorialStep]) {	// text too crowded
			context.font = (fontSize-2) + font;
			spacing -= 4;
			topPadding -= 2;
			bottomPadding -= 2;
			nextX += 4;
		} else {
			context.font = fontSize + font;
		}

		for (var i = lines.length-1; i >= 0; --i) {
			context.fillText(lines[i], drawMan.tutorialOffset+8, topPadding + spacing * i);
		}
		if (tutorialInputs[gameMan.tutorialStep]) {
			drawMan.tutorialTheta += dTime/250;
			if (drawMan.tutorialFlash > 0) {
				drawMan.tutorialFlash -= dTime/600;
				drawMan.tutorialTheta += dTime/30;
			}

			context.globalAlpha = (Math.sin(drawMan.tutorialTheta % (Math.PI*2))+1)/4 + 0.5;
			context.fillStyle = "white";
			context.fillText("Next", nextX, drawMan.muralHeight - bottomPadding);
			context.globalAlpha = 1;
		}
	}
}

function drawContext(context, dTime, tv) {
	tv = tv ? tv : "";

	var canvas = context.canvas;
	if (gameMan.scene == "rules") {
		context.fillStyle = "black";
		context.fillRect(0, 0, canvas.width, canvas.height);
	} else {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	if (drawMan.zoom) {
		zooming(dTime);
	}

	var scene = scenes[tv + gameMan.scene];
	context.save();
	context.translate(scene.x, scene.y);
	context.scale(scene.scale, scene.scale);

	var x = (scene.width - drawMan.screenWidth)/2;
	var y = (scene.height - drawMan.screenHeight)/2;
	switch (gameMan.scene) {
	case "board":
		context.drawImage(images["board0"], 0, 0);
		context.drawImage(images["board1"], 0, 960);
		if (gameMan.menu != "popup") {
			context.drawImage(muralCanvas, drawMan.muralX, drawMan.muralY);
		}
		setRings();
		drawPieces(context);
		if (gameMan.winner < 0) {
			drawHelmets(context, dTime);
		}
		break;
	case "rules":
		if (gameMan.rules < rulePages) {
			context.drawImage(images["rule" + gameMan.rules + "0"], x, y);
			context.drawImage(images["rule" + gameMan.rules + "1"], x+1024, y);
			drawRules(context, scene);
		}
		break;
	case "menus":
		switch (gameMan.menu) {
		case "title":
			context.drawImage(images["menuTitle0"], x, y);
			context.drawImage(images["menuTitle1"], x+512, y);
			if (menus["title"] < 6) {
				context.drawImage(images["menuTitleActive"], x+82, y+282 + drawMan.activeHeight*menus["title"]);
			}
			break;
		case "setup":
			context.drawImage(images["menuSetup0"], x, y);
			context.drawImage(images["menuSetup1"], x+512, y);
			context.drawImage(images["menuSetupAI" + gameMan.ais[0]], x+50, y+540);
			context.drawImage(images["menuSetupAI" + gameMan.ais[2]], x+340, y+540);
			context.drawImage(images["menuSetupAI" + gameMan.ais[1]], x+1020, y+540);
			context.drawImage(images["menuSetupAI" + gameMan.ais[3]], x+1310, y+540);
			break;
		case "option":
			context.drawImage(images["menuOption0"], x, y);
			context.drawImage(images["menuOption1"], x+512, y);
			context.drawImage(images["menuOptionSlider"], Math.floor(x-40 + 1484*soundMan.music), y+384);
			context.drawImage(images["menuOptionSlider"], Math.floor(x-40 + 1484*soundMan.sound), y+648);
			break;
		case "credit":
			context.drawImage(images["menuCredit0"], x, y);
			context.drawImage(images["menuCredit1"], x+512, y);
			break;
		}
		break;
	}

	context.restore();

	var x = (canvas.width - menuMan.pWidth)/2;
	var y = (canvas.height - menuMan.pHeight)/2;
	if (gameMan.menu == "popup") {
		context.fillStyle = "rgba(0,0,0,0.5)";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(images["menuPopup"], x, y, menuMan.pWidth, menuMan.pHeight);

		if (inputMan.drag == "popup" && menus["popup"] >= 0) {
			context.drawImage(images["menuPopupActive"], x, Math.floor(y + menuMan.pHeight/4 * menus["popup"]), menuMan.pWidth, Math.floor(menuMan.pHeight/4));
		}
	}

	y = canvas.height - menuMan.bHeight;
	if (gameMan.scene == "rules" || gameMan.menu == "popup") {
		context.drawImage(images["buttonClose"], 0, y, menuMan.bWidth, menuMan.bHeight);
	}
	else if (gameMan.menu == "setup" || gameMan.menu == "option" || gameMan.menu == "credit") {
		context.drawImage(images["buttonBack"], 0, y, menuMan.bWidth, menuMan.bHeight);
	}
	else if (gameMan.scene == "board") {
		context.drawImage(images["buttonMenu"], 0, y, menuMan.bWidth, menuMan.bHeight);
		context.drawImage(images["buttonPass"], menuMan.bWidth, y, menuMan.bWidth, menuMan.bHeight);
		context.drawImage(images["buttonUndo"], menuMan.bWidth*2, y, menuMan.bWidth, menuMan.bHeight);
	}

	if (inputMan.drag == "button" && menus["button"] >= 0) {
		context.drawImage(images["buttonActive"], menuMan.bWidth * menus["button"], y, menuMan.bWidth, menuMan.bHeight);
	}

	if (debugBuild) {
		drawMenu(context, dTime);

		if (gameMan.debug) {
			hudMan.drawText = canvas.width + "x" + canvas.height + " " + scenes[tv + gameMan.scene].scale + "x";
			context.fillStyle = "white";
			context.clearRect(0, 0, canvas.width, drawMan.hudHeight);
			context.fillText(hudMan.fpsText + "  |  " + hudMan.drawText + "  |  " + hudMan.inputText + "  |  " + hudMan.pageText, 138, drawMan.hudFont);
		}
	}
}

function setRings() {
	for (var i = phalanx.length-1; i >= 0; --i) {
		grid[phalanx[i].row][phalanx[i].col].ring = 0;
	}

	if (inputMan.touchID >= 0) {
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

function drawPieces(context) {
	if (inputMan.touchID >= 0 && gameMan.pRow >= 0 && gameMan.pCol >= 0 && inPhalanx(gameMan.pRow, gameMan.pCol)) {
		context.fillStyle = "rgba(191,191,191,0.5)";
		context.beginPath();
		context.arc(gameMan.pCol * drawMan.cellSize + drawMan.cellSize/2, gameMan.pRow * drawMan.cellSize + drawMan.cellSize/2,
			drawMan.cellSize * 2, 0, Math.PI*2);
		context.fill();
	}

	var pieceSize = 80;
	var theta = drawMan.time/500 % (Math.PI*2);
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			var cell = grid[row][col];
			if (cell.player >= 0 || cell.ring >= 0 || cell.prompt >= 0) {
				context.save();
				context.translate(col * drawMan.cellSize + drawMan.cellSize/2, row * drawMan.cellSize + drawMan.cellSize/2);

				if (cell.player >= 0) {
					context.rotate(cell.rot * Math.PI/2);
					context.drawImage(images["player" + cell.player], -pieceSize/2, -pieceSize/2);
					context.rotate(cell.rot * Math.PI/-2);
					context.drawImage(images["sheen"], -pieceSize/2, -pieceSize/2);
				}

				if (cell.prompt == 0) {
					context.rotate(theta);
					context.drawImage(images["greenComet"], -pieceSize/2, -pieceSize/2);
					context.rotate(-theta);
				}
				else if (cell.prompt == 1) {
					context.rotate(theta);
					context.drawImage(images["greenRing"], -drawMan.cellSize/2, -drawMan.cellSize/2);
					context.rotate(-theta);
				}
				else if (cell.prompt == 2) {
					context.drawImage(images["greenShadow"], -pieceSize/2, -pieceSize/2);
				}

				if (cell.ring == 0) {
					context.rotate(theta);
					context.drawImage(images["goldRing"], -drawMan.cellSize/2, -drawMan.cellSize/2);
					context.rotate(-theta);
				}
				else if (cell.ring == 1) {
					var rotation = (cell.kind == 2) ? cell.city : inputMan.rot;
					context.rotate(rotation * Math.PI/2);
					context.drawImage(images["shadow"], -pieceSize/2, -pieceSize/2);
					context.rotate(rotation * Math.PI/-2);
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}
		}
	}
}

function drawHelmets(context, dTime) {
	context.save();
	switch (gameMan.player) {
	case 0:
		context.translate(drawMan.cellSize * 13.5, drawMan.cellSize * 14);
		break;
	case 1:
		context.translate(drawMan.cellSize, drawMan.cellSize * 10.5);
		break;
	case 2:
		context.translate(drawMan.cellSize * 7.5, drawMan.cellSize);
		break;
	case 3:
		context.translate(drawMan.cellSize * 20, drawMan.cellSize * 4.5);
		break;
	}
	drawMan.helmetTheta += dTime/400;
	if (drawMan.helmetScale == 1) {
		drawMan.helmetTheta = 0;	// reset alpha every zoom
	}
	if (drawMan.helmetScale > 0) {
		var scale = 1 + drawMan.helmetScale*7;
		context.scale(scale, scale);
		drawMan.helmetScale -= dTime/400;
		if (drawMan.helmetScale <= 0) {
			drawMan.helmetFlash = 1;
		}
	}
	if (drawMan.helmetFlash > 0) {
		drawMan.helmetFlash -= dTime/600;
		drawMan.helmetTheta += dTime/50;
	}
	context.rotate(gameMan.player * Math.PI/2);
	context.globalAlpha = (Math.sin(drawMan.helmetTheta % (Math.PI*2))+1)/4 + 0.5;
	context.drawImage(images["helmet" + gameMan.actions], -128, -128);
	context.restore();
}

function drawRules(context, scene) {
	if (scene.height > 1024) {	// only draw border if screen isn't small
		var padding      = drawMan.arrowWidth/6;
		var borderX      = drawMan.arrowWidth*1.1;
		var borderWidth  =  scene.width  - borderX*2;
		var borderHeight = (scene.height + drawMan.screenHeight)/2;
		var borderY      = (scene.height - drawMan.screenHeight)/4;

		context.strokeStyle = "#E0D9B3";
		context.lineCap = "square";
		context.lineWidth = 8;
		context.strokeRect(borderX, borderY, borderWidth, borderHeight);
		context.lineWidth = 2;
		context.strokeRect(borderX + padding, borderY + padding, borderWidth - padding*2, borderHeight - padding*2);
	}

	var arrowY = (scene.height - drawMan.arrowHeight)/2;
	if (gameMan.rules > 0) {
		context.drawImage(images["ruleArrow0"], drawMan.arrowWidth/2, arrowY);
	}
	if (gameMan.rules < rulePages-1) {
		context.drawImage(images["ruleArrow1"], scene.width - drawMan.arrowWidth*1.5, arrowY);
	}
}

function drawMenu(context, dTime) {
	var duration = 1;	// no background to animate anymore
	drawMan.menu = false;	// whether menu is animating

	if (menuMan.show && (menuMan.width < menuMan.bWidth * menuMan.cols || menuMan.height < menuMan.bHeight * menuMan.rows)) {
		var speed = menuMan.bWidth * (menuMan.cols-1) * dTime / duration;
		if (menuMan.width + speed < menuMan.bWidth * menuMan.cols) {
			menuMan.width += speed;
			drawMan.menu = true;
		} else {
			menuMan.width = menuMan.bWidth * menuMan.cols;
		}

		speed = menuMan.bHeight * (menuMan.rows-1) * dTime / duration;
		if (menuMan.height + speed < menuMan.bHeight * menuMan.rows) {
			menuMan.height += speed;
			drawMan.menu = true;
		} else {
			menuMan.height = menuMan.bHeight * menuMan.rows;
		}
	}
	else if (!menuMan.show && (menuMan.width > menuMan.bWidth || menuMan.height > menuMan.bHeight)) {
		var speed = menuMan.bWidth * (menuMan.cols-1) * dTime / duration;
		if (menuMan.width - speed > menuMan.bWidth) {
			menuMan.width -= speed;
			drawMan.menu = true;
		} else {
			menuMan.width = menuMan.bWidth;
		}

		speed = menuMan.bHeight * (menuMan.rows-1) * dTime / duration;
		if (menuMan.height - speed > menuMan.bHeight) {
			menuMan.height -= speed;
			drawMan.menu = true;
		} else {
			menuMan.height = menuMan.bHeight;
		}
	}

	if (menuMan.show && !drawMan.menu) {
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				var button = row * menuMan.cols + col;
				if (button < buttons.length) {
					if (inputMan.drag == "debug" && button == menus["debug"]
					|| button == 1 && gameMan.debug) {
						drawButton(context, row, col, buttons[button], "black", "white");
					} else {
						drawButton(context, row, col, buttons[button], "white", "black");
					}
				}
			}
		}
	} else {
		if (inputMan.drag == "debug" && menus["debug"] == 0) {
			drawButton(context, 0, 0, buttons[1], "black", "white");
		} else {
			drawButton(context, 0, 0, buttons[1], "white", "black");
		}
	}
}

function drawButton(context, row, col, text, textColor, bgColor) {
	var canvas = context.canvas;
	if (bgColor) {
		context.fillStyle = bgColor;
		context.fillRect(canvas.width - menuMan.bWidth * (col+1) + menuMan.bPadding, canvas.height - menuMan.bHeight * (row+1) + menuMan.bPadding,
			menuMan.bWidth - menuMan.bPadding*2, menuMan.bHeight - menuMan.bPadding*2);
	}
	context.fillStyle = textColor;
	context.fillText(text, canvas.width - menuMan.bWidth * (col+0.8), canvas.height - menuMan.bHeight * (row+0.5)+6);
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

if (!window.nwf) {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');
	ga('create', 'UA-42200724-1', 'auto');
	ga('send', 'pageview');
}
