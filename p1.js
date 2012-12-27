/* 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Title : Project 1 Sliding Block Puzzle
Author : 
Created : 
Modified : 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/

var _image_path = "HumptyDumpty.jpg";
var _image_width =  491;
var _image_height = 576;

var _num_rows = 5;
var _num_cols = 4;

var _tile_width = _image_width / _num_cols;
var _tile_height = _image_height / _num_rows;

var _empty_tile = {row:0, col: 0};
var _tiles = [];
var _empty_neighbors = [];

//Number of pixels to jump in each animation frame.
var _animation_size = 0;
//Number of milliseconds per animation frame.
var _animation_speed = 0;
//How long it takes to run the animatiom
var _animation_run_time = 0;

//Make sure the user can't click tiles while shuffle is running
var _shuffle_running = false;

//Make sure the user can't modify anything until they click "Begin"
var _begin_clicked = false;


/*
 * Summary: Create a div for each tile that should hold a part of the picture, and add it to the game_container.
 * Returns: undefined
 */
function createTiles(){
	for(var row = 0; row < _num_rows; row++){
		for(var col = 0; col < _num_cols; col++){
			//Ensure we're not making a div for the empty tile
			if ((col !== _empty_tile.col) || (row !== _empty_tile.row)) {
				var newTile = createDiv(row, col, _tile_width, _tile_height);
				_tiles.push(newTile);
				document.getElementById("game_container").appendChild(newTile);
			}
		}
	}
	return;
}

/*
 * Summary: Should return a div with the specified width and height 
 * and put it at the supplied row and column
 * Parameters:  row: The row the returned object should be in (0-based)
				col: The column the returned object should be in (0-based)
				width: The width of the returned object.
				height: The height of the returned object.
 * Returns: The div you created
 */
function createDiv(row, col, width, height){
	var newTile = document.createElement("div");
	
	newTile.row = row;
	newTile.col = col;
	newTile.width = width;
	newTile.height = height;
	
	newTile.style.backgroundImage = _image_path;
	newTile.style.top = row*height + "px";
	newTile.style.left = col*width + "px";
	newTile.style.width = width + "px";
	newTile.style.height = height + "px";
	
  // Set the div's background
	newTile.style.backgroundImage = "url(\"" + _image_path + "\")";
	//Have to move the picture to the proper place to capture the proper segment.
	newTile.style.backgroundPosition = -1*col*width + "px " + -1*row*height + "px";
	
  // Keep track of whether the tile is immediately adjacent to the empty tile and can thus be moved.
	newTile.isMoveable = isAdjToEmpty(newTile);
	
	if (newTile.isMoveable !== false) {
		//Add a class to enable changing the opacity on hovering
		newTile.className += "isMoveable";
		_empty_neighbors.push(newTile);
	}
	//Used to prevent user from clicking on tile mid-animation
	newTile.isClickable = true;
	
	newTile.onclick = tileClicked;
	
  // add an event handler that will execute some function you define that will move the 
  // clicked div to the empty tile location if the div is in a valid position
	newTile.slide = function() {
		if (this.isMoveable === "ABOVE") {
			this.row += 1;
			this.animate(true, true, true);
			_empty_tile.row -= 1;
		}
		else if (this.isMoveable === "BELOW") {
			this.row -= 1;
			this.animate(true, false, true);
			_empty_tile.row += 1;
		}
		else if (this.isMoveable === "LEFT") {
			this.col += 1;
			this.animate(false, true, true);
			_empty_tile.col -= 1;
		}
		else if (this.isMoveable === "RIGHT") {
			this.col -= 1;
			this.animate(false, false, true);
			_empty_tile.col += 1;
		}
		//Update to find the new cells adjacent to the empty cell
		updateAdjacencies();
	}
	
	//Animate the tile while it's being moved.
	//NOTE: This is done by hand, and doesn't include jQuery
	newTile.animate = function(yDir, add, firstCall) {
		var oldPlace;
		var newDestination;
		var increment;
		//Find the final destination in the y-direction for a tile that's
		//being moved up or down
		if (yDir) {
			oldPlace = parseFloat(newTile.style.top);
			newDestination = (newTile.row)*newTile.height;
		}
		//Find the final destination in the x-direction for a tile that's
		//being moved left or right
		else {
			oldPlace = parseFloat(newTile.style.left);
			newDestination = (newTile.col)*newTile.width;
		}
		//The first time the function is called, calculate the running time of the 
		//animation so we can wait the proper amount of time when scrambling
		if (firstCall) {
			_animation_run_time = (Math.abs(oldPlace - newDestination) / _animation_size) * _animation_speed;
		}
		//Keep moving the tile as long as it's not too close to its final location
		if (Math.abs(oldPlace - newDestination) > (_animation_size)) {
			if (add) increment = oldPlace + (_animation_size);
			else increment = oldPlace - (_animation_size);
			if (yDir) newTile.style.top = increment + "px";
			else newTile.style.left = increment + "px";
			//Wait a certain amount of time and move the tile again
			setTimeout(function(){newTile.animate(yDir,add, false)}, _animation_speed);
		}
		//After the animation is done, line up the tile exactly.
		else {
			if (yDir) newTile.style.top = newDestination + "px";
			else newTile.style.left = newDestination + "px";
			//The animation is done so we can click the tile again
			newTile.isClickable = true;
		}
	}
	
	return newTile;
}

