"use strict";

var canvas, context, images, audio, grid, phalanx = [], debug = true;

var drawMan = {
	draw:true,
	scale:1,
	offsetX:0,
	offsetY:0,
	x:0,
	y:0
}

var	hudMan = {
	fpsTime:0,
	fpsCount:0,
	fpsText:"",
	drawText:"",
	audioText:"",
	inputText:"",
	phalanxText:""
}

var inputMan = {
	click:false,
	pieceRow:-1,
	pieceCol:-1,
	row:-1,
	col:-1,
	time:0,
	prevX:0,
	prevY:0,
	x:0,
	y:0
}

var phalanxMan = {
	startingRot:-1,
	mode:0
}

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

var moveHistory = []

var rotationHolder = -1;

var actionType = {
	pieceMove : 0,
	pieceRotate : 1,
	piecePush : 2,
	pieceRout : 3,
	pieceRally : 4,
	phalanxMove : 5,
	phalanxRotate : 6,
}
