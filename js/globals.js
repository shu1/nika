"use strict";

var gpCanvas, gpContext, muralCanvas, tvContext, grid, images={}, sounds={}, scenes={}, gameStates=[], phalanx=[], murals=[];

var displayMan = {
	cellSize:96,
	boardWidth:2016,
	boardHeight:1440,
	ruleWidth:1536,
	ruleHeight:1024,
	arrowWidth:96,
	arrowHeight:416,
	muralX:628,
	muralY:624,
	muralWidth:758,
	muralHeight:192,
	tutorialOffset:152,
	menu:false,
	helmetTheta:0,
	helmetScale:0,
	helmetFlash:0,
	zoom:0,
	time:0
}

var audioMan = {
	sound:10,
	music:10
}

var eventMan = {
	0:[],
	1:[],
	2:[],
	3:[]
}

var gameMan = {
	tutorialStep:-1,
	tutorialPart:-1,
	selection:false,
	debug:false,
	winner:-1,
	actions:2,
	player:0,
	scene:"",
	rules:0,
	pRow:-1,
	pCol:-1,
	pRot:-1,
}

var inputMan = {
	click:false,
	menu:false,
	time:0,
	row:-1,
	col:-1,
	rot:-1,
	pX:0,
	pY:0,
	x:0,
	y:0,
	currentTouchId:-1
}

var menuMan = {
	show:false,
	rows:1,
	cols:1,
	width:0,
	height:0,
	bWidth:0,
	bHeight:0,
	button:0
}

var	hudMan = {
	fpsTime:0,
	fpsCount:0,
	fpsText:"",
	drawText:"",
	inputText:"",
	pageText:""
}

var buttons = [
	"  Menu",
	"  Close",
	" Debug",
	"     AI",
	"  Zoom",
	"  Pass",
	"  Undo",
	"  Rules",
	"Tutorial",
]

