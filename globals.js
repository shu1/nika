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


var grid = new Array(boardWidth);
for (var x=0; x<boardWidth; ++x) {
	grid[x] = new Array(boardHeight);
	for (var y=0; y<boardHeight; ++y) {
		grid[x][y] = {
						isValid:false,
						gridType:"",
						ownedPlayer:-1,
						isOccupied:false,
						occupiedPlayer:-1,
						pieceRotation:0,
					 };
	}
}

// GRID INITIALIZATION
// It is assembled section by section. Working on using the ascii.
// Regular Squares
for (var x=0; x<9; ++x) {
	for (var y=0; y<3; ++y) {
		// Player 1
		grid[x+6][y+9].isValid = true;
		grid[x+6][y+9].gridType = "regular";
		grid[x+6][y+9].ownedPlayer = 0;

		// Player 1
		grid[y+3][x+3].isValid = true;
		grid[y+3][x+3].gridType = "regular";
		grid[y+3][x+3].ownedPlayer = 1;

		// Player 3
		grid[x+6][y+3].isValid = true;
		grid[x+6][y+3].gridType = "regular";
		grid[x+6][y+3].ownedPlayer = 2;

		// Player 1
		grid[y+15][x+3].isValid = true;
		grid[y+15][x+3].gridType = "regular";
		grid[y+15][x+3].ownedPlayer = 3;
	}
}


// Routed Squares
for (var x=0; x<3; ++x) {
	for (var y=0; y<3; ++y) {
		// Player 1
		grid[x+6][y+12].isValid = true;
		grid[x+6][y+12].gridType = "routed";
		grid[x+6][y+12].ownedPlayer = 0;

		// Player 2
		grid[x][y+3].isValid = true;
		grid[x][y+3].gridType = "routed";
		grid[x][y+3].ownedPlayer = 1;

		// Player 3
		grid[x+12][y].isValid = true;
		grid[x+12][y].gridType = "routed";
		grid[x+12][y].ownedPlayer = 2;

		// Player 4
		grid[x+18][y+9].isValid = true;
		grid[x+18][y+9].gridType = "routed";
		grid[x+18][y+9].ownedPlayer = 3;
	}
}

// Respawn Squares
for (var x=0; x<3; ++x) {
	for (var y=0; y<2; ++y) {
		//Player 1
		grid[x+9][y+13].isValid = true;
		grid[x+9][y+13].gridType = "respawn";
		grid[x+9][y+13].ownedPlayer = 0;

		//Player 2
		grid[y][x+6].isValid = true;
		grid[y][x+6].gridType = "respawn";
		grid[y][x+6].ownedPlayer = 1;

		//Player 3
		grid[x+9][y].isValid = true;
		grid[x+9][y].gridType = "respawn";
		grid[x+9][y].ownedPlayer = 2;

		//Player 4
		grid[y+19][x+6].isValid = true;
		grid[y+19][x+6].gridType = "respawn";
		grid[y+19][x+6].ownedPlayer = 3;
	}
}

// Win Squares
for (var x=0; x<3; ++x) {
	//Player 1
	grid[x+9][12].isValid = true;
	grid[x+9][12].gridType = "win";
	grid[x+9][12].ownedPlayer = 0;

	//Player 2
	grid[2][x+6].isValid = true;
	grid[2][x+6].gridType = "win";
	grid[2][x+6].ownedPlayer = 1;

	//Player 3
	grid[x+9][2].isValid = true;
	grid[x+9][2].gridType = "win";
	grid[x+9][2].ownedPlayer = 2;

	//Player 4
	grid[18][x+6].isValid = true;
	grid[18][x+6].gridType = "win";
	grid[18][x+6].ownedPlayer = 3;
}