// testAnimation() will play back all animation combinations
// testAnimation(idx) will play back a single animation by index
function testAnimation(idx) {
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

	if (idx != undefined) {
		console.log(idx + " : " + anims[idx].join(" "));
		playAnimation(anims[idx][0], anims[idx][1]);
		playAnimation(anims[idx][2], anims[idx][3]);
	}
	else {
		anims.forEach(function(anim, idx) {
			setTimeout(function() {
				console.log(idx + " : " + anim.join(" "));
				playAnimation(anim[0], anim[1]);
				playAnimation(anim[2], anim[3]);
			}, idx * 2000);
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
