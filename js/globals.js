﻿"use strict";

var tvCanvas, gpCanvas, muralCanvas, grid, images={}, sounds={}, scenes={}, states=[], phalanx=[], murals=[];

var eventMan = [[],[],[],[]];

var soundMan = {
	music:0.5,
	sound:0.5
}

var musicMan = {
	current:"musicMenu",
	next:"",
	fading:false,
	alpha:0
}

var drawMan = {
	color:"#00384C",
	cellSize:96,
	boardWidth:2016,
	boardHeight:1440,
	screenWidth:1536,
	screenHeight:1024,
	arrowWidth:96,
	arrowHeight:416,
	activeHeight:110,
	muralX:628,
	muralY:624,
	muralWidth:758,
	muralHeight:192,
	dialogX:152,
	tutorialPrevX:592,
	tutorialNextX:1233,
	tutorialButtonY:805,
	tutorialButtonWidth:190,
	tutorialButtonHeight:48,
	pixelRatio:1,
	time:0
}

var animMan = {
	"tutorialTheta":0,
	"helmetTheta":0,
	"activeAlpha":1,
	"screenAlpha":0,
	"screenSlide":0,
	"pieceSlide":0,
	"dragRadius":0,
	phalanx:[]
}

var gameMan = {
	debug:false,
	debugBuild:false,
	selection:false,
	tutorialStep:-1,
	tutorialPart:-1,
	winner:-1,
	actions:2,
	player:0,
	rules:0,
	pRot:-1,
	pRow:-1,
	pCol:-1,
	ais:[0,0,0,0],
	thinking:false,
	replaying:false,
	timerIndex:0,
	timed:false,
	turnTimes:[0, 30000, 60000, 120000],
	turnTimer:0,
	scene:"menus",
	screen:"title",
	pScreen:"",
	nScreen:""
}

var menuMan = {
	"popup":0,
	"title":0,
	"setup":0,
	"option":0,
	"tutorial":0
}

var inputMan = {
	pDistance:0,
	touchID2:-1,
	touchID:-1,
	menu:false,
	drag:"",
	pRot:-1,
	rot:-1,
	row:-1,
	col:-1,
	pX:0,
	pY:0,
	x:0,
	y:0
}

var hudMan = {
	fpsTime:0,
	fpsCount:0,
	fpsText:"",
	drawText:"",
	inputText:"",
	pageText:""
}

var newGrid = [
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiLKJiiimmm...",
	"hh.eeeiiiiKJiiimmm...",
	"hh.eeeiiiiiJiiimmm...",
	"ggfEEE.........mmMnoo",
	"ggfFFe.........mPPnoo",
	"ggfGee.........OOOnoo",
	"...eeeaaaDaaaaammm.pp",
	"...eeeaaaDAaaaammm.pp",
	"...eeeaaaDABaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
]

var emptyGrid = [
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
]

