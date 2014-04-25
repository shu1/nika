"use strict";

var canvas, context, images, sounds, grid, gameStates=[], phalanx=[], scenes=[];

var tutorialMan = {
	step:-1,
	text:""
}

var dialogMan = {
	x:0,
	y:0,
	width:0,
	height:0
}

var mediaMan = {
	menu:false,
	play:true,
	draw:true,
	retina:1,
	zoom:0,
	time:0
}

var gameMan = {
	selection:false,
	debug:false,
	actions:2,
	player:0,
	scene:0,	// 0:game, 1:rules
	rules:0,
	pRow:-1,
	pCol:-1,
	pRot:-1
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
	y:0
}

var menuMan = {
	show:false,
	rows:1,
	cols:1,
	width:0,
	height:0,
	bWidth:0,
	bHeight:0,
	button:-1
}

var	hudMan = {
	fpsTime:0,
	fpsCount:0,
	fpsText:"",
	drawText:"",
	gameText:"",
	inputText:"",
	soundText:"",
	pieceText:""
}

var buttons = [
	" Menu",
	"Close",
	"Debug",
	"   AI",
	"Tutorial",
	"Rules",
	" Pass",
	" Undo"
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

var tutorialTurns = [1, 0, 0, 0, 2, 4, 2, 2, 1, 2, 1, 1];

var tutorialBoards = [[			// Tutorial 1.2 - 0 - Athens Victory
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
],[								// Tutorial 1.3 - 1 - Messenes Victory
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
],[								// Tutorial 1.4 - 2 - Spartan Victory
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
],[								// Tutorial 1.5 - 3 - Thebes Victory
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
],[								// Tutorial 2.1 - 4 - Basic Movement and Rout
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
],[								// Tutorial 2.2 - 5 - Basic Rotation and Rally
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
],[								// Tutorial 3.1 - 6 - Phalanx Movement and Rotation
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
],[								// Tutorial 3.2 - 7 - Sub-phalanx Movement
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
],[								// Tutorial 4.1 - 8 - Basic Pushing
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
],[								// Tutorial 4.2 - 9 - Push by Line
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
],[								// Tutorial 4.3 - 10 - Push Off Board to Rout
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
],[								// Tutorial 4.4 - 11 - Push into Ally to Rout
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
	"Welcome, strategos! You have been assigned command of our noble Athenian troops against the cruel Spartans and the treacherous Thebans."
],[
	"Our objective is to reach the camp of the Messenians, our brave allies. If a single Athenian piece reaches any part of this area, we win, and so do the Messenians."
],[
	"Drag our piece onto the highlighted space to claim victory."
],[
	"We can also win by helping any Messenian piece reach our own camp."
],[
	"Victory!"
]]
