"use	strict";

defGrid = null;

function	newState	(){
	var	s	=	{
		//action	:	-1	//Action	taken
		value	:	0,	//Value	of	state	after	board	state	adjustments
		//totalValue	:	0,	//Total	value	of	all	the	pieces
		board : grid //grid object, state of board after this move, will be applied to board upon ai exit.
		//pieces	:	[],	//All	the	pieces	and	their	properties
		//pieceValues	:	[]
	};
	return s;
}

function	ai(){
	storeGrid();
	//setGrid(grid,defGrid)
	var	pieces	=	[];
	pieces = getAIPieces();

	//Checks	if	any	pieces	are	close	enough	to	win.
	for	(var	i	=	0;	i<6;	i++){
		var	d	=	getDistanceFromGoal(pieces[i].row,pieces[i].col,gameMan.player);
		//console.log(d);
		if(d<=2){
			if(d==1){
				//1	move
				console.log("1 space away.");
			}
			else if(d==2){
				//2	moves
				console.log("2 spaces away.");
			}
		}
	}

	//Creates the default state in which all other states are compared to.
	var	defaultState	=	newState();
	//defaultState.board	=	grid;
	//console.log("Default init: " + defaultState.value);
	getValue(defaultState,pieces);
	console.log("For Player"	+	gameMan.player	+	", the value of	this state is	"	+	defaultState.value);
	var bestState = defaultState; //Stores best state, which is default at this point. Altough we might be better off just setting best state.

	var	rallySpots	=	[];
	for	(var	row	=	0	;	row	<	15;	++row)	{
		for	(var	col	=	0;	col	<	21;	++col)	{
			if(grid[row][col].kind	==	3	&&	grid[row][col].city	==	pieces[0].player	&&	grid[row][col]	<	0){
				rallySpots.push(grid[row][col]);
			}
		}
	}

	//EACH PIECE CHECKING =============
	for(var	i	=	0;	i<6;	i++){
		if(pieces[i].kind	==	3){
			for(var	j	=	0;	j<rallySpots.length;	j++){
				//Value	piece.	Make	separate	functions	for	checking	adjacent,	rot,	whatever.
				//Then check	distance	to	goal,	to	ensure	frontmost	placement.	Although	there	could	be	a	more	efficient	way	of	doing	this.
				//OR	JUST	GET	THE	SPACE	FARTHEST	FROM	THE	EDGE	(Athens	farthest	from	bottom,	sparta	from	left,	etc...)
			}
		}
		else{
			//	Do	normal	move	check,	which	means	rotation,	then	movement.
			origRot = pieces[i].rot;
			for	(var	rot	=	0;	rot<4;	rot++){
				//var	tempState	=	defaultState;
				if(rot!=origRot){
					pieces[i].rot=rot;
					var temp = copyState(defaultState);
					getValue(temp,pieces);
					if(temp.value>bestState.value){
						bestState=temp;
						console.log("Found better state by ROTATION with a value of: " + bestState.value);
					}
				}
			}
			setGrid(defGrid,grid);
			pieces = getAIPieces();
			//pieces[i].rot=origRot;
			for (var dir = 0; dir<4; dir++){
				//Check moves in each direction
				var incRow; //Increment row by this
				var incCol; //Increment col by this
				switch(dir){
					case 0:
						incRow = -1;
						incCol = 0;
						break;
					case 1:
						incRow = 0;
						incCol = 1;
						break;
					case 2:
						incRow = 1;
						incCol = 0;
						break;
					case 3:
						incRow = 0;
						incCol = -1;
						break;
				}

				phalanx=[pieces[i]];
				var pRow = pieces[i].row;
				var pCol = pieces[i].col;
				var tRow = pieces[i].row+incRow;
				var tCol = pieces[i].col+incCol;
				var origRot = pieces[i].rot;
				if(checkMove(pRow,pCol,tRow,tCol)){
					if(pushPiece(pRow,pCol,tRow,tCol,pieces[i],1)){
						moveOnePiece(pRow, pCol, tRow, tCol);
						pieces = getAIPieces();
						var temp = copyState(defaultState);
						getValue(temp,pieces);
						if(temp.value>bestState.value){
							bestState=temp;
							console.log("Found better state by MOVEMENT with a value of: " + bestState.value);
						}
						//moveOnePiece(tRow, tCol, pRow, pCol);
						//pieces[i].rot = origRot;

						setGrid(defGrid,grid);
						pieces = getAIPieces();
					}
				}
				phalanx=[];
			}
		}
	}

	setGrid(defGrid,grid);
	//PHALANX CHECKING =====================
	for(var i=0; i<4; i++){
		same_dir=[];
		for	(var p=0;	p<6; p++){
			if(pieces[p].rot==i){
				same_dir.push(pieces[p]);
			}
		}
		//console.log(same_dir);
		if(same_dir.length>1){
			//console.log("HERE!");
			combinations = getCombinations(same_dir);
			combinations.forEach(function(e){
				//console.log(e);
				phalanx.length=0;
				phalanx = e.slice(0);
				if(isPhalanx()){
					for(var rot=0;rot<4;rot++){
						if(rot!=i){
							//console.log(rot);
							//console.log(phalanx);
							rotatePiece(phalanx[0].row, phalanx[0].col, rot);
							pieces = getAIPieces();
							var temp = copyState(defaultState);
							getValue(temp,pieces);
							if(temp.value>bestState.value){
								bestState=temp;
								console.log("Found better state by ROTATING A PHALANX with a value of: " + bestState.value);
							}
							setGrid(defGrid,grid);
							pieces = getAIPieces();
						}
					}
					for(var rot=0;rot<4;rot++){
						setGrid(defGrid,grid);
						pieces = getAIPieces();
						var incRow; //Increment row by this
						var incCol; //Increment col by this
						switch(rot){
							case 0:
								incRow = -1;
								incCol = 0;
								break;
							case 1:
								incRow = 0;
								incCol = 1;
								break;
							case 2:
								incRow = 1;
								incCol = 0;
								break;
							case 3:
								incRow = 0;
								incCol = -1;
								break;
						}
						//console.log("inc: ",incRow,incCol);
						//console.log("Phalanx: ", phalanx, phalanx[0]);
						var pRow = phalanx[0].row;
						var pCol = phalanx[0].col;
						var tRow = phalanx[0].row+incRow;
						var tCol = phalanx[0].col+incCol;
						//console.log(rot);
						//console.log(phalanx);
						//console.log(pRow,pCol,tRow,tCol);
						movePiece(pRow,pCol,tRow,tCol,true);
						phalanx = e.slice(0);
						pieces = getAIPieces();
						var temp = copyState(defaultState);
						getValue(temp,pieces);
						if(temp.value>bestState.value){
							bestState=temp;
							console.log("Found better state by MOVING A PHALANX with a value of: " + bestState.value);
						}
						setGrid(defGrid,grid);
						pieces = getAIPieces();
						//console.log("After Reset: ", phalanx);
					}
				}
			});
		}
	}

	//AFTER ALL CHECKING IS DONE ===========
	setGrid(bestState.board,grid);
	phalanx=[];
	//grid=bestState;
	if(gameMan.actions<2){
		pushGameState();
	}
	useAction(1);
	displayMan.draw=true;
}

