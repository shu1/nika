"use strict";

var debugMan = {
	scaling:false,
	show:false,
	rows:1,
	cols:1,
}

var debugTexts = [
	"  Close",
	" Debug",
	"     AI",
	"  Zoom",
	"  Mural",
	"AI Tool"
]

function menuDebug(index) {
	switch (index) {
	case 0:
		debugMan.show = !debugMan.show;
		menuMan["debug"] = 0;
		break;
	case 1:
		gameMan.debug = !gameMan.debug;
		initAnimations();
		break;
	case 2:
		ai();
		break;
	case 3:
		zoom();
		break;
	case 4:
		debugMural();
		break;
	case 5:
		aiTool();
		break;
	}
}

function drawDebug(canvas, context, dTime) {
	var scene = scenes["hud"];
	var time = 200;
	debugMan.scaling = false;	// whether menu is animating

	if (debugMan.show && (scene.debugWidth < scene.buttonWidth * debugMan.cols || scene.debugHeight < scene.buttonHeight * debugMan.rows)) {
		var speed = scene.buttonWidth * (debugMan.cols-1) * dTime / time;
		if (scene.debugWidth + speed < scene.buttonWidth * debugMan.cols) {
			scene.debugWidth += speed;
			debugMan.scaling = true;
		} else {
			scene.debugWidth = scene.buttonWidth * debugMan.cols;
		}

		speed = scene.buttonHeight * (debugMan.rows-1) * dTime / time;
		if (scene.debugHeight + speed < scene.buttonHeight * debugMan.rows) {
			scene.debugHeight += speed;
			debugMan.scaling = true;
		} else {
			scene.debugHeight = scene.buttonHeight * debugMan.rows;
		}
	}
	else if (!debugMan.show && (scene.debugWidth > scene.buttonWidth || scene.debugHeight > scene.buttonHeight)) {
		var speed = scene.buttonWidth * (debugMan.cols-1) * dTime / time;
		if (scene.debugWidth - speed > scene.buttonWidth) {
			scene.debugWidth -= speed;
			debugMan.scaling = true;
		} else {
			scene.debugWidth = scene.buttonWidth;
		}

		speed = scene.buttonHeight * (debugMan.rows-1) * dTime / time;
		if (scene.debugHeight - speed > scene.buttonHeight) {
			scene.debugHeight -= speed;
			debugMan.scaling = true;
		} else {
			scene.debugHeight = scene.buttonHeight;
		}
	}

	context.fillStyle = drawMan.color;
	context.fillRect(canvas.width - scene.debugWidth, canvas.height - scene.debugHeight, scene.debugWidth, scene.debugHeight);

	if (debugMan.show && !debugMan.scaling) {
		for (var row = 0; row < debugMan.rows; ++row) {
			for (var col = 0; col < debugMan.cols; ++col) {
				var button = row * debugMan.cols + col;
				if (button < debugTexts.length) {
					if (inputMan.drag == "debug" && button == menuMan["debug"]
					|| button == 1 && gameMan.debug) {
						drawButton(row, col, debugTexts[button], "#004157", "white");
					} else {
						drawButton(row, col, debugTexts[button], "white", "#004157");
					}
				}
			}
		}
	} else {
		if (inputMan.drag == "debug" && menuMan["debug"] == 0) {
			drawButton(0, 0, debugTexts[1], drawMan.color, "white");
		} else {
			drawButton(0, 0, debugTexts[1], "white");
		}
	}

	function drawButton(row, col, text, textColor, bgColor) {
		if (bgColor) {
			context.fillStyle = bgColor;
			context.fillRect(canvas.width - scene.buttonWidth * (col+1) + scene.buttonPadding, canvas.height - scene.buttonHeight * (row+1) + scene.buttonPadding,
				scene.buttonWidth - scene.buttonPadding*2, scene.buttonHeight - scene.buttonPadding*2);
		}
		context.fillStyle = textColor;
		context.fillText(text, canvas.width - scene.buttonWidth * (col+0.8), canvas.height - scene.buttonHeight * (row+0.5)+6);
	}
}

function debugGrid() {
	for (var row = 0; row < 15; ++row) {
		var str = "";
		for (var col = 0; col < 21; ++col) {
			var a = grid[row][col].city;
			str += (a == -1) ? '.' : a;
		}
		console.log(str);
	}
}