var tutorials = [{
	text:["Welcome, strategos! You have been","assigned command of our noble Athenian","troops against the cruel Spartans and the","treacherous Thebans."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,9,3],
		[0,10,9,3],
		[0,11,9,3],
		[0,10,10,0],
		[0,11,10,0],
		[0,11,11,1],
		[1,6,5,0],
		[1,6,4,0],
		[1,6,3,0],
		[1,7,4,1],
		[1,7,3,1],
		[1,8,3,2],
		[2,5,11,1],
		[2,4,11,1],
		[2,3,11,1],
		[2,4,10,2],
		[2,3,10,2],
		[2,3,9,3],
		[3,8,15,2],
		[3,8,16,2],
		[3,8,17,2],
		[3,7,16,3],
		[3,7,17,3],
		[3,6,17,0]
	],
	prompts:[
		[9,9,1],
		[10,9,1],
		[11,9,1],
		[10,10,1],
		[11,10,1],
		[11,11,1]
	]
},{
	text:["Our objective is to reach the camp of the","Messenians, our brave allies. If a single","Athenian piece reaches any part of this","area, we win, and so do the Messenians."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,9,3],
		[0,10,9,3],
		[0,11,9,3],
		[0,10,10,0],
		[0,11,10,0],
		[0,11,11,1],
		[1,6,5,0],
		[1,6,4,0],
		[1,6,3,0],
		[1,7,4,1],
		[1,7,3,1],
		[1,8,3,2],
		[2,5,11,1],
		[2,4,11,1],
		[2,3,11,1],
		[2,4,10,2],
		[2,3,10,2],
		[2,3,9,3],
		[3,8,15,2],
		[3,8,16,2],
		[3,8,17,2],
		[3,7,16,3],
		[3,7,17,3],
		[3,6,17,0]
	],
	prompts:[]
},{
	text:["Drag our piece onto the highlighted","space to claim victory."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,3,10,0]
	],
	prompts:[
		[3,10,0],
		[2,10,2]
	]
},{
	text:["Victory!"],
	input:true,
	player:0,
	actions:1,
	pieces:[
		[0,2,10,0]
	],
	prompts:[
		[2,10,1]
	],
	skip:true
},{
	text:["We also win if any Messenian piece","reaches our own camp."],
	input:true,
	player:2,
	actions:2,
	pieces:[
		[2,12,10,2]
	],
	prompts:[
		[12,10,1]
	]
},{
	text:["The battle is lost if any Spartan reaches","the Theban camp..."],
	input:true,
	player:1,
	actions:2,
	pieces:[
		[1,7,18,1]
	],
	prompts:[
		[7,18,1]
	]
},{

	text:["...or if any Theban reaches the Spartan","camp."],
	input:true,
	player:3,
	actions:2,
	pieces:[
		[3,7,2,3]
	],
	prompts:[
		[7,2,1]
	]
},{
	text:["To arms! The Spartans have sent a scout","into our territory. We must drive him off!"],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,10,5,1],
		[0,9,7,3],
		[1,9,6,1]
	],
	prompts:[
		[9,6,1]
	]
},{
	text:["We can take 2 actions per turn. The", "number of flashing helmets shows how", "many actions we have remaining."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,10,5,1],
		[0,9,7,3],
		[1,9,6,1]
	],
	prompts:[]
},{
	text:["All hoplites carry shields which protect","their front. The Spartan is FACING this","piece, so our soldier cannot attack."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,10,5,1],
		[0,9,7,3],
		[1,9,6,1]
	],
	prompts:[
		[9,7,1]
	]
},{
	text:["But Athena smiles upon us today -","we have him flanked! Let us MOVE our","other soldier. Drag this piece forward,","ending your touch in the space indicated."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,10,5,1],
		[0,9,7,3],
		[1,9,6,1]
	],
	prompts:[
		[10,5,0],
		[10,6,2]
	]
},{
	text:["Good. We can ROUT an enemy piece by","moving into it from the side or back, but","not from the front. Take out that Spartan!"],
	input:false,
	player:0,
	actions:1,
	pieces:[
		[0,10,6,1],
		[0,9,7,3],
		[1,9,6,1]
	],
	prompts:[
		[10,6,0],
		[9,6,2]
	]
},{
	text:["Bravo! As you saw, a piece ends up","facing the direction it moved in."],
	input:true,
	player:1,
	actions:2,
	pieces:[
		[0,9,6,0],
		[0,9,7,3],
		[1,3,1,1]
	],
	prompts:[
		[9,6,1]
	]
},{
	text:["Strategos! While we were dealing with","that Spartan, a contingent of Thebans","has approached us from behind.","Two of our men are in danger!"],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,3],
		[0,10,11,0],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,14,3]
	],
	prompts:[
		[9,11,1],
		[10,11,1]
	]
},{
	text:["We must protect ourselves by rotating","to face our enemy!"],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,3],
		[0,10,11,0],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,14,3]
	],
	prompts:[]
},{
	text:["Drag this piece to the right and release","your touch OUTSIDE the white circle."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,3],
		[0,10,11,0],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,14,3]
	],
	prompts:[
		[10,11,0]
	]
},{
	text:["Excellent! Now, rotate our other soldier","to face the Theban. Since the Theban is","blocking its movement, our piece will","rotate even if you try to move in that","direction."],
	input:false,
	player:0,
	actions:1,
	pieces:[
		[0,9,11,3],
		[0,10,11,1],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,14,3]
	],
	prompts:[
		[9,11,0]
	]
},{
	text:["Well done - the men are safe, for now."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,14,3]
	],
	prompts:[
		[9,11,1],
		[10,11,1]
	]
},{
	text:["Beware! The accursed Thebans are","trying to get around the edge of our line."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,12,3]
	],
	prompts:[
		[11,12,1]
	]
},{
	text:["Routed pieces are not out of the battle","forever. You can RALLY them into","the spaces shown."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,12,3]
	],
	prompts:[
		[13,8,1],
		[13,9,2],
		[13,10,2],
		[13,11,2],
		[14,9,2],
		[14,10,2],
		[14,11,2]
	]
},{
	text:["Drag our routed soldier into the space","indicated so he can hurry back to the fight."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,13,8,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,12,3]
	],
	prompts:[
		[13,8,0],
		[13,11,2]
	]
},{
	text:["This is our ally's victory area. We move","through these spaces normally, but our","enemies are not allowed to enter them."],
	input:true,
	player:0,
	actions:1,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,13,11,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,12,3]
	],
	prompts:[
		[12,9,1],
		[12,10,1],
		[12,11,1]
	]
},{
	text:["Let's move up our fresh soldier in","support."],
	input:false,
	player:0,
	actions:1,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,13,11,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,12,3]
	],
	prompts:[
		[13,11,0],
		[12,11,2]
	]
},{
	text:["Brilliant!"],
	input:true,
	player:3,
	actions:2,
	pieces:[
		[0,9,11,1],
		[0,10,11,1],
		[0,12,11,0],
		[3,9,12,3],
		[3,9,14,3],
		[3,11,12,3]
	],
	prompts:[],
	skip:true
},{
	text:["Like all hoplites, our troops are trained to","act in the powerful PHALANX formation.","Adjacent pieces that face the same way","can move and rotate together."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,6,3],
		[0,10,6,3],
		[1,7,5,2]
	],
	prompts:[
		[9,6,1],
		[10,6,1]
	]
},{
	text:["To move in a phalanx, just drag forward","any piece that is part of a phalanx","formation."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,6,3],
		[0,10,6,3],
		[1,7,5,2]
	],
	prompts:[
		[9,6,0],
		[10,6,0],
		[9,5,2],
		[10,5,2]
	]
},{
	text:["Exactly. Now, rotate our phalanx to","face the Spartan. Drag any piece in","the phalanx in the direction you want","it to face."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,5,3],
		[0,10,5,3],
		[1,7,5,2]
	],
	prompts:[
		[9,5,0],
		[10,5,0]
	]
},{
	text:["Good! Notice that, unlike single pieces,","a phalanx can only move forward.","Moving in a different direction requires","two actions: first rotating the phalanx,","the moving it."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,5,0],
		[0,10,5,0],
		[1,7,5,2]
	],
	prompts:[]
},{
	text:["The Thebans have mounted a tough","defense. If we move our whole phalanx","forward, the indicated piece will be","in danger. Proceed with caution."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,14,1],
		[0,11,14,1],
		[0,11,15,1],
		[3,10,16,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]
	],
	prompts:[
		[9,14,1]
	]
},{
	text:["Fortunately, we can split pieces off from","a phalanx. Tap the indicated piece to","enter phalanx sub-selection mode."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,14,1],
		[0,11,14,1],
		[0,11,15,1],
		[3,10,16,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]

	],
	prompts:[
		[10,14,0]
	],
	selection: [
		[10,14]
	]
},{
	text:["Next, tap this piece..."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,14,1],
		[0,11,14,1],
		[0,11,15,1],
		[3,10,16,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]
	],
	prompts:[
		[11,14,0]
	],
	phalanx:[
		{row:10,col:14}
	],
	selection: [
		[10,14],
		[11,14]
	]
},{
	text:["Then this piece."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,14,1],
		[0,11,14,1],
		[0,11,15,1],
		[3,10,16,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]
	],
	prompts:[
		[11,15,0]
	],
	phalanx:[
		{row:10,col:14},
		{row:11,col:14}
	],
	selection: [
		[10,14],
		[11,14],
		[11,15]
	]
},{
	text:["Deftly done! You can now move","the smaller phalanx you created by","dragging it forward as normal."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,14,1],
		[0,11,14,1],
		[0,11,15,1],
		[3,10,16,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]

	],
	prompts:[
		[10,14,0],
		[11,14,0],
		[11,15,0]
	],
	phalanx:[
		{row:10,col:14},
		{row:11,col:14},
		{row:11,col:15}
	]
},{
	text:["Now to the attack! Select only the","forward piece by tapping it, then rout","the exposed Theban. Remember -","unlike a phalanx, a single piece can","move in an direction!"],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,15,1],
		[0,11,15,1],
		[0,11,16,1],
		[3,10,16,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]
	],
	prompts:[
		[11,16,0],
		[10,16,2]
	]
},{
	text:["We have struck first without leaving","our men vulnerable. Masterful!"],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,14,1],
		[0,10,15,1],
		[0,11,15,1],
		[0,10,16,0],
		[3,11,19,3],
		[3,7,15,2],
		[3,7,16,2],
		[3,8,16,2]
	],
	prompts:[],
	skip:true
},{
	text:["This Spartan seeks to block our path.","Well, the Spartans are known more for","their bravery than their intelligence..."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,10,5,0],
		[0,9,5,0],
		[1,8,5,2],
		[1,6,5,1]
	],
	prompts:[
		[8,5,1]
	]
},{
	text:["Our phalanx cannot rout the Spartan, as","he is facing us. But, since we have two","pieces lined up against a single enemy,","we can PUSH him backward. Simply","move our phalanx forward to push."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,10,5,0],
		[0,9,5,0],
		[1,8,5,2],
		[1,6,5,1]
	],
	prompts:[
		[8,5,2],
		[9,5,0],
		[10,5,0]
	]
},{
	text:["Just so. We can push no further, since","the enemy line now matches our own","in strength."],
	input:true,
	player:0,
	actions:1,
	pieces:[
		[0,9,5,0],
		[0,8,5,0],
		[1,7,5,2],
		[1,6,5,1]
	],
	prompts:[
		[6,5,1],
		[7,5,1]
	]
},{
	text:["We have gained an advantage over the","Thebans. Our three soldiers stand against","their two. But how best to proceed?"],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,15,0],
		[0,9,16,0],
		[0,10,16,0],
		[3,8,15,2],
		[3,8,16,2]
	],
	prompts:[]
},{
	text:["We cannot push in this line, as there is","only one Athenian facing one Theban.","Our soldier here is stuck."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,15,0],
		[0,9,16,0],
		[0,10,16,0],
		[3,8,15,2],
		[3,8,16,2]
	],
	prompts:[
		[8,15,1],
		[9,15,1]
	]
},{
	text:["However, we have the advantage in this","line. Our two pieces can push back the","single Theban. Select only them, and","move them forward."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,9,15,0],
		[0,9,16,0],
		[0,10,16,0],
		[3,8,15,2],
		[3,8,16,2]
	],
	prompts:[
		[8,16,2],
		[9,16,0],
		[10,16,0]
	]
},{
	text:["Ha! Now, seize the advantage and destroy","that Theban. Tap only this piece to","split it off from the phalanx, then attack!"],
	input:false,
	player:0,
	actions:1,
	pieces:[
		[0,9,15,0],
		[0,8,16,0],
		[0,9,16,0],
		[3,8,15,2],
		[3,7,16,2]
	],
	prompts:[
		[8,16,0],
		[8,15,2]
	]
},{
	text:["Excellent!"],
	input:true,
	player:3,
	actions:2,
	pieces:[
		[0,9,15,0],
		[0,8,15,3],
		[0,9,16,0],
		[3,11,19,3],
		[3,7,16,2]
	],
	prompts:[],
	skip:true
},{
	text:["Good news, strategos! Our men have","trapped a Spartan near the edge of the","field."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,5,5,0],
		[0,4,5,0],
		[1,3,5,2]
	],
	prompts:[
		[3,5,1]
	]
},{
	text:["If we push an enemy piece off the","battlefield, that enemy is routed.","Push that Spartan to take him out!"],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,5,5,0],
		[0,4,5,0],
		[1,3,5,2]
	],
	prompts:[
		[3,5,2],
		[4,5,0],
		[5,5,0]
	]
},{
	text:["Yes! We can also rout enemies by pushing","them into our victory area, or our ally's."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,4,5,0],
		[0,3,5,0],
		[1,3,1,1]
	],
	prompts:[]
},{
	text:["We can even rout enemies by pushing","them into our ally's piece, or our own - ","regardless of the friendly piece's facing."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,8,15,0],
		[0,7,15,0],
		[3,6,15,2],
		[2,5,15,1]
	],
	prompts:[
		[6,15,1]
	]
},{
	text:["So, order the men forward! Remember, if","you're moving an entire phalanx, just drag","any piece in it -  you don't have to select","them each individually."],
	input:false,
	player:0,
	actions:2,
	pieces:[
		[0,8,15,0],
		[0,7,15,0],
		[3,6,15,2],
		[2,5,15,1]
	],
	prompts:[
		[6,15,2],
		[7,15,0],
		[8,15,0]
	]
},{
	text:["Perfect! We'll have to wait for the","Messenian soldier to move, since we","cannot push or rout allied troops -","or our own men, for that matter."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,7,15,0],
		[0,6,15,0],
		[3,11,19,3],
		[2,5,15,1]
	],
	prompts:[]
},{
	text:["Congratulations, strategos! You now know","everything you need to play Nika."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,9,3],
		[0,10,9,3],
		[0,11,9,3],
		[0,10,10,0],
		[0,11,10,0],
		[0,11,11,1],
		[1,6,5,0],
		[1,6,4,0],
		[1,6,3,0],
		[1,7,4,1],
		[1,7,3,1],
		[1,8,3,2],
		[2,5,11,1],
		[2,4,11,1],
		[2,3,11,1],
		[2,4,10,2],
		[2,3,10,2],
		[2,3,9,3],
		[3,8,15,2],
		[3,8,16,2],
		[3,8,17,2],
		[3,7,16,3],
		[3,7,17,3],
		[3,6,17,0]
	],
	prompts:[]
},{
	text:["Note that you can UNDO unwanted","moves, or PASS if you feel you cannot","better your position by taking an action."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,9,3],
		[0,10,9,3],
		[0,11,9,3],
		[0,10,10,0],
		[0,11,10,0],
		[0,11,11,1],
		[1,6,5,0],
		[1,6,4,0],
		[1,6,3,0],
		[1,7,4,1],
		[1,7,3,1],
		[1,8,3,2],
		[2,5,11,1],
		[2,4,11,1],
		[2,3,11,1],
		[2,4,10,2],
		[2,3,10,2],
		[2,3,9,3],
		[3,8,15,2],
		[3,8,16,2],
		[3,8,17,2],
		[3,7,16,3],
		[3,7,17,3],
		[3,6,17,0]
	],
	prompts:[]
},{
	text:["Always remember your ultimate goal -","get one of your pieces across the board","into the victory area on your ally's side,","or help your ally do the same."],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,9,3],
		[0,10,9,3],
		[0,11,9,3],
		[0,10,10,0],
		[0,11,10,0],
		[0,11,11,1],
		[1,6,5,0],
		[1,6,4,0],
		[1,6,3,0],
		[1,7,4,1],
		[1,7,3,1],
		[1,8,3,2],
		[2,5,11,1],
		[2,4,11,1],
		[2,3,11,1],
		[2,4,10,2],
		[2,3,10,2],
		[2,3,9,3],
		[3,8,15,2],
		[3,8,16,2],
		[3,8,17,2],
		[3,7,16,3],
		[3,7,17,3],
		[3,6,17,0]
	],
	prompts:[]
},{
	text:["Though the rules are few, you will find","that the strategies are deep and varied.","Now then, proserkhou kai nika -","go forth and conquer!"],
	input:true,
	player:0,
	actions:2,
	pieces:[
		[0,9,9,3],
		[0,10,9,3],
		[0,11,9,3],
		[0,10,10,0],
		[0,11,10,0],
		[0,11,11,1],
		[1,6,5,0],
		[1,6,4,0],
		[1,6,3,0],
		[1,7,4,1],
		[1,7,3,1],
		[1,8,3,2],
		[2,5,11,1],
		[2,4,11,1],
		[2,3,11,1],
		[2,4,10,2],
		[2,3,10,2],
		[2,3,9,3],
		[3,8,15,2],
		[3,8,16,2],
		[3,8,17,2],
		[3,7,16,3],
		[3,7,17,3],
		[3,6,17,0]
	],
	prompts:[]
}]
