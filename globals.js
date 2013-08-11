"use strict";

var canvas, context, images, audio, grid, phalanx=[], debug = true;

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
	mode:0
}

var ascii = [
	".........gggkkk......",
	".........gggkkk......",
	".........ccc.........",
	"jj.111222LKJ222333...",
	"jj.1112222KJ222333...",
	"jj.11122222J222333...",
	"ffbEEE.........33Mdhh",
	"ffbFF1.........3PPdhh",
	"ffbG11.........OOOdhh",
	"...111000D00000333.ll",
	"...111000DA0000333.ll",
	"...111000DAB000333.ll",
	".........aaa.........",
	"......iiieee.........",
	"......iiieee........."
]
