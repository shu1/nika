"use strict";

function menuDebug(index) {
	switch (index) {
	case 0:
		menuMan.show = !menuMan.show;
		menus["debug"] = 0;
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

// debugMural() will play back all animation combinations
// debugMural(index) will play back a single animation by index
function debugMural(index) {
	var anims = [
		[0,"push",1,"pushed"],[0,"rout",1,"routed"],[0,"rout",1,"pushed"],
		[0,"push",3,"pushed"],[0,"rout",3,"routed"],[0,"rout",3,"pushed"],
		[2,"push",1,"pushed"],[2,"rout",1,"routed"],[2,"rout",1,"pushed"],
		[2,"push",3,"pushed"],[2,"rout",3,"routed"],[2,"rout",3,"pushed"],
		[1,"push",0,"pushed"],[1,"rout",0,"routed"],[1,"rout",0,"pushed"],
		[1,"push",2,"pushed"],[1,"rout",2,"routed"],[1,"rout",2,"pushed"],
		[3,"push",0,"pushed"],[3,"rout",0,"routed"],[3,"rout",0,"pushed"],
		[3,"push",2,"pushed"],[3,"rout",2,"routed"],[3,"rout",2,"pushed"],
		[0,"rally",2,"rally"],[1,"rally",3,"rally"]
	]

	if (index != undefined) {
		console.log(index + " : " + anims[index].join(" "));
		playAnimation(anims[index][0], anims[index][1]);
		playAnimation(anims[index][2], anims[index][3]);
	}
	else {
		anims.forEach(function(anim, index) {
			setTimeout(function() {
				console.log(index + " : " + anim.join(" "));
				playAnimation(anim[0], anim[1]);
				playAnimation(anim[2], anim[3]);
			}, index * 2000);
		});
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
