"use strict";

var canvas, context, images, sounds, grid, pieces=[], phalanx=[], debug=true;

var mediaMan = {
	play:true,
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
	gameText:"",
	soundText:"",
	inputText:"",
	phalanxText:""
}

var inputMan = {
	click:false,
	mode:0,
	pRow:-1,
	pCol:-1,
	pRot:-1,
	row:-1,
	col:-1,
	time:0,
	pX:0,
	pY:0,
	x:0,
	y:0
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