function	getValue(state,pieces){
	for	(var	i	=	0;	i<6;	i++){
	//	console.log("Piece " + i +  ", Row: " + pieces[i].row + ", Col: " + pieces[i].col + ".");
		var	val	=	0;
		//Piece	on	Board
		if(pieces[i].kind!=3){
		//	console.log(i);
			val+=5;
		}
		//Adjacent	Check
		var	adj	=	[];
		adj[0] = grid[pieces[i].row-1][pieces[i].col];//N
		adj[1] = grid[pieces[i].row][pieces[i].col+1];//E
		adj[2] = grid[pieces[i].row+1][pieces[i].col];//S
		adj[3] = grid[pieces[i].row][pieces[i].col-1];//W
		//TODO:	Check	everything	to	make	sure	on	field.
		for(var	j=0;	j<4;	j++){
			if(adj[j].kind!=-1){
				//Is	a	piece
				if(adj[j].player>-1){
					//Own
					if(adj[j].player==pieces[i].player){
					// console.log("Adjacent " + j + " is own.");
						if(adj[j].rot==pieces[i].rot){
						// console.log("Adjacent " + j + " is in phalanx");
							val+=6;//In	Phalanx
						}
						else{
						// console.log("Adjacent " + j + " is not in phalanx");
							val+=2;//Not in Phalanx
						}
					}
					//Ally
					else if(Math.abs((adj[j].player-pieces[i].player)%2)==0){
						if(adj[j].rot==pieces[i].rot){
							val+=3;//Facing	Same	dir
						}
						else{
							val+=1;//Diff	dir
						}
					}
					//Enemy
					else{
						if(pieces[i].rot == j && Math.abs((adj[j].rot-j)%2)==0){
							//Facing	each	other
							//TODO BROKEN Will return true for pieces facing away from eachother too.
							val-=1
						}
						else if(pieces[i].rot==j){
							//If	piece	is	facing	adj,	but	they	aren't	facing	eachother,	then	adj	is	routable
							val+=5;
							//Move	2:	+2
						}
						else if(Math.abs((adj[j].rot-j)%2)==0){
							//Else if	we're	not	facing	adjacent,	check	if	he's	facing	us.
							val-=5;
							//Move	2:	-12
						}
						else{
							//Adjacent	but	not	facing	each	other.
							val+=2;	//We	can	rout	enemy	as	single.
							//Move	2:	-8
						}
					}
				}
			}
		}
		val-=5*getDistanceFromGoal(pieces[i].row,pieces[i].col,gameMan.player);
		state.value+=val; //Adds piece	value	to	total	value
		//console.log("State Value: " + state.value);
	}
	//Subtract for every piece on	the	board
	//state.value=state.totalValue;
	for	(var	row	=	0;	row	<	15;	++row)	{
		for	(var	col	=	0;	col	<	21;	++col)	{
			if	(grid[row][col].player>-1	&& Math.abs(gameMan.player-grid[row][col].player)%2!=0	&&	grid[row][col].kind!=3)	{
				state.value-=5;
			}
		}
	}
	//state.board=(grid);
	//useAction(1);
	//displayMan.draw=true;
}

