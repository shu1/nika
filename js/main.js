"use strict";

window.onload = function() {
	console.log(navigator.userAgent);
	gameMan.debugBuild = typeof debugMan != "undefined";	// HACK if debug.js is included

	try {
		var soundSave = JSON.parse(localStorage.getItem("NikaSoundSave"));
		if (soundSave) {
			soundMan = soundSave;
		}
	} catch (e) {
		console.warn("NikaSoundSave error");
	}

	function loadImage(name, i) {
		i = i ? i : "";
		do {
			images[name + i] = document.createElement("img");
			images[name + i].src = "images/" + name + i + ".png";
			--i;	// HACK exploit how decrementing an empty string becomes -1
		} while (i >= 0);
	}

	loadImage("menuTitle", 1);
	loadImage("menuTitleActive");
	loadImage("board", 1);
	loadImage("mural");
	loadImage("piece", 3);
	loadImage("pieceGlow");
	loadImage("pieceDark");
	loadImage("pieceShadow");
	loadImage("pieceGold");
	loadImage("pieceGreen");
	loadImage("pieceGreenComet");
	loadImage("pieceGreenShadow");
	loadImage("tileGoal");
	loadImage("helmet", 1);
	loadImage("buttonMenu");
	loadImage("buttonPass");
	loadImage("buttonUndo");
	loadImage("buttonBack");
	loadImage("buttonClose");
	loadImage("buttonActive");
	loadImage("tutorialButton", 2);
	loadImage("menuPopup");
	loadImage("menuSetup", 1);
	loadImage("menuSetupAI", 2);
	loadImage("menuSetupTimer", 3);
	loadImage("menuTutorial", 1);
	loadImage("menuOption", 1);
	loadImage("menuOptionSlider");
	loadImage("menuCredit", 1);
	loadImage("ruleArrow", 1);
	loadImage("ruleArrowActive", 1);

	for (var i = 0; i < rulePages; ++i) {	// TODO remove rulePages from html
		loadImage("rule" + i, 1);
	}

	function loadAudio(name, file, type) {
		type = type ? type : audioType;
		sounds[name] = document.createElement("audio");
		sounds[name].src = "audio/" + file + "." + type;
	}

	loadAudio("move",	"move");
	loadAudio("rotate",	"rotate");
	loadAudio("push",	"mural_push");
	loadAudio("rout",	"mural_rout");
	loadAudio("rally",	"mural_rally_alt");
	loadAudio("music",	"nika_main");
	loadAudio("menu",	"nika_menu");

	sounds["music"].volume = Math.pow(soundMan.music, 2);
	sounds["menu"].volume = Math.pow(soundMan.music, 2);
	sounds["music"].loop = true;
	sounds["menu"].loop = true;
	sounds["menu"].play();

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

	murals[0].onFinishAnimCallback(true, function(){setIdleAnimation(0)});
	murals[1].onFinishAnimCallback(true, function(){setIdleAnimation(1)});
	murals[2].onFinishAnimCallback(true, function(){setIdleAnimation(2)});
	murals[3].onFinishAnimCallback(true, function(){setIdleAnimation(3)});

	if (navigator.msPointerEnabled) {
		gpCanvas.addEventListener("MSPointerDown", mouseDown);
		gpCanvas.addEventListener("MSPointerMove", mouseMove);
		window.addEventListener("MSPointerUp", mouseUp);
	} else {
		gpCanvas.addEventListener("touchstart", mouseDown);
		gpCanvas.addEventListener("touchmove", mouseMove);
		window.addEventListener("touchend", mouseUp);

		gpCanvas.addEventListener("mousedown", mouseDown);
		gpCanvas.addEventListener("mousemove", mouseMove);
		window.addEventListener("mouseup", mouseUp);
	}
	gpCanvas.addEventListener("contextmenu", function(e){e.preventDefault()});
	window.addEventListener("wheel", mouseWheel);
	window.addEventListener("keydown", keyDown);
	window.addEventListener("resize", reSize);

	if (gameMan.debugBuild) {
		debugMan.cols = 3;
		debugMan.rows = Math.ceil(debugTexts.length / debugMan.cols);
	}

	scenes["board"] = {};
	scenes["rules"] = {};
	scenes["menus"] = {};
	scenes["hud"] = {};

	reSize();

	if (window.nwf) {
		var tvDisplay = nwf.display.DisplayManager.getInstance().getTVDisplay();

		tvDisplay.addEventListener("load", function() {
			tvCanvas = tvDisplay.window.document.getElementById("canvas");
			tvCanvas.width = tvDisplay.width;
			tvCanvas.height = tvDisplay.height;

			scenes["tvboard"] = {};
			scenes["tvrules"] = {};
			scenes["tvmenus"] = {};
			scenes["tvhud"] = {};
			var scale = tvCanvas.height / drawMan.boardHeight;
			initScenes(tvCanvas, scale, scale, "tv");

			update(0);
		});

		tvDisplay.load("wiiutv.html");
	} else {
		update(0);
	}
}

