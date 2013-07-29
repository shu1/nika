"use strict";

var pieceSize = 40;
var cellSize = 48;
var gridOffsetX = 8;
var gridOffsetY = 14;

var canvas, context, scale;

var	hud = {
	fpsCount:0,
	fpsTime:0,
	fpsText:"",
	inputText:""
}

var inputMan = {
	mouseDown:false,
	x:-1,
	y:-1,
	player:{},
	piece:{}
}

var	players = [{},{},{},{}];
players[0].pieces = [{x: 9, y:9, r:3}, {x: 9, y:10, r:3}, {x: 9, y:11, r:3}, {x:10, y:10, r:0}, {x:10, y:11, r:0}, {x:11, y:11, r:1}];
players[1].pieces = [{x: 5, y:6, r:0}, {x: 4, y: 6, r:0}, {x: 3, y: 6, r:0}, {x: 4, y: 7, r:1}, {x: 3, y: 7, r:1}, {x: 3, y: 8, r:2}];
players[2].pieces = [{x:11, y:5, r:1}, {x:11, y: 4, r:1}, {x:11, y: 3, r:1}, {x:10, y: 4, r:2}, {x:10, y: 3, r:2}, {x: 9, y: 3, r:3}];
players[3].pieces = [{x:15, y:8, r:2}, {x:16, y: 8, r:2}, {x:17, y: 8, r:2}, {x:16, y: 7, r:3}, {x:17, y: 7, r:3}, {x:17, y: 6, r:0}];

var ascii = [
"         jjjkkk      ",
"         jjjkkk      ",
"         iii         ",
"gg ......LKJ......   ",
"gg .......KJ......   ",
"gg ........J......   ",
"ffeEEE         ..Mmnn",
"ffeFF.         .PPmnn",
"ffeG..         OOOmnn",
"   ......D........ oo",
"   ......DA....... oo",
"   ......DAB...... oo",
"         aaa         ",
"      cccbbb         ",
"      cccbbb         "
]