function copyState(original){
	var o = original.board;
	var s = newState();
	b=new Array(15);
	for	(var row =	0; row	<	15;	++row){
		b[row]=new Array(21);
		for	(var col = 0; col	<	21;	++col){
			var p = {}
			p.row=row;
			p.col=col;
			p.checked=o[row][col].checked;
			p.player=o[row][col].player;
			p.kind=o[row][col].kind;
			p.city=o[row][col].city;
			p.rot=o[row][col].rot;
			p.ring=o[row][col].ring;
			p.prompt=o[row][col].prompt;
			b[row][col]=p;
		}
	}
	s.board=b;
	return s;
}

function setGrid(gFrom, gTo){
	for	(var row =	0; row	<	15;	++row){
		for	(var col = 0; col	<	21;	++col){
			// if(grid[row][col].player != board[row][col].player){
			// 	console.log("Player moved");
			// }
			gTo[row][col].row=row;
			gTo[row][col].col=col;
			gTo[row][col].checked=gFrom[row][col].checked;
			gTo[row][col].player=gFrom[row][col].player;
			gTo[row][col].kind=gFrom[row][col].kind;
			gTo[row][col].city=gFrom[row][col].city;
			gTo[row][col].rot=gFrom[row][col].rot	;
			gTo[row][col].ring=gFrom[row][col].ring;
			gTo[row][col].prompt=gFrom[row][col].prompt;
		}
	}
}

