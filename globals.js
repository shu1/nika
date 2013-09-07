"use strict";

var canvas, context, images, sounds, grid, gameStates=[], pieces=[], phalanx=[];

var mediaMan = {
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
	player:0,
	actions:2,
	pRow:-1,
	pCol:-1,
	pRot:-1,
	mode:0
}

var menuMan = {
	rows:1,
	cols:1,
	bWidth:0,
	bHeight:0
}

var buttons = [
	"Close",
	"Debug",
	"AI",
	"Undo"
]

var ascii = [
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