var debugMuralIndex = 0;
function debugMural() {
	var muralAnims = [
		[[0,"push"],[1,"pushed"]],[[0,"rout"],[1,"routed"]],[[0,"rout"],[1,"routed"],[3,"pushed"]],
		[[0,"push"],[3,"pushed"]],[[0,"rout"],[3,"routed"]],[[0,"rout"],[3,"routed"],[1,"pushed"]],
		[[2,"push"],[1,"pushed"]],[[2,"rout"],[1,"routed"]],[[2,"rout"],[1,"routed"],[3,"pushed"]],
		[[2,"push"],[3,"pushed"]],[[2,"rout"],[3,"routed"]],[[2,"rout"],[3,"routed"],[1,"pushed"]],
		[[1,"push"],[0,"pushed"]],[[1,"rout"],[0,"routed"]],[[1,"rout"],[0,"routed"],[2,"pushed"]],
		[[1,"push"],[2,"pushed"]],[[1,"rout"],[2,"routed"]],[[1,"rout"],[2,"routed"],[0,"pushed"]],
		[[3,"push"],[0,"pushed"]],[[3,"rout"],[0,"routed"]],[[3,"rout"],[0,"routed"],[2,"pushed"]],
		[[3,"push"],[2,"pushed"]],[[3,"rout"],[2,"routed"]],[[3,"rout"],[2,"routed"],[0,"pushed"]],
		[[0,"rally"],[2,"rally"]],[[1,"rally"],[3,"rally"]]
	]

	console.log(debugMuralIndex + " : " + muralAnims[debugMuralIndex].join(" "));

	muralAnims[debugMuralIndex].forEach(function(playerAnim) {
		playAnimation(playerAnim[0], playerAnim[1]);
	});

	++debugMuralIndex;
	if (debugMuralIndex >= muralAnims.length) {
		debugMuralIndex = 0;
	}
}

function replay() {
	gameMan.replaying = !gameMan.replaying;
	if (gameMan.replaying) {
		gameMan.thinking = false;
		gameMan.replay = states;
		gameMan.replayTurn = 0;
		loadReplayTurn();
	} else {
		revertState();
	}
}

function replayNext() {
	gameMan.replayTurn = Math.min(gameMan.replayTurn + 1, gameMan.replay.length - 1);
	loadReplayTurn();
}

function replayPrev() {
	gameMan.replayTurn = Math.max(gameMan.replayTurn - 1, 0);
	loadReplayTurn();
}

function loadReplayTurn() {
	loadState(gameMan.replay[gameMan.replayTurn]);
}

function aiTool() {
	var existingDiv = document.getElementById('ai-tool');
	if (existingDiv) {
		existingDiv.remove();
		return;
	}

	function inputFor(text, value, idx) {
		var label = document.createTextNode(text);
		var input = document.createElement('input');
		input.type = 'number';
		input.value = value;
		input.dataset.prop = text;
		if (idx != undefined) {
			label.textContent += '[' + idx + ']';
			input.dataset.idx = idx;
		}

		div.appendChild(label);
		div.appendChild(document.createElement('br'));
		div.appendChild(input);
		div.appendChild(document.createElement('br'));

		input.addEventListener('input', function() {
			var prop = this.dataset.prop;
			var idx = this.dataset.idx;
			if (idx == undefined) {
				aiWeights[0].values[prop] = parseInt(this.value);
			} else {
				aiWeights[0].values[prop][idx] = parseInt(this.value);
			}
			console.log(prop, aiWeights[0].values[prop]);
		});
	}
	var div = document.createElement('div');
	div.id = 'ai-tool';
	div.style.position = 'fixed';
	div.style.top = 0;
	div.style.left = 0;
	div.style.background = 'cadetblue';
	document.body.appendChild(div);

	for (var i in aiWeights[0].values) {
		if (Array.isArray(aiWeights[0].values[i])) {
			aiWeights[0].values[i].forEach(function(el, idx) {
				inputFor(i, el, idx);
			});
		} else {
			inputFor(i, aiWeights[0].values[i]);
		}
	}
}

// aiBattle([a, b, c, d], numGames) will set Athens, Sparta, Messene, and Thebes
// to ais a, b, c, and d respectively, where a, b, c, d, are numbers between 1 and 4
//
// 		1 - Shu's in-game AI
//		2 - Neil's in-game AI
//    3 - Test AI A, found in aiNeil.js
//    4 - Test AI B, found in aiNeil.js
//
// For example, aiBattle([3, 4, 3, 4], 100) will play 100 games where Athens and
// Messene are Test AI A, and Sparta and Thebes are Test AI B.

var aiBattleStats;
function aiBattle(ais, numGames) {
	numGames = numGames || 1;
	gameMan.ais = ais;
	var stats = {
		moves: [],
		wins: [0, 0]
	};
	for (var i = 0; i < numGames; i++) {
		console.log("Game " + (i + 1));
		var moves = 0;
		gameMan.thinking = true;
		newGame();
		while(gameMan.winner < 0) {
			ai();
			moves++;
		}
		stats.moves.push(moves);
		stats.wins[gameMan.winner % 2] += 1;
		gameMan.thinking = false;
	}
	aiBattleStats = stats;
	console.log(stats);
}
