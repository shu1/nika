"use strict";

function generateGrid() {
	grid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		grid[row] = new Array(15);
		for (var col = 0; col < 21; ++col) {
			var a = ascii[row][col];
			var cell = -1, zone = -1, player = -1, rot = -1;

			if (a == 'A' || a == 'B' || a == 'C' || a == 'D') {
				player = 0;
			}
			else if (a == 'E' || a == 'F' || a == 'G' || a == 'H') {
				player = 1;
			}
			else if (a == 'I' || a == 'J' || a == 'K' || a == 'L') {
				player = 2;
			}
			else if (a == 'M' || a == 'N' || a == 'O' || a == 'P') {
				player = 3;
			}

			if (a == 'A' || a == 'E' || a == 'I' || a == 'M') {
				rot = 0;
			}
			else if (a == 'B' || a == 'F' || a == 'J' || a == 'N') {
				rot = 1;
			}
			else if (a == 'C' || a == 'G' || a == 'K' || a == 'O') {
				rot = 2;
			}
			else if (a == 'D' || a == 'H' || a == 'L' || a == 'P') {
				rot = 3;
			}
			
			if (a == '0' || a == '1' || a == '2' || a == '3' || player >= 0) {
				zone = player;
				cell = 0;
			}
			else if (a == 'a' || a == 'b' || a == 'c' || a == 'd') {
				cell = 1;
			}
			else if (a == 'e' || a == 'f' || a == 'g' || a == 'h') {
				cell = 2;
			}
			else if (a == 'i' || a == 'j' || a == 'k' || a == 'l') {
				cell = 3;
			}

			if (a == '0' || a == 'a' || a == 'e' || a == 'i') {
				zone = 0;
			}
			else if (a == '1' || a == 'b' || a == 'f' || a == 'j') {
				zone = 1;
			}
			else if (a == '2' || a == 'c' || a == 'g' || a == 'k') {
				zone = 2;
			}
			else if (a == '3' || a == 'd' || a == 'h' || a == 'l') {
				zone = 3;
			}

			grid[row][col] = {
				cell:cell,
				zone:zone,
				player:player,
				rot:rot,
				checked:false
			}
		}
	}
}

function debugGrid() {
	for (var row = 0; row < 15; ++row) {
		var str = "";
		for (var col = 0; col < 21; ++col) {
			var a = grid[row][col].cell; 
			str += a == -1 ? '.' : a;
		}
		console.log(str);
	}
}
