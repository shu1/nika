"use strict";

function generateGrid() {
	grid = new Array(15);

	for (var row = 0; row < 15; ++row) {
		grid[row] = new Array(21);

		for (var col = 0; col < 21; ++col) {
			var a = ascii[row][col];

			var cell = {
				checked:false,
				type:-1,
				zone:-1,
				player:-1,
				rot:-1
			}

			if (a == 'A' || a == 'B' || a == 'C' || a == 'D') {
				cell.player = 0;
			}
			else if (a == 'E' || a == 'F' || a == 'G' || a == 'H') {
				cell.player = 1;
			}
			else if (a == 'I' || a == 'J' || a == 'K' || a == 'L') {
				cell.player = 2;
			}
			else if (a == 'M' || a == 'N' || a == 'O' || a == 'P') {
				cell.player = 3;
			}

			if (a == 'A' || a == 'E' || a == 'I' || a == 'M') {
				cell.rot = 0;
			}
			else if (a == 'B' || a == 'F' || a == 'J' || a == 'N') {
				cell.rot = 1;
			}
			else if (a == 'C' || a == 'G' || a == 'K' || a == 'O') {
				cell.rot = 2;
			}
			else if (a == 'D' || a == 'H' || a == 'L' || a == 'P') {
				cell.rot = 3;
			}
			
			if (a == '0' || a == '1' || a == '2' || a == '3' || cell.player >= 0) {
				cell.zone = cell.player;
				cell.type = 0;
			}
			else if (a == 'a' || a == 'b' || a == 'c' || a == 'd') {
				cell.type = 1;
			}
			else if (a == 'e' || a == 'f' || a == 'g' || a == 'h') {
				cell.type = 2;
			}
			else if (a == 'i' || a == 'j' || a == 'k' || a == 'l') {
				cell.type = 3;
			}

			if (a == '0' || a == 'a' || a == 'e' || a == 'i') {
				cell.zone = 0;
			}
			else if (a == '1' || a == 'b' || a == 'f' || a == 'j') {
				cell.zone = 1;
			}
			else if (a == '2' || a == 'c' || a == 'g' || a == 'k') {
				cell.zone = 2;
			}
			else if (a == '3' || a == 'd' || a == 'h' || a == 'l') {
				cell.zone = 3;
			}

			grid[row][col] = cell;
		}
	}
}

function clearChecked() {
	for (var row = grid.length - 1; row >= 0; --row) {
		for (var col = grid[row].length - 1; col >= 0; --col) {
			grid[row][col].checked = false;
		}
	}
}

function debugGrid() {
	for (var row = 0; row < 15; ++row) {
		var str = "";
		for (var col = 0; col < 21; ++col) {
			var a = grid[row][col].type; 
			str += a == -1 ? '.' : a;
		}
		console.log(str);
	}
}
