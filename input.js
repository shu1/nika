"use strict";

function mouseDown(event) {
	var x, y, col, row;
	
	if (event.touches) {
		x = event.touches[0].pageX;
		y = event.touches[0].pageY;
	}
	else {
		x = event.offsetX;
		y = event.offsetY;
	}
	
	col = Math.floor((x * scale - gridOffsetX) / cellSize);
	row = Math.floor((y * scale - gridOffsetY) / cellSize);

	hud.inputText = col + "," + row;
	
	event.preventDefault();
}
