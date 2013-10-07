"use strict";

function menuButton(button) {
	if (button == 0) {
		menuMan.show = !menuMan.show;
	}
	else if (menuMan.show) {
		switch(button) {
		case 1:
			gameMan.debug = !gameMan.debug;
			break;
		case 2:
			nextTutorial();
			break;
		case 3:
			ai();
			break;
		case 4:
			useAction(2);
			break;
		case 5:
			undo();
			break;
		}
	}
}

function getXY(event) {
	if (event.touches) {
		inputMan.x = event.touches[0].pageX;
		inputMan.y = event.touches[0].pageY;
	}
	else {
		inputMan.x = event.layerX;
		inputMan.y = event.layerY;
	};;;;

	// check menu
	if (inputMan.x < canvas.width && inputMan.x > canvas.width - menuMan.width
	&& inputMan.y < canvas.height && inputMan.y > canvas.height - menuMan.height
	&& gameMan.mode == 1) {
		for (var row = 0; row < menuMan.rows; ++row) {
			for (var col = 0; col < menuMan.cols; ++col) {
				if (inputMan.x > canvas.width - menuMan.bWidth * (col+1) && inputMan.y > canvas.height - menuMan.bHeight * (row+1)) {
					menuMan.button = row * menuMan.cols + col;
					if (menuMan.button < buttons.length) {
						hudMan.inputText = buttons[menuMan.button];
					}
					return true;
				}
			}
		}
	}

	// no menu, so grid
	inputMan.col = Math.floor((inputMan.x - mediaMan.x) / (cellSize * mediaMan.scale));
	inputMan.row = Math.floor((inputMan.y - mediaMan.y) / (cellSize * mediaMan.scale));
	inputMan.rot = -1;
	hudMan.inputText = inputMan.row + "," + inputMan.col;
	return false;
}

function getRot(dX, dY) {
	if (grid[gameMan.pRow][gameMan.pCol].kind != 3) {	// not for routed pieces
		inputMan.row = gameMan.pRow;
		inputMan.col = gameMan.pCol;

		if (dX >= dY && dX <= -dY) {	// up
			inputMan.row--;
			inputMan.rot = 0;
		}
		else if (dX >= dY && dX >= -dY) {	// right
			inputMan.col++;
			inputMan.rot = 1;
		}
		else if (dX <= dY && dX >= -dY) {	// down
			inputMan.row++;
			inputMan.rot = 2;
		}
		else {	// left
			inputMan.col--;
			inputMan.rot = 3;
		}
	}
}

function mouseDown(event) {
	inputMan.menu = getXY(event);

	switch (gameMan.mode) {
		case 0:
			
			break;
		case 1:
			if (!inputMan.menu) {
				getPiece(inputMan.row, inputMan.col);
				if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {
					inputMan.pX = mediaMan.x + (gameMan.pCol * cellSize + cellSize/2) * mediaMan.scale;
					inputMan.pY = mediaMan.y + (gameMan.pRow * cellSize + cellSize/2) * mediaMan.scale;
				}
				else {
					inputMan.pX = inputMan.x;
					inputMan.pY = inputMan.y;
					gameMan.selection = false;	// back to normal selection if you deselect pieces
					phalanx.length = 0;
					
				}
				
			}
			break;
	}

	event.preventDefault();
	hudMan.soundText = "";
	hudMan.inputText = "";
	hudMan.inputText += " down";
	inputMan.click = true;
	mediaMan.draw = true;
}

function mouseMove(event) {
	if (inputMan.click) {
		getXY(event);

		switch (gameMan.mode) {
		case 0:
			
			break;
		case 1:
			if (!inputMan.menu) {
				var dX = inputMan.x - inputMan.pX;
				var dY = inputMan.y - inputMan.pY;
				if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, rotate it
					if (Math.abs(dX) > cellSize/2 * mediaMan.scale || Math.abs(dY) > cellSize/2 * mediaMan.scale) {	// inside cell is deadzone
						getRot(dX, dY);
						rotatePiece(gameMan.pRow, gameMan.pCol, inputMan.rot);
					}
					event.preventDefault();
				}
				else {	// pan
					if (pan(dX, dY)) {
						hudMan.inputText = -mediaMan.x + "," + -mediaMan.y;
						
					}
					inputMan.pX = inputMan.x;
					inputMan.pY = inputMan.y;
				}
			}
			break;
		}
		event.preventDefault();
		mediaMan.draw = true;
	}
}

function mouseUp(event) {
	if (inputMan.click) {
		hudMan.inputText += " up";

		switch (gameMan.mode) {
		case 0:
			if (mainMenu(inputMan.row,inputMan.col)) {
				inputMan.time = 0;
			}
			break;
		case 1:
			if (inputMan.menu) {
				menuButton(menuMan.button);
			}
			else if (!dblClick(event)) {
				if (movePiece(gameMan.pRow, gameMan.pCol, inputMan.row, inputMan.col)) {
					inputMan.time = 0;
					gameMan.selection = false;	// after move always get out of selection mode
				}
				else if (gameMan.selection && inputMan.row == gameMan.pRow && inputMan.col == gameMan.pCol) { // remove from phalanx
					togglePhalanxPiece(inputMan.row, inputMan.col);
				}
			}
			break;
		}

		inputMan.menu = false;
		inputMan.click = false;
		mediaMan.play = true;
		mediaMan.draw = true;
	}
}

function dblClick(event) {
	var time = Date.now();
	if (time - inputMan.time < 300) {	// double click time in milliseconds
		hudMan.inputText += " " + (time - inputMan.time) + "ms";
		event.preventDefault();

		if (gameMan.pRow >= 0 && gameMan.pCol >= 0) {	// if there's a piece, toggle selection mode
			gameMan.selection = !gameMan.selection;
			phalanx.length = 0;
			if (gameMan.selection) {
				phalanx.push({row:gameMan.pRow, col:gameMan.pCol});	
			}
			else {
				getPiece(gameMan.pRow, gameMan.pCol);
			}
		}
		else {
			zoom();
		}
		inputMan.time = 0;	// reset so next click is not double click
		return true;
	}
	inputMan.time = time;
	return false;
}