/*
 * Summary: Find all the tiles that are next to the empty tile, and stores them
 * 			in an array
 * Returns: undefined
 */
function updateAdjacencies() {
	_empty_neighbors = [];
	for (var i = 0; i < _tiles.length; i++) {
		_tiles[i].className = "";
		_tiles[i].isMoveable = isAdjToEmpty(_tiles[i]);
		//If a tile can be moved, that means it's next to the empty tile
		if (_tiles[i].isMoveable !== false) {
			_tiles[i].className += "isMoveable";
			_empty_neighbors.push(_tiles[i]);
		}
	}
	return;
}

/*
 * Summary: Returns whether tile is immediately adjacent to the empty tile and can thus be moved.
 * Parameters: tile: The tile to be checked for adjacency
 * Returns: A string that indicates the tile's relative position to 
 *			the empty tile if it is adjacent, and false otherwise.
*/
function isAdjToEmpty(tile) {
	var aboveEmpty = _empty_tile.row - 1;
	var belowEmpty = _empty_tile.row + 1;
	var leftOfEmpty = _empty_tile.col - 1;
	var rightOfEmpty = _empty_tile.col + 1;
	
	//Tile immediately above empty
	if ((tile.col === _empty_tile.col) && (aboveEmpty >= 0) && (tile.row === aboveEmpty)) {
		return "ABOVE";
	}
	//Tile immediately below empty
	else if ((tile.col === _empty_tile.col) && (belowEmpty < _num_rows) && (tile.row === belowEmpty)) {
		return "BELOW";
	}
	//Tile immediately to the left of empty
	else if ((tile.row === _empty_tile.row) && (leftOfEmpty >= 0) && (tile.col === leftOfEmpty)) {
		return "LEFT";
	}
	//Tile immediately to the right of empty
	else if ((tile.row === _empty_tile.row) && (rightOfEmpty < _num_cols) && (tile.col === rightOfEmpty)) {
		return "RIGHT";
	}
	return false;
}

/*
 * Summary: Move a tile around if it meets certain conditions and is clicked
 * Parameters: event: An object detailing the object that got clicked
 */
function tileClicked(event) {
	var tileToMove = event.target;
	if (tileToMove.isMoveable !== false && tileToMove.isClickable && _shuffle_running === false && _begin_clicked) {
		//Ensure the user can't click a tile while it's being animated
		tileToMove.isClickable = false;
		tileToMove.slide();
	}
	return;
}

/*
 * Summary: Shuffle up the tiles in the beginning of the game
 * Parameter: counter: Number of items that have been shuffled
 * Returns: undefined
 */
function shuffleTiles(counter){
	_begin_clicked = true;
	_shuffle_running = true;
	//Number of times to shuffle
	var limit = _num_rows*_num_cols*4;
	_animation_speed = 1;
	_animation_size = 40;
	if (counter !== limit) {
		var randomIndex = Math.floor(Math.random()*_empty_neighbors.length);
		//Move a random tile adjacent to the empty tile
		_empty_neighbors[randomIndex].slide();
		//Wait so that all tiles aren't sliding at once.
		setTimeout(function(){shuffleTiles(counter + 1)}, _animation_run_time + _animation_speed + 200);
	}
	else {
		_shuffle_running = false;
		_animation_speed = 1;
		_animation_size = 6;
		return;
	}
}

/*
 * Summary: Generates a random puzzle, with the number of rows and cols being 
 *	potentially any number from 2-(2 + max-1), inclusive.
 */
function generateRandomPuzzle(){
	var max = 6;
	_num_cols = 2 + Math.floor(Math.random()*max);
	_tile_width = _image_width / _num_cols;
	_num_rows = 2 + Math.floor(Math.random()*max);
	//Fix weird bug that happens when there are exactly 5 rows
	while (_num_rows === 5) {
		_num_rows = 2 + Math.floor(Math.random()*max);
	}
	_tile_height = _image_height / _num_rows;
}

/*
 * Summary: Scroll the whole page down when the user clicks "begin"
 * NOTE: This is the only time jQuery is used, and it is not directly
 * related to the implementation of the game.
 * Returns: false
 */
$('a#begin').click(function(){
	//Erase the button so the user can't click it again and mess everything up
	this.style.display = "none";
	createTiles();
	//Scroll the whole page down
	$('html, body').animate({scrollTop: 900}, 2500); 
	//Wait a bit, then call shuffleTiles
	setTimeout(function(){shuffleTiles(0)}, 3000);
	return false; 
});

 /*
 * When the page loads, create our puzzle
 */
window.onload = function () {
	//Set the height and width of the primary HTML components.
	document.getElementById("game_container").style.width = _image_width + "px";
	document.getElementById("game_container").style.height = _image_height + "px";
	document.getElementById("game_background").style.width = _image_width + "px";
	document.getElementById("game_background").style.height = _image_height + "px";
	//Set the background of the game_background to the image. The opacity is pretty low.
	document.getElementById("game_background").style.backgroundImage =  "url(\"" + _image_path + "\")";
	document.getElementById("solid_back").style.width = _image_width + "px";
	document.getElementById("solid_back").style.height = _image_height + "px";
    //generate parameters for a random puzzle
    generateRandomPuzzle();
}