var mainBoard = [
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

var tutorialBoards = [[	// 2 Athens Victory
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiAiiiimmm...",
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
],[	// 3 Messenes Victory
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
	"...eeeaaaaKaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 5 Spartan Victory
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmFnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 7 Thebes Victory
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfPee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 9 Basic Movement and Rout
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeFDaaaaaaammm.pp",
	"...eeBaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 15 Basic Rotation and Rally
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaDPaPmmm.pp",
	"...eeeaaaaaAaaammm.pp",
	"...eeeaaaaaaaaPmmm.pp",
	".........bbb.........",
	"......ddQccc.........",
	"......dddccc........."
],[	// 25 Phalanx Movement and Rotation
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeeG.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeDaaaaaaaammm.pp",
	"...eeeDaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 29 Sub-phalanx Movement
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........OOmnoo",
	"ggfeee.........mOmnoo",
	"...eeeaaaaaaaaBmmm.pp",
	"...eeeaaaaaaaaBmPm.pp",
	"...eeeaaaaaaaaBBmm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 33 Basic Pushing
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeeF.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeeG.........mmmnoo",
	"...eeAaaaaaaaaammm.pp",
	"...eeAaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 36 Push by Line
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........OOmnoo",
	"...eeeaaaaaaaaaAAm.pp",
	"...eeeaaaaaaaaamAm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 40 Push Off Board to Rout
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeGiiiiiiiiimmm...",
	"hh.eeAiiiiiiiiimmm...",
	"hh.eeAiiiiiiiiimmm...",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"ggfeee.........mmmnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
],[	// 43 Push into Ally to Rout
	".........kkklll......",
	".........kkklll......",
	".........jjj.........",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiimmm...",
	"hh.eeeiiiiiiiiiJmm...",
	"ggfeee.........Ommnoo",
	"ggfeee.........Ammnoo",
	"ggfeee.........Ammnoo",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
]]

var tutorialTexts = [[
	"Welcome, strategos! You have been","assigned command of our noble Athenian","troops against the cruel Spartans and the","treacherous Thebans."
],[
	"Our objective is to reach the camp of the","Messenians, our brave allies. If a single","Athenian piece reaches any part of this","area, we win, and so do the Messenians."
],[
	"Drag our piece onto the highlighted","space to claim victory."
],[
	"Victory!"
],[
	"We also win if any Messenian piece","reaches our own camp."
],[
	"Victory!"
],[
	"Our enemies have allied against us. We","must stop them from breaking through","our lines at any cost!"
],[
	"Defeat!"
],[
	"If any Spartan or Theban reaches the","opposite camp, we will have failed in","our mission, and the battle will be lost."
],[
	"Defeat!"
],[
	"The Spartans have sent a scout into our","territory. We must drive him off!"
],[
	"We can take 2 actions per turn. The", "number of flashing helmets shows how", "many actions we have remaining."
],[
	"All hoplites carry shields which protect","their front. The Spartan is FACING this","piece, so this piece cannot attack."
],[
	"But Athena smiles upon us today -","we have him flanked! Let us MOVE our","other soldier. Drag this piece forward,","ending your touch in the space indicated."
],[
	"Good. Notice that the single helmet","indicates we have only 1 action remaining."
],[
	"We can ROUT an enemy piece by moving","into it from the side or back, but not from","the front. Take out that Spartan!"
],[
	"Bravo! Now, listen - this is important.","A piece can move forward, left, right,","or back in one action. As you saw, it","turns to face the direction it moved in."
],[
	"Strategos! While we were dealing with","that Spartan, a contingent of Thebans","has approached us from behind.","Two of our men are in danger!"
],[
	"We must protect ourselves! To ROTATE","a piece in place, drag it in the direction","you want it to face, and end your touch","more than a space away. Rotate this","piece so that it faces the right."
],[
	"Excellent! Now, rotate our other soldier","to face the Theban. Since the Theban is","blocking its movement, our piece will","rotate even if you try to move in that","direction."
],[
	"Pieces can rotate to face any direction","in one action. Well done - the men are","safe, for now."
],[
	"Beware! The accursed Thebans are","trying to get around the edge of our line.","We must rally!"
],[
	"Routed pieces are not out of the battle","forever. You can rally one routed piece","at a time back onto the battlefield into","the areas indicated."
],[
	"To RALLY a piece, drag it into one of","your rally spaces. Let's deploy our man","here so he can hurry back to the fight."
],[
	"This is our ally's victory area. We move","through these spaces normally, but our","enemies are not allowed to enter them."
],[
	"Let's move up our fresh soldier in","support."
],[
	"Brilliant!"
],[
	"Like all hoplites, our troops are trained to","act in the powerful PHALANX formation.","If two or more are adjacent and face the","same way, they can move and rotate","together."
],[
	"To move in a phalanx, just drag forward","any piece that is part of a phalanx","formation."
],[
	"Exactly. Now, rotate our phalanx to","face the Spartan. Drag any piece in","the phalanx in the direction you want","it to face."
],[
	"Good! You'll notice that pieces in a","phalanx can only move forward.","Moving in a different direction requires","two actions: first rotating the phalanx,","then moving it."
],[
	"The Thebans have mounted a tough","defense. If we move our whole phalanx","forward, our piece nearest the main","Theban formation will be in danger.","Proceed with caution."
],[
	"Fortunately, we can split pieces off from","a phalanx. Tap the indicated piece to","enter phalanx sub-selection mode."
],[
	"Now tap the other pieces indicated,","starting with the corner piece. If you","try to create an invalid phalanx by","tapping the forward piece first, you'll","have to start over."
],[
	"Now tap the other pieces indicated,","starting with the corner piece. If you","try to create an invalid phalanx by","tapping the forward piece first, you'll","have to start over."
],[
	"Deftly done! You can now move","the smaller phalanx you created by","dragging it forward as normal."
],[
	"Now, to the attack! Select only the","forward piece by tapping it, then rout","the exposed Theban. Remember -","unlike a phalanx, a single piece can","move in any direction!"
],[
	"We have struck first without leaving","our men vulnerable. Masterful!"
],[
	"This Spartan seeks to block our path.","Well, the Spartans are known more for","their bravery than their intelligence..."
],[
	"Our phalanx cannot rout the Spartan, as","he is facing us. But, since we have two","pieces lined up against a single enemy,","we can PUSH him backward by simply","moving our phalanx toward him."
],[
	"Just so. We can push no further, as there","are now two enemies lined up to block our","way, even though the farther Spartan is","not facing us. Still, it is important to gain","ground when we can."
],[
	"We have gained an advantage on the","Thebans. We have three soldiers against","their two. But how best to proceed?"
],[
	"We cannot push in this line, as there is","only one Athenian facing one Theban.","Our soldier here is stuck."
],[
	"However, we have the advantage in this","line. Our two pieces can push back the","single Theban. Select only them, and","move them forward."
],[
	"Ha! Now, seize the advantage and destroy","that Theban! Tap to select only this piece","so it can move to the left without rotating","first - but I'm sure you knew that already.","Then attack!"
],[
	"Excellent!"
],[
	"Good news, strategos! Our men have","trapped a Spartan near the edge of the","field."
],[
	"If we push an enemy piece off the","battlefield, that enemy is routed.","Push that Spartan to take him out!"
],[
	"Yes! We can rout enemies by pushing","them into any invalid space. That includes","our and our ally's victory areas, as well as","the center or outside of the board."
],[
	"We can reap great rewards by","coordinating with the Messenians,","our allies."
],[
	"If we push this piece into our ally, the","Theban will be routed, regardless of our","ally's facing. Pushing an enemy into our","own piece does the same thing."
],[
	"So, order the men forward!"
],[
	"Perfect! At this point, we'll have to wait","for the Messenians to move their soldier","out of our way. We are never allowed to","push or rout our allies - or our own men."
],[
	"Congratulations! You now know","everything you need to play Nika."
],[
	"Always remember your ultimate goal -","get one of your pieces across the board","into the victory area on your ally's side,","or help your ally do the same."
],[
	"As you play, take some time to explore","the interface. You can, for example,","UNDO an unwanted move, or PASS if","you feel you cannot better your position","by taking an action."
],[
	"You can also press the ZOOM button to","zoom in and out. While zoomed in, you","can move the view around by dragging."
],[
	"Though the rules are few, you will find","that the strategies are deep and varied.","Now then, proserkhou kai nika -","go forth and conquer!"
]]

var tutorialInputs = [
	true,	true,	false,	true,	true,	true,	true,	true,	true,	true,
	true,	true,	true,	false,	true,	false,	true,	true,	false,	false,
	true,	true,	true,	false,	true,	false,	true,	true,	false,	false,
	true,	true,	false,	false,	false,	false,	false,	true,	true,	false,
	true,	true,	true,	false,	false,	true,	true,	false,	true,	true,
	true,	false,	true,	true,	true,	true,	true,	true
]

var tutorialParts = [2, 4, 6, 8, 10, 17, 27, 31, 38, 41, 46, 49]
