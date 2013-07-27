function mouseDown(event) {
	var x, y, r, c;
	
	if (event.touches) {
		x = event.touches[0].pageX;	// TODO: pageX/Y may not be the right property to use
		y = event.touches[0].pageY;
	}
	else {
		x = event.offsetX;
		y = event.offsetY;
	}
	
	c = Math.floor((x*2 - gridOffsetX) / cellWidth);
	r = Math.floor((y*2 - gridOffsetY) / cellHeight);
	alert(x + ", " + y + ". " + c + ", " + r);
	
	event.preventDefault();
}
