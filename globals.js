"use strict";

// for default resolution 1024x748
var pieceSize = 40;
var cellSize = 48;
var gridOffsetX = 8;
var gridOffsetY = 14;

var canvas, context, scale, grid, images, phalanx;

var	hudMan = {
	fpsCount:0,
	fpsTime:0,
	fpsText:"",
	inputText:""
}

var inputMan = {
	click:false,
	pieceRow:-1,
	pieceCol:-1,
	row:-1,
	col:-1,
	time:0
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
