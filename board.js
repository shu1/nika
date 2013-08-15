"use strict";

function generateGrid() {
	grid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		grid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var a = ascii[row][col];
			var cell = {
				checked:false,
				player:-1,
				kind:-1,
				city:-1,
				rot:-1,
				ring:-1
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

			if (a == 'a' || a == 'b' || a == 'c' || a == 'd' || cell.player == 0) {
				cell.city = 0;
			}
			else if (a == 'e' || a == 'f' || a == 'g' || a == 'h' || cell.player == 1) {
				cell.city = 1;
			}
			else if (a == 'i' || a == 'j' || a == 'k' || a == 'l' || cell.player == 2) {
				cell.city = 2;
			}
			else if (a == 'm' || a == 'n' || a == 'o' || a == 'p' || cell.player == 3) {
				cell.city = 3;
			}

			if (a == 'a' || a == 'e' || a == 'i' || a == 'm' || cell.player >= 0) {
				cell.kind = 0;	// normal
			}
			else if (a == 'b' || a == 'f' || a == 'j' || a == 'n') {
				cell.kind = 1;	// goal
			}
			else if (a == 'c' || a == 'g' || a == 'k' || a == 'o') {
				cell.kind = 2;	// rally
			}
			else if (a == 'd' || a == 'h' || a == 'l' || a == 'p') {
				cell.kind = 3;	// routed
			}

			grid[row][col] = cell;
		}
	}
}

function debugGrid() {
	for (var row = 0; row < 15; ++row) {
		var str = "";
		for (var col = 0; col < 21; ++col) {
			var a = grid[row][col].kind; 
			str += a == -1 ? '.' : a;
		}
		console.log(str);
	}
}

function clearChecked() {
	for (var row = 0; row < 15; ++row) {
		for (var col = 0; col < 21; ++col) {
			grid[row][col].checked = false;
		}
	}
}