function reSize() {
	console.log("DevicePixelRatio: " + window.devicePixelRatio);
	if (screenType > 1) {	// windows platform
		drawMan.pixelRatio = window.devicePixelRatio;
	}

	gpCanvas.width = window.innerWidth * drawMan.pixelRatio;
	gpCanvas.height = window.innerHeight * drawMan.pixelRatio;
	drawMan.screenDistance = Math.sqrt(gpCanvas.width*gpCanvas.width + gpCanvas.height*gpCanvas.height);

	var minScale = 0.5, maxScale = 2/3;	// defaults for ipad, gamepad and small devices
	if (gpCanvas.width == 2048 && gpCanvas.height == 1536) {	// ipad retina
		minScale = 1;
		maxScale = 4/3;
	}
	else if (gpCanvas.width == 2732 && gpCanvas.height == 2048) {	// ipad 12?
		minScale = 4/3;
		maxScale = 16/9;
	}
	else if (screenType % 2) {	// if odd then tablet, pc or tv
		if (gpCanvas.width / gpCanvas.height >= 1.4) {	// landscape
			minScale = gpCanvas.height / drawMan.boardHeight;
			maxScale = gpCanvas.width / drawMan.boardWidth;
		} else {	// portrait
			minScale = gpCanvas.width / drawMan.boardWidth;
			maxScale = gpCanvas.height / drawMan.boardHeight;
		}
	}
	else if (gpCanvas.height > 480 && (gpCanvas.width != 1024 || gpCanvas.height != 768)) {	// phone
		minScale = gpCanvas.width / drawMan.boardWidth;
		maxScale = gpCanvas.width / 1280;

		if (minScale < 0.5) {
			minScale = 0.5;
		}

		if (maxScale >= 0.9 && maxScale < 1.12) {
			maxScale = 1;
		}
		else if (maxScale > 1.4 && maxScale <= 1.6) {
			maxScale = 1.5;
		}
		else if (maxScale >= 1.8 && maxScale < 2.23) {
			maxScale = 2;
		}
	}

	initScenes(gpCanvas, maxScale, minScale);
	setScreen();
}

