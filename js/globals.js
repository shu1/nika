"use strict";

var canvas, context, images, sounds, grid, gameStates=[], phalanx=[];

var mediaMan = {
	retina:1,
	menu:false,
	play:true,
	draw:true,
	scale:1,
	zoom:0,
	time:0,
	x:0,
	y:0
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

var gameMan = {
	selection:false,
	debug:false,
	actions:2,
	player:0,
	pRow:-1,
	pCol:-1,
	pRot:-1,
	tut:-1
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

var buttons = [
	"Close",
	"Debug",
	"Tutorial",
	"   AI",
	" Pass",
	" Undo",
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

var tuts;
var numTuts;
var tutTurns = [1, 0, 0, 0, 2, 4, 2, 2, 1, 2, 1, 1];
var tutBoards = [[					// Tut 1.2 - 0 - Athens Victory
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
],[								// Tut 1.3 - 1 - Messenes Victory
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
],[								// Tut 1.4 - 2 - Spartan Victory
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
],[								// Tut 1.5 - 3 - Thebes Victory
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
],[								// Tut 2.1 - 4 - Basic Movement and Rout
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
],[								// Tut 2.2 - 5 - Basic Rotation and Rally
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
],[								// Tut 3.1 - 6 - Phalanx Movement and Rotation
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
],[								// Tut 3.2 - 7 - Sub-phalanx Movement
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
],[								// Tut 4.1 - 8 - Basic Pushing
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
],[								// Tut 4.2 - 9 - Push by Line
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
],[								// Tut 4.3 - 10 - Push Off Board to Rout
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
],[								// Tut 4.4 - 11 - Push into Ally to Rout
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
