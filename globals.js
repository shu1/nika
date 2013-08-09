"use strict";

var debug = true;

// values for canvas 1024x748
var cellSize = 48;
var pieceSize = 40;
var gridOffsetX = 8;
var gridOffsetY = 14;

var canvas, context, images, grid, phalanx = [];

var drawMan = {
	draw:true,
	scale:1,
	x:0,
	y:0
}

var	hudMan = {
	fpsTime:0,
	fpsCount:0,
	fpsText:"",
	drawText:"",
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