function initScenes(canvas, maxScale, minScale, tv) {
	tv = tv ? tv : "";

	var scene = scenes[tv + "board"];
	scene.width = drawMan.boardWidth;
	scene.height = drawMan.boardHeight;
	scene.minScale = scene.scale = minScale;
	scene.maxScale = maxScale;
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;

	var ratio = canvas.width / canvas.height;
	scene = scenes[tv + "rules"];
	scene.height = (canvas.height <= 480) ? drawMan.screenHeight : (ratio < 1.5) ? 1536 : 1152;
	scene.width = scene.height * ratio;
	scene.minScale = scene.scale = canvas.height / scene.height;
	scene.maxScale = (maxScale > scene.minScale*1.1) ? maxScale : scene.minScale;	// if maxScale is close to minScale, make them the same
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;

	scene = scenes[tv + "menus"];
	scene.height = (canvas.height <= 480) ? drawMan.screenHeight : 1152;
	scene.width = scene.height * ratio;
	scene.scale = scene.minScale = scene.maxScale = canvas.height / scene.height;	// don't scale menus
	scene.x = (canvas.width - scene.width * scene.scale)/2;
	scene.y = (canvas.height - scene.height * scene.scale)/2;

	scene = scenes[tv + "hud"];
	scene.scale = minScale;	// TODO set context scale like other scenes?
	scene.popupWidth = 1024 * minScale;	// TODO choose better size for tv
	scene.popupHeight = 512 * minScale;
	scene.buttonWidth = drawMan.cellSize * minScale * 2;
	scene.buttonHeight = drawMan.cellSize * minScale;
	if (gameMan.debugBuild) {
		scene.buttonPadding = 8 * minScale;
		scene.debugWidth = scene.buttonWidth * debugMan.cols;
		scene.debugHeight = scene.buttonHeight * debugMan.rows;
	}
	scene.hudHeight = Math.floor(44*minScale);
	scene.hudFont = Math.floor(fontSize * minScale);
	canvas.getContext("2d").font = scene.hudFont + "px sans-serif";
}

function setScreen(index) {
	if (index) {
		gameMan.pScreen = gameMan.screen;
		gameMan.screen = index;
		gameMan.scene = getScene(gameMan.screen);
	}

	if (gameMan.screen == "title") {
		drawMan.slideY = drawMan.activeHeight * menuMan["title"];
		animMan["activeAlpha"] = 1;
	} else {
		animMan["activeAlpha"] = 0;
	}

	if (gameMan.screen == "rules") {
		drawMan.color = "black";
		hudMan.pageText = "Rule " + gameMan.rules;
	}
	else {
		drawMan.color = "#00384C";
		if (gameMan.pScreen == "rules") {
			hudMan.pageText = "";
		}
	}

	if (getScene(gameMan.screen) != getScene(gameMan.pScreen)) {	// only reset scene when switching scenes
		var scene = scenes[gameMan.scene];
		scene.x = (gpCanvas.width - scene.width * scene.scale)/2;
		scene.y = (gpCanvas.height - scene.height * scene.scale)/2;
	}

	function getScene(index) {
		switch (index) {
			case "rules":
				return index;
				break;
			case "board":
			case "popup":
				return "board";
				break;
			default:
				return "menus";
		}
	}
}

function fadeScreen(index) {
	gameMan.nScreen = index;
	animMan["screenFade"] = 1;

	if (gameMan.screen == "popup" && gameMan.nScreen == "board") {
		animMan["screenFade"] = -1;
		setScreen("board");
	}
}

