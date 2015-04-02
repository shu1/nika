"use strict";

var gpCanvas, gpContext, muralCanvas, tvContext, grid, images={}, sounds={}, scenes={}, menus={}, gameStates=[], phalanx=[], murals=[];

var displayMan = {
	cellSize:96,
	boardWidth:2016,
	boardHeight:1440,
	screenWidth:1536,
	screenHeight:1024,
	arrowWidth:96,
	arrowHeight:416,
	activeHeight:110,
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
	music:0.5,
	sound:0.5
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
	menu:"",
	rules:0,
	pRow:-1,
	pCol:-1,
	pRot:-1,
}

var inputMan = {
	pinchDistance:0,
	touchID2:-1,
	touchID:-1,
	menu:false,
	drag:"",
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
	button:0,
	pWidth:0,
	pHeight:0
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
	"  Close",
	" Debug",
	"     AI",
	"  Zoom",
	"  Pass",
	"  Undo",
	"Tutorial",
	"  Rules",
	"  Menu"
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

var emptyBoard = [
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
	"...eeeaaaaaaaaammm.pp",
	".........bbb.........",
	"......dddccc.........",
	"......dddccc........."
]

var tutorialBoards = [
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: [
			{row:9,col:9,prompt:1},
			{row:10,col:9,prompt:1},
			{row:11,col:9,prompt:1},
			{row:10,col:10,prompt:1},
			{row:11,col:10,prompt:1},
			{row:11,col:11,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: [
			{row:2,col:9,prompt:2},
			{row:2,col:10,prompt:2},
			{row:2,col:11,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:3,col:10,rot:0,player:0}
		],
		prompts: [
			{row:3,col:10,prompt:0},
			{row:2,col:10,prompt:2}
		]
	},
	{
		player: 0,
		actions: 1,
		pieces: [
			{row:2,col:10,rot:0,player:0}
		],
		prompts: [
			{row:2,col:10,prompt:1}
		],
		skip: true
	},
	{
		player: 2,
		actions: 2,
		pieces: [
			{row:11,col:10,rot:2,player:2}
		],
		prompts: [
			{row:11,col:10,prompt:1},
			{row:12,col:9,prompt:2},
			{row:12,col:10,prompt:2},
			{row:12,col:11,prompt:2}
		]
	},
	{
		player: 2,
		actions: 1,
		pieces: [
			{row:12,col:10,rot:2,player:2}
		],
		prompts: [
			{row:12,col:10,prompt:1}
		],
		skip: true
	},
	{
		player: 1,
		actions: 2,
		pieces: [
			{row:7,col:17,rot:1,player:1}
		],
		prompts: [
			{row:7,col:17,prompt:1},
			{row:6,col:18,prompt:2},
			{row:7,col:18,prompt:2},
			{row:8,col:18,prompt:2}
		]
	},
	{
		player: 1,
		actions: 1,
		pieces: [
			{row:7,col:18,rot:1,player:1}
		],
		prompts: [
			{row:7,col:18,prompt:1}
		],
		skip: true
	},
	{
		player: 3,
		actions: 2,
		pieces: [
			{row:7,col:3,rot:3,player:3}
		],
		prompts: [
			{row:7,col:3,prompt:1},
			{row:6,col:2,prompt:2},
			{row:7,col:2,prompt:2},
			{row:8,col:2,prompt:2}
		]
	},
	{
		player: 3,
		actions: 1,
		pieces: [
			{row:7,col:2,rot:3,player:3}
		],
		prompts: [
			{row:7,col:2,prompt:1}
		],
		skip: true
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:5,rot:1,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:9,col:6,rot:1,player:1}
		],
		prompts: [
			{row:9,col:6,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:5,rot:1,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:9,col:6,rot:1,player:1}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:5,rot:1,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:9,col:6,rot:1,player:1}
		],
		prompts: [
			{row:9,col:7,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:5,rot:1,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:9,col:6,rot:1,player:1}
		],
		prompts: [
			{row:10,col:5,prompt:0},
			{row:10,col:6,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:6,rot:1,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:9,col:6,rot:1,player:1}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:6,rot:1,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:9,col:6,rot:1,player:1}
		],
		prompts: [
			{row:10,col:6,prompt:0},
			{row:9,col:6,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:6,rot:0,player:0},
			{row:9,col:7,rot:3,player:0},
			{row:3,col:1,rot:1,player:1}
		],
		prompts: [
			{row:9,col:6,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:3,player:0},
			{row:10,col:11,rot:0,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:14,rot:3,player:3}
		],
		prompts: [
			{row:9,col:11,prompt:1},
			{row:10,col:11,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:3,player:0},
			{row:10,col:11,rot:0,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:14,rot:3,player:3}
		],
		prompts: [
			{row:10,col:11,prompt:0}
		]
	},
	{
		player: 0,
		actions: 1,
		pieces: [
			{row:9,col:11,rot:3,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:14,rot:3,player:3}
		],
		prompts: [
			{row:9,col:11,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:14,rot:3,player:3}
		],
		prompts: [
			{row:9,col:11,prompt:1},
			{row:10,col:11,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:12,rot:3,player:3}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:12,rot:3,player:3}
		],
		prompts: [
			{row:13,col:8,prompt:1},
			{row:13,col:9,prompt:2},
			{row:13,col:10,prompt:2},
			{row:13,col:11,prompt:2},
			{row:14,col:9,prompt:2},
			{row:14,col:10,prompt:2},
			{row:14,col:11,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:8,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:12,rot:3,player:3}
		],
		prompts: [
			{row:13,col:8,prompt:0},
			{row:13,col:11,prompt:2}
		]
	},
	{
		player: 0,
		actions: 1,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:11,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:12,rot:3,player:3}
		],
		prompts: [
			{row:12,col:9,prompt:1},
			{row:12,col:10,prompt:1},
			{row:12,col:11,prompt:1}
		]
	},
	{
		player: 0,
		actions: 1,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:13,col:11,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:12,rot:3,player:3}
		],
		prompts: [
			{row:13,col:11,prompt:0},
			{row:12,col:11,prompt:2}
		]
	},
	{
		player: 3,
		actions: 2,
		pieces: [
			{row:9,col:11,rot:1,player:0},
			{row:10,col:11,rot:1,player:0},
			{row:12,col:11,rot:0,player:0},
			{row:9,col:12,rot:3,player:3},
			{row:9,col:14,rot:3,player:3},
			{row:11,col:12,rot:3,player:3}
		],
		prompts: [],
		skip: true
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:6,rot:3,player:0},
			{row:10,col:6,rot:3,player:0},
			{row:7,col:5,rot:2,player:1}
		],
		prompts: [
			{row:9,col:6,prompt:1},
			{row:10,col:6,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:6,rot:3,player:0},
			{row:10,col:6,rot:3,player:0},
			{row:7,col:5,rot:2,player:1}
		],
		prompts: [
			{row:9,col:6,prompt:0},
			{row:10,col:6,prompt:0},
			{row:9,col:5,prompt:2},
			{row:10,col:5,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:5,rot:3,player:0},
			{row:10,col:5,rot:3,player:0},
			{row:7,col:5,rot:2,player:1}
		],
		prompts: [
			{row:9,col:5,prompt:0},
			{row:10,col:5,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:5,rot:0,player:0},
			{row:10,col:5,rot:0,player:0},
			{row:7,col:5,rot:2,player:1}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:14,rot:1,player:0},
			{row:11,col:14,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:10,col:16,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [
			{row:9,col:14,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:14,rot:1,player:0},
			{row:11,col:14,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:10,col:16,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [
			{row:10,col:14,prompt:0},
			{row:11,col:14,prompt:0},
			{row:11,col:15,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:14,rot:1,player:0},
			{row:11,col:14,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:10,col:16,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [
			{row:10,col:14,prompt:0},
			{row:11,col:14,prompt:0},
			{row:11,col:15,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:14,rot:1,player:0},
			{row:11,col:14,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:10,col:16,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [
			{row:10,col:14,prompt:0},
			{row:11,col:14,prompt:0},
			{row:11,col:15,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:14,rot:1,player:0},
			{row:11,col:14,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:10,col:16,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [
			{row:10,col:14,prompt:0},
			{row:11,col:14,prompt:0},
			{row:11,col:15,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:15,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:11,col:16,rot:1,player:0},
			{row:10,col:16,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [
			{row:11,col:16,prompt:0},
			{row:10,col:16,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:14,rot:1,player:0},
			{row:10,col:15,rot:1,player:0},
			{row:11,col:15,rot:1,player:0},
			{row:10,col:16,rot:0,player:0},
			{row:11,col:19,rot:3,player:3},
			{row:7,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}

		],
		prompts: [],
		skip: true
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:5,rot:0,player:0},
			{row:9,col:5,rot:0,player:0},
			{row:8,col:5,rot:2,player:1},
			{row:6,col:5,rot:1,player:1}
		],
		prompts: [
			{row:8,col:5,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:10,col:5,rot:0,player:0},
			{row:9,col:5,rot:0,player:0},
			{row:8,col:5,rot:2,player:1},
			{row:6,col:5,rot:1,player:1}
		],
		prompts: [
			{row:8,col:5,prompt:2},
			{row:9,col:5,prompt:0},
			{row:10,col:5,prompt:0}
		]
	},
	{
		player: 0,
		actions: 1,
		pieces: [
			{row:9,col:5,rot:0,player:0},
			{row:8,col:5,rot:0,player:0},
			{row:7,col:5,rot:2,player:1},
			{row:6,col:5,rot:1,player:1}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:15,rot:0,player:0},
			{row:9,col:16,rot:0,player:0},
			{row:10,col:16,rot:0,player:0},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:15,rot:0,player:0},
			{row:9,col:16,rot:0,player:0},
			{row:10,col:16,rot:0,player:0},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}
		],
		prompts: [
			{row:8,col:15,prompt:1},
			{row:9,col:15,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:15,rot:0,player:0},
			{row:9,col:16,rot:0,player:0},
			{row:10,col:16,rot:0,player:0},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3}
		],
		prompts: [
			{row:8,col:16,prompt:2},
			{row:9,col:16,prompt:0},
			{row:10,col:16,prompt:0}
		]
	},
	{
		player: 0,
		actions: 1,
		pieces: [
			{row:9,col:15,rot:0,player:0},
			{row:8,col:16,rot:0,player:0},
			{row:9,col:16,rot:0,player:0},
			{row:8,col:15,rot:2,player:3},
			{row:7,col:16,rot:2,player:3}
		],
		prompts: [
			{row:8,col:16,prompt:0},
			{row:8,col:15,prompt:2}
		]
	},
	{
		player: 3,
		actions: 2,
		pieces: [
			{row:9,col:15,rot:0,player:0},
			{row:8,col:15,rot:3,player:0},
			{row:9,col:16,rot:0,player:0},
			{row:11,col:19,rot:3,player:3},
			{row:7,col:16,rot:2,player:3}
		],
		prompts: [],
		skip: true
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:5,col:5,rot:0,player:0},
			{row:4,col:5,rot:0,player:0},
			{row:3,col:5,rot:2,player:1}
		],
		prompts: [
			{row:3,col:5,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:5,col:5,rot:0,player:0},
			{row:4,col:5,rot:0,player:0},
			{row:3,col:5,rot:2,player:1}
		],
		prompts: [
			{row:3,col:5,prompt:2},
			{row:4,col:5,prompt:0},
			{row:5,col:5,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:4,col:5,rot:0,player:0},
			{row:3,col:5,rot:0,player:0},
			{row:3,col:1,rot:1,player:1}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:8,col:15,rot:0,player:0},
			{row:7,col:15,rot:0,player:0},
			{row:6,col:15,rot:2,player:3},
			{row:5,col:15,rot:1,player:2}
		],
		prompts: [
			{row:5,col:15,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:8,col:15,rot:0,player:0},
			{row:7,col:15,rot:0,player:0},
			{row:6,col:15,rot:2,player:3},
			{row:5,col:15,rot:1,player:2}
		],
		prompts: [
			{row:6,col:15,prompt:1}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:8,col:15,rot:0,player:0},
			{row:7,col:15,rot:0,player:0},
			{row:6,col:15,rot:2,player:3},
			{row:5,col:15,rot:1,player:2}
		],
		prompts: [
			{row:6,col:15,prompt:2},
			{row:7,col:15,prompt:0},
			{row:8,col:15,prompt:0}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:7,col:15,rot:0,player:0},
			{row:6,col:15,rot:0,player:0},
			{row:11,col:19,rot:3,player:3},
			{row:5,col:15,rot:1,player:2}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: [
			{row:12,col:9,prompt:2},
			{row:12,col:10,prompt:2},
			{row:12,col:11,prompt:2},
			{row:2,col:9,prompt:2},
			{row:2,col:10,prompt:2},
			{row:2,col:11,prompt:2}
		]
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: []
	},
	{
		player: 0,
		actions: 2,
		pieces: [
			{row:9,col:9,rot:3,player:0},
			{row:10,col:9,rot:3,player:0},
			{row:11,col:9,rot:3,player:0},
			{row:10,col:10,rot:0,player:0},
			{row:11,col:10,rot:0,player:0},
			{row:11,col:11,rot:1,player:0},
			{row:6,col:5,rot:0,player:1},
			{row:6,col:4,rot:0,player:1},
			{row:6,col:3,rot:0,player:1},
			{row:7,col:4,rot:1,player:1},
			{row:7,col:3,rot:1,player:1},
			{row:8,col:3,rot:2,player:1},
			{row:5,col:11,rot:1,player:2},
			{row:4,col:11,rot:1,player:2},
			{row:3,col:11,rot:1,player:2},
			{row:4,col:10,rot:2,player:2},
			{row:3,col:10,rot:2,player:2},
			{row:3,col:9,rot:3,player:2},
			{row:8,col:15,rot:2,player:3},
			{row:8,col:16,rot:2,player:3},
			{row:8,col:17,rot:2,player:3},
			{row:7,col:16,rot:3,player:3},
			{row:7,col:17,rot:3,player:3},
			{row:6,col:17,rot:0,player:3}
		],
		prompts: []
	},
]

var tutorialTexts = [
[
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
]
]

var tutorialInputs = [
	true,	true,	false,	true,	true,	true,	true,	true,	true,	true,
	true,	true,	true,	false,	true,	false,	true,	true,	false,	false,
	true,	true,	true,	false,	true,	false,	true,	true,	false,	false,
	true,	true,	false,	false,	false,	false,	false,	true,	true,	false,
	true,	true,	true,	false,	false,	true,	true,	false,	true,	true,
	true,	false,	true,	true,	true,	true,	true,	true
]