// get distance to goal - to be used in ai evaluation
function getDistanceFromGoal(row, col, player) {

	//resetPieces(row, col);

	if (player == 0) {
		if (row <= 5 && col >= 9 && col <= 11) { // in 3x3 square in front of goal
			return (row-2);
		}
		if (row <= 5 && col >= 6 && col <= 8) { // in Messenian territory "west" of 3x3 square
			return (row-3) + (8-col) + 2;
		}
		if (row <= 5 && col >= 12 && col <= 14) { // in Messenian territory "east" of 3x3 square
			return (row-3) + (col-12) + 2;
		}
		if (row >= 3 && row <= 11 && col >= 3 && col <= 5) { // in Spartan territory
			return (row-3) + (5-col) + 5;
		}
		if (row >= 3 && row <= 11 && col >= 15 && col <= 17) { // in Theban territory
			return (row-3) + (col-15) + 5;
		}
		if (row >= 9 && col >= 6 && col <= 10) { // in "west" half of Athenian territory (including rally areas)
			return (row-9) + (col-5) + 11;
		}
		if (row >= 9 && col >= 11 && col <= 14) { // in "east" half of Athenian territory (including rally areas)
			return (row-9) + (15-col) + 11;
		}
	}

	if (player == 1) {
		if (row >= 6 && row <= 8 && col >= 15) { // in 3x3 square in front of goal
			return (18-col);
		}
		if (row >= 3 && row <= 5 && col >= 3) {	// in long rectangle "north" of goal
			return (5-row) + (17-col) + 2;
		}
		if (row >= 9 && row <= 11 && col >= 3) { // in long rectangle "south" of goal
			return (row-9) + (17-col) + 2;
		}
		if (row >= 6 && row <= 7 && col <= 5) { // in "north" 2x6 rectangle between center and back of rally area
			return (row-5) + (5-col) + 14;
		}
		if (row == 8 && col <= 5) { // in "south" 1x6 rectangle between center and back of rally area
			return (9-row) + (5-col) + 14;
		}
	}

	if (player == 2) {
		if (row >= 9 && col >= 9 && col <= 11) { // in 3x3 square in front of goal
			return (12-row);
		}
		if (row >= 9 && col >= 6 && col <= 8) { // in Athenian territory "west" of 3x3 square
			return (11-row) + (8-col) + 2;
		}
		if (row >= 9 && col >= 12 && col <= 14) { // in Athenian territory "east" of 3x3 square
			return (11-row) + (col-12) + 2;
		}
		if (row >= 3 && row <= 11 && col >= 3 && col <= 5) { // in Spartan territory
			return (11-row) + (5-col) + 5;
		}
		if (row >= 3 && row <= 11 && col >= 15 && col <= 17) { // in Theban territory
			return (11-row) + (col-15) + 5;
		}
		if (row <= 5 && col >= 6 && col <= 10) { // in "west" half of Messenian territory (including rally areas)
			return (5-row) + (col-5) + 11;
		}
		if (row <= 5 && col >= 11 && col <= 14) { // in "east" half of Messenian territory (including rally areas)
			return (5-row) + (15-col) + 11;
		}
	}

	if (player == 3) {
		if (row >= 6 && row <= 8 && col <= 5) {	// in 3x3 square in front of goal
			return (col-2);
		}
		if (row >= 3 && row <= 5 && col <= 17) { // in long rectangle "north" of goal
			return (5-row) + (col-3) + 2;
		}
		if (row >= 9 && row <= 11 && col <= 17) { // in long rectangle "south" of goal
			return (row-9) + (col-3) + 2;
		}
		if (row >= 6 && row <= 7 && col >= 15) { // in "north" 2x6 rectangle between center and back of rally area
			return (row-5) + (col-15) + 14;
		}
		if (row == 8 && col >= 15) { // in "south" 1x6 rectangle between center and back of rally area
			return (9-row) + (col-15) + 14;
		}
	}

	return -1;

}

function storeGrid(){
	var pGrid = new Array(15);
	for (var row = 0; row < 15; ++row) {
		pGrid[row] = new Array(21);
		for (var col = 0; col < 21; ++col) {
			var cell = {
				checked: grid[row][col].checked,
				player : grid[row][col].player,
				kind   : grid[row][col].kind,
				city   : grid[row][col].city,
				rot    : grid[row][col].rot,
				ring   : grid[row][col].ring
			}
			pGrid[row][col] = cell;
		}
	}
	defGrid=pGrid;
}

function getAIPieces(){
	var p = [];
	for	(var	row	=	0;	row	<	15;	++row)	{
		for	(var	col	=	0;	col	<	21;	++col)	{
			if	(grid[row][col].player	==	gameMan.player)	{
				p.push(grid[row][col]);
			}
		}
	}
	return p;
}

function getCombinations(pieces) {
  var result = [];

  var f = function(prefix, checking) {
    for (var i = 0; i < checking.length; i++) {
      result.push(prefix.concat(checking[i]));
      f(prefix.concat(checking[i]), checking.slice(i + 1));
    }
  }
  f([], pieces);
  return result;
}