function fadeMusic(nextMusic) {
	musicMan.next = nextMusic;
	musicMan.fading = true;
	sounds[nextMusic].volume = 0;
	sounds[nextMusic].currentTime = 0;
	sounds[nextMusic].play();
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

function zoom() {
	var scene = scenes[gameMan.scene];
	if (scene.scale == scene.minScale) {
		drawMan.zoom = 1;
	} else {
		drawMan.zoom = -1;
	}
}

function updateAnims(dTime) {
	if (drawMan.zoom) {
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

	if (animMan["screenFade"]) {
		animMan["screenAlpha"] += dTime/250 * animMan["screenFade"];	// set positive/negative

		if (gameMan.nScreen == "popup" && animMan["screenAlpha"] >= 0.5) {
			animMan["screenAlpha"] = 0.5;
			animMan["screenFade"] = 0;
			setScreen(gameMan.nScreen);
		}
		else if (animMan["screenAlpha"] >= 1) {
			animMan["screenAlpha"] = 1;
			animMan["screenFade"] = -1;
			setScreen(gameMan.nScreen);
		}
		else if (animMan["screenAlpha"] <= 0) {
			animMan["screenAlpha"] = 0;
			animMan["screenFade"] = 0;
		}
	}

	function active(index, time, flip) {
		if (animMan[index]) {
			animMan["activeAlpha"] += dTime / time * animMan[index];	// set positive/negative

			if (animMan["activeAlpha"] >= 1) {
				animMan["activeAlpha"] = 1;
				animMan[index] = 0;
			}
			else if (animMan["activeAlpha"] <= 0) {
				animMan["activeAlpha"] = 0;
				animMan[index] = flip;
			}
		}
	}
	active("activeFade", 250, 0);
	active("activeFlash", 100, 1);

	function slide(index) {
		var speed = dTime / 100 * animMan[index];

		if (animMan[index] > 0) {
			animMan[index] -= speed;
			if (animMan[index] < 0.001) {
				animMan[index] = 0;
			}
		}
		else if (animMan[index] < 0) {
			animMan[index] -= speed;
			if (animMan[index] > -0.001) {
				animMan[index] = 0;
			}
		}
	}
	slide("screenSlide");
	slide("activeSlide");

	if (gameMan.screen == "title") {
		var y = drawMan.activeHeight * menuMan["title"];
		drawMan.slideY = y + (drawMan.slideY - y) * animMan["activeSlide"];
	}

	if (musicMan.fading) {
		musicMan.alpha += dTime / 2000;
		if (musicMan.alpha > 1) {
			musicMan.alpha = 1;
		}
		sounds[musicMan.current].volume = (1 - musicMan.alpha) * soundMan.music;
		sounds[musicMan.next].volume = (musicMan.alpha) * soundMan.music;

		if (musicMan.alpha >= 1) {
			musicMan.fading = false;
			musicMan.alpha = 0;
			sounds[musicMan.current].pause();
			musicMan.current = musicMan.next;
		}
	}
}

function update(time) {
	var dTime = time - drawMan.time;
	drawMan.time = time;

	if (time - hudMan.fpsTime > 984) {
		hudMan.fpsText = hudMan.fpsCount + "fps";
		hudMan.fpsTime = time;
		hudMan.fpsCount = 0;
	}
	hudMan.fpsCount++;

	updateAnims(dTime);

	if (gameMan.scene == "board" && gameMan.screen != "popup") {
		if (gameMan.timed){
			updateTimer(dTime);
		}
		drawMural(muralCanvas.getContext("2d"), dTime);	// draw mural to buffer
	}

	drawContext(gpCanvas.getContext("2d"), dTime);	// draw main screen
	if (window.nwf) {
		drawContext(tvCanvas.getContext("2d"), dTime, "tv");	// draw tv
	}

	// This is triggering AI turns, not draw functionality
	if (gameMan.scene == "board" && gameMan.ais[gameMan.player] && gameMan.winner < 0 && gameMan.tutorialStep < 0 && !gameMan.thinking && !gameMan.replaying) {
		gameMan.thinking = true;
		setTimeout(function() {
			if (gameMan.thinking) {
				ai();
				gameMan.thinking = false;
			}
		}, 1200);
	}

	window.requestAnimationFrame(update);
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
		context.fillRect(drawMan.dialogX, 0, drawMan.muralWidth - drawMan.dialogX, drawMan.muralHeight);

		var lines;
		if (gameMan.tutorialStep >= 0) {
			lines = tutorials[gameMan.tutorialStep].text;
		} else {
			lines = [getWinnerText(gameMan.winner)];
		}

		var spacing = 36, topPadding = 26, bottomPadding = 14, nextX = 672, font = "px Georgia";
		// TODO either do tutstep > 0 or see if this is required at all
		if (lines.length > 4 && tutorials[gameMan.tutorialStep] && tutorials[gameMan.tutorialStep].input) {	// text too crowded
			spacing -= 4;
			topPadding -= 2;
			bottomPadding -= 2;
			nextX += 4;
			context.font = (fontSize-2) + font;
		} else {
			context.font = fontSize + font;
		}

		context.fillStyle = "#E0D9B3";
		for (var i = lines.length-1; i >= 0; --i) {
			context.fillText(lines[i], drawMan.dialogX+8, topPadding + spacing * i);
		}
	}
}

function drawContext(context, dTime, tv) {
	tv = tv ? tv : "";

	var canvas = context.canvas;
	context.fillStyle = drawMan.color;
	context.fillRect(0, 0, canvas.width, canvas.height);

	var scene = scenes[tv + gameMan.scene];
	context.save();
	context.translate(scene.x, scene.y);
	context.scale(scene.scale, scene.scale);

	var x = (scene.width - drawMan.screenWidth)/2;
	var y = (scene.height - drawMan.screenHeight)/2;
	switch (gameMan.screen) {
	case "title":
		context.drawImage(images["menuTitle0"], x, y);
		context.drawImage(images["menuTitle1"], x+512, y);
		if (menuMan["title"] < 6) {
			if (animMan["activeAlpha"] < 1) {
				context.globalAlpha = animMan["activeAlpha"];
			}
			context.drawImage(images["menuTitleActive"], x+82, y+282 + drawMan.slideY);
			context.globalAlpha = 1;
		}
		break;
	case "setup":
		context.drawImage(images["menuSetup0"], x, y);
		context.drawImage(images["menuSetup1"], x+512, y);
		context.drawImage(images["menuSetupAI" + gameMan.ais[0]], x+50, y+520);
		context.drawImage(images["menuSetupAI" + gameMan.ais[2]], x+340, y+520);
		context.drawImage(images["menuSetupAI" + gameMan.ais[1]], x+1020, y+520);
		context.drawImage(images["menuSetupAI" + gameMan.ais[3]], x+1310, y+520);
		context.drawImage(images["menuSetupTimer" + gameMan.timerIndex], x+840, y+685);
		break;
	case "tutorial":
		context.drawImage(images["menuTutorial0"], x, y);
		context.drawImage(images["menuTutorial1"], x+512, y);
		break;
	case "option":
		context.drawImage(images["menuOption0"], x, y);
		context.drawImage(images["menuOption1"], x+512, y);
		context.drawImage(images["menuOptionSlider"], x+100 + 1210*soundMan.music, y+384);
		context.drawImage(images["menuOptionSlider"], x+100 + 1210*soundMan.sound, y+648);
		break;
	case "credit":
		context.drawImage(images["menuCredit0"], x, y);
		context.drawImage(images["menuCredit1"], x+512, y);
		break;
	case "rules":
		if (gameMan.rules < rulePages) {
			context.drawImage(images["rule" + gameMan.rules + "0"], x + 1536*animMan["screenSlide"], y);
			context.drawImage(images["rule" + gameMan.rules + "1"], x+1024 + 1536*animMan["screenSlide"], y);
			drawRules(context, scene);
		}
		break;
	case "popup":
	case "board":
		context.drawImage(images["board0"], 0, 0);
		context.drawImage(images["board1"], 0, 960);

		if (gameMan.screen != "popup") {
			context.drawImage(muralCanvas, drawMan.muralX, drawMan.muralY);

			if (gameMan.tutorialStep > 0) {
				context.drawImage(images["tutorialButton0"], drawMan.tutorialPrevX, drawMan.tutorialButtonY);
			}

			if (gameMan.tutorialStep >= 0 && tutorials[gameMan.tutorialStep].input) {
				drawMan.tutorialTheta += dTime/250;
				if (drawMan.tutorialFlash > 0) {
					drawMan.tutorialFlash -= dTime/600;
					drawMan.tutorialTheta += dTime/40;
				}

				context.drawImage(images["tutorialButton1"], drawMan.tutorialNextX, drawMan.tutorialButtonY);
				context.globalAlpha = (Math.sin(drawMan.tutorialTheta % (Math.PI*2))+1)/2;
				context.drawImage(images["tutorialButton2"], drawMan.tutorialNextX, drawMan.tutorialButtonY);
				context.globalAlpha = 1;
			}

			if (gameMan.timed) {
				drawTimer(context);
			}

			if (gameMan.tutorialStep >= 0) {
				drawTutorialProgress(context);
			}

			setRings();	// TODO don't do this every frame?
			drawPieces(context);
			if (gameMan.winner < 0) {
				drawTiles(context, dTime);
			}
		}
		break;
	}

	context.restore();
	drawHud(canvas, context, tv, dTime);
}

function drawRules(context, scene) {
	if (scene.height > 1024) {	// only draw border if screen isn't small
		var padding = drawMan.arrowWidth/6;
		var borderX = drawMan.arrowWidth*1.1;
		var borderY = (scene.height - drawMan.screenHeight)/4;
		var borderWidth = scene.width - borderX*2;
		var borderHeight = (scene.height + drawMan.screenHeight)/2;

		context.strokeStyle = "#E0D9B3";
		context.lineCap = "square";
		context.lineWidth = 8;
		context.strokeRect(borderX, borderY, borderWidth, borderHeight);
		context.lineWidth = 2;
		context.strokeRect(borderX + padding, borderY + padding, borderWidth - padding*2, borderHeight - padding*2);
	}

	var arrowY = (scene.height - drawMan.arrowHeight)/2;
	if (gameMan.rules > 0) {
		var image = (menuMan["rules"] == 0) ? "ruleArrowActive0" : "ruleArrow0";
		context.drawImage(images[image], drawMan.arrowWidth/2, arrowY);
	}
	if (gameMan.rules < rulePages-1) {
		var image = (menuMan["rules"] == 1) ? "ruleArrowActive1" : "ruleArrow1";
		context.drawImage(images[image], scene.width - drawMan.arrowWidth*1.5, arrowY);
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
	// draw drag radius
	if (inputMan.touchID >= 0 && !inputMan.drag && gameMan.screen != "popup" && gameMan.pRow >= 0 && gameMan.pCol >= 0
	&& inPhalanx(gameMan.pRow, gameMan.pCol) && !routedCell(gameMan.pRow, gameMan.pCol)) {
		var x = gameMan.pCol * drawMan.cellSize + drawMan.cellSize/2;
		var y = gameMan.pRow * drawMan.cellSize + drawMan.cellSize/2;

		context.fillStyle = "rgba(191,191,191,0.5)";
		context.beginPath();
		context.arc(x, y, drawMan.cellSize * 2.0, 0, Math.PI*2);
		context.fill();

		context.strokeStyle = "white";
		context.lineWidth = 2;
		context.beginPath();
		context.arc(x, y, drawMan.cellSize * 1.8, 0, Math.PI*2);
		context.stroke();

		context.lineWidth = 6;
		context.beginPath();
		context.arc(x, y, drawMan.cellSize * 2.0, 0, Math.PI*2);
		context.stroke();
	}

	// TODO optimize context changes
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
					context.drawImage(images["piece" + cell.player], pieceSize/-2, pieceSize/-2);
					context.rotate(cell.rot * Math.PI/-2);

					if (cell.player == gameMan.player) {
						context.globalAlpha = (Math.sin(theta*2)+1)/2;	// pulse 2x the speed of ring rotation
						context.drawImage(images["pieceGlow"], drawMan.cellSize/-2, drawMan.cellSize/-2);
						context.globalAlpha = 1;
					}
					else {
						context.drawImage(images["pieceDark"], pieceSize/-2, pieceSize/-2);
					}
				}

				if (cell.prompt == 0) {
					context.rotate(theta);
					context.drawImage(images["pieceGreenComet"], pieceSize/-2, pieceSize/-2);
					context.rotate(-theta);
				}
				else if (cell.prompt == 1) {
					context.rotate(theta);
					context.drawImage(images["pieceGreen"], drawMan.cellSize/-2, drawMan.cellSize/-2);
					context.rotate(-theta);
				}
				else if (cell.prompt == 2) {
					context.drawImage(images["pieceGreenShadow"], pieceSize/-2, pieceSize/-2);
				}

				if (cell.ring == 0) {
					context.rotate(theta);
					context.drawImage(images["pieceGold"], drawMan.cellSize/-2, drawMan.cellSize/-2);
					context.rotate(-theta);
				}
				else if (cell.ring == 1) {
					var rotation = (cell.kind == 2) ? cell.city : inputMan.rot;
					context.rotate(rotation * Math.PI/2);
					context.drawImage(images["pieceShadow"], pieceSize/-2, pieceSize/-2);
					context.rotate(rotation * Math.PI/-2);
				}
				cell.ring = -1;	// clear for next time

				context.restore();
			}
		}
	}
}

