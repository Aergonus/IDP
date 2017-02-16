function addEventListeners()
{
    //onWindowResize
    window.addEventListener("resize", onWindowResize, false);
	
	//Keyboard Event Listener
	window.document.addEventListener("keydown", onDocumentKeyDown, false);
	window.document.addEventListener("keyup", onDocumentKeyUp, false);

	//Scrambler
	//document.getElementById("scramble").addEventListener("click", ScrambleCube);
	
	//Save File Exporter
	//document.getElementById("export").addEventListener("click", saveCubes);
	
	//Save File Importer
	//document.getElementById("import").addEventListener("click", loadCubes);
}

function onWindowResize(event)
{
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
/*	if(min < canvas.width || min < canvas.height)
		gl.viewport(0,canvas.height-min, min, min); 
		//resize viewport where min is minimum of innerheight/width*/
	// controls.handleResize();
	tick();
}

var keyMappings = 
{
	'32' : 'space',
	'38' : 'up',
	'87' : 'W',
	'37' : 'left',
	'65' : 'A',
	'40' : 'down',
	'83' : 'S',
	'39' : 'right',
	'68' : 'D',
	'80' : 'P',
/*
	'66' : 'B',
	'68' : 'D',
	'70' : 'F',
	'76' : 'L',
	'82' : 'R',
	'85' : 'U',
	'88' : 'X',
	'89' : 'Y',
	'90' : 'Z'
*/
};
var pause = true, jumped = false;
function onDocumentKeyDown(event)
{
	switch ( event.keyCode ) {
		case 9 : // tab
		case 80:
			pause = !pause; break;//changeControl(); break;
		case 87: // w
			moveForward = true; break;
		case 38: // up
			panUp = true; break;
		case 65: // a
			moveLeft = true; break;
		case 37: // left
			panLeft = true; break;
		case 83: // s
			moveBackward = true; break;
		case 40: // down
			panDown = true; break;
		case 68: // d
			moveRight = true; break;
		case 39: // right
			panRight = true; break; 
		case 32: // space
			if ( canJump === true ) {
				velocity.y += 45;
				jumped = true;
				console.log("Added velocity");
			}
			canJump = false;
			break;
	}

/*
	var kc = event.keyCode.toString();
	if (keyMappings.hasOwnProperty(kc)) 
	{
		direction = event.shiftKey ? 1 : -1;
		var rot = new Object();
		rot = { "kc" : event.keyCode, "dir" : direction, "current" : false };
		rotations.push(rot);
	}
	//toRot(event.keyCode, event.shiftKey);
*/
}

function onDocumentKeyUp(event)
{
	switch ( event.keyCode ) {
		case 87: // w
			moveForward = false; break;
		case 38: // up
			panUp = false; break;
		case 65: // a
			moveLeft = false; break;
		case 37: // left
			panLeft = false; break;
		case 83: // s
			moveBackward = false; break;
		case 40: // down
			panDown = false; break;
		case 68: // d
			moveRight = false; break;
		case 39: // right
			panRight = false; break; 
	}
}