function drawTiles(context, dTime) {
	if (gameMan.tutorialStep < 0 || (gameMan.tutorialStep > 0 && gameMan.tutorialStep < 7) || gameMan.tutorialStep == 50) {
		var theta = drawMan.time/400 % (Math.PI*2);
		context.globalAlpha = (Math.sin(theta)+1)/2;

		if (gameMan.player == 0) {
			context.drawImage(images["tileGoal"], 848,  176);
			context.drawImage(images["tileGoal"], 944,  176);
			context.drawImage(images["tileGoal"], 1040, 176);
		}
		else if (gameMan.player == 1) {
			context.drawImage(images["tileGoal"], 1712, 560);
			context.drawImage(images["tileGoal"], 1712, 656);
			context.drawImage(images["tileGoal"], 1712, 752);
		}
		else if (gameMan.player == 3) {
			context.drawImage(images["tileGoal"], 176, 560);
			context.drawImage(images["tileGoal"], 176, 656);
			context.drawImage(images["tileGoal"], 176, 752);
		}

		if (gameMan.player == 2 || gameMan.tutorialStep == 50) {
			context.drawImage(images["tileGoal"], 848,  1136);
			context.drawImage(images["tileGoal"], 944,  1136);
			context.drawImage(images["tileGoal"], 1040, 1136);
		}

		context.globalAlpha = 1;
	}

	context.save();
	switch (gameMan.player) {
	case 0:
		context.translate(1296, 1344);
		break;
	case 1:
		context.translate(96, 1008);
		break;
	case 2:
		context.translate(720, 96);
		break;
	case 3:
		context.translate(1920, 432);
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
	context.drawImage(images["helmet" + (gameMan.actions-1)], -128, -128);	// TODO make gameMan.actions 0,1 instead of 1,2
	context.restore();
}

function drawTimer(context) {
	if (gameMan.ais[gameMan.player] > 0 || gameMan.tutorialStep >= 0) {
		return;
	}
	context.save();
	var remainingTime = gameMan.turnTimes[gameMan.timerIndex] - gameMan.turnTimer;
	var minutes = Math.floor(remainingTime / 60000);
	var seconds = Math.floor(remainingTime / 1000) - 60 * minutes;
	var divider = seconds < 10 ? ":0" : ":";
	var timeString = minutes + divider + seconds;
	context.font = (2 * fontSize) + "px Georgia";
	context.fillStyle = "white";
	context.fillText(timeString, 2000 - context.measureText(timeString).width, 2 * fontSize);
	context.restore();
}

function drawTutorialProgress(context) {
	context.save();
	var sectionStarts = [0,7,23,34,52]; // HACK last section start represents end of tutorial, included for edge case handling
	var sectionNames = ["Introduction", "Actions and Routing", "Phalanxes", "Pushing"];
	var i = sectionStarts.length - 2;
	while (gameMan.tutorialStep < sectionStarts[i] && i > 0) {
		i -= 1;
	}
	var progressString = sectionNames[i] + ": " + (gameMan.tutorialStep - sectionStarts[i] + 1)  + "/" + (sectionStarts[i+1] - sectionStarts[i]);
	context.font = (2 * fontSize) + "px Georgia";
	context.fillStyle = "white";
	context.fillText(progressString, 2000 - context.measureText(progressString).width, 3 * fontSize);
	context.restore();
}

function drawHud(canvas, context, tv, dTime) {
	var x, y, scene = scenes["hud"];

	if (gameMan.debug) {
		context.fillStyle = drawMan.color;
		context.fillRect(0, 0, canvas.width, scene.hudHeight);
		hudMan.drawText = canvas.width + "x" + canvas.height + " " + scenes[tv + gameMan.scene].scale.toFixed(4) + "x";
		context.fillStyle = "white";
		context.fillText(hudMan.fpsText + "  |  " + hudMan.drawText + "  |  " + hudMan.inputText + "  |  " + hudMan.pageText, 138, scene.hudFont);
	}

	if (gameMan.screen == "popup") {
		x = (canvas.width - scene.popupWidth)/2;
		y = (canvas.height - scene.popupHeight)/2;
		y -= (y + scene.popupHeight) * animMan["screenSlide"];

		context.fillStyle = "rgba(0,0,0," + animMan["screenAlpha"] + ")";
		context.fillRect(0, 0, canvas.width, canvas.height);	// TODO do this before if, do fade correctly
		context.drawImage(images["menuPopup"], x, y, scene.popupWidth, scene.popupHeight);

		if (inputMan.drag == "popup" && animMan["activeAlpha"] >= 0) {
			context.fillStyle = "rgba(224,217,179," + 0.5*animMan["activeAlpha"] + ")";
			context.fillRect(x + 10*scene.scale, y + (9 + 124 * menuMan["popup"]) * scene.scale, 1004*scene.scale, 122*scene.scale);
		}
	}

	y = canvas.height - scene.buttonHeight;
	if (gameMan.scene == "rules" || gameMan.screen == "popup") {
		context.drawImage(images["buttonClose"], 0, y, scene.buttonWidth, scene.buttonHeight);
	}
	else if (gameMan.screen == "setup" || gameMan.screen == "option" || gameMan.screen == "credit" || gameMan.screen == "tutorial") {
		context.drawImage(images["buttonBack"], 0, y, scene.buttonWidth, scene.buttonHeight);
	}
	else if (gameMan.scene == "board") {
		context.drawImage(images["buttonMenu"], 0, y, scene.buttonWidth, scene.buttonHeight);
		context.drawImage(images["buttonPass"], scene.buttonWidth, y, scene.buttonWidth, scene.buttonHeight);
		context.drawImage(images["buttonUndo"], scene.buttonWidth*2, y, scene.buttonWidth, scene.buttonHeight);
	}

	if (inputMan.drag == "button" && menuMan["button"] >= 0) {
		context.drawImage(images["buttonActive"], scene.buttonWidth * menuMan["button"], y, scene.buttonWidth, scene.buttonHeight);
	}

	if (gameMan.debugBuild) {
		drawDebug(canvas, context, dTime);	// TODO do debug animations in update()
	}

	if (animMan["screenAlpha"] > 0 && gameMan.screen != "popup") {
		context.fillStyle = "rgba(0,0,0," + animMan["screenAlpha"] + ")";
		context.fillRect(0, 0, canvas.width, canvas.height);	// fullscreen fade
	}
}

(function() {
	var lastTime = 0;
	var vendors = ['webkit'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function(){callback(currTime + timeToCall)}, timeToCall);
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
