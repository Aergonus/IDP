function addEventListeners()
{
    //onWindowResize
    window.addEventListener("resize", onWindowResize, false);
	
	//Keyboard Event Listener
	window.document.addEventListener("keydown", onDocumentKeyDown, false);
	window.document.addEventListener("keyup", onDocumentKeyUp, false);

	//Clicker
	//document.getElementById("someelement").addEventListener("click", functiontocall);
}

function onWindowResize(event)
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	composer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( window.innerWidth, window.innerHeight );
/*	if(min < canvas.width || min < canvas.height)
		gl.viewport(0,canvas.height-min, min, min); 
		//resize viewport where min is minimum of innerheight/width*/
	// controls.handleResize();
	animate();
}

var keyMappings = 
{
	'9'  : 'tab',
	'16' : 'shift',
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
};

var pause = true;

function onDocumentKeyDown(event)
{
	switch ( event.keyCode ) {
		case 9 : // tab
		case 80: // p
			pause = !pause; break;//changeControl(); break;
		case 87: // w
		case 38: // up
			moveForward = true; break;
		case 65: // a
		case 37: // left
			moveLeft = true; break;
		case 83: // s
		case 40: // down
			moveBackward = true; break;
		case 68: // d
		case 39: // right
			moveRight = true; break;
		case 32: // space
			moveUp = true; break;
		case 16: // shift
			moveDown = true; break;
		default:
			if (event.shiftKey) {
				moveDown = true; break;
			}
			break;
	}
}

function onDocumentKeyUp(event)
{
	switch ( event.keyCode ) {
		case 87: // w
		case 38: // up
			moveForward = false; break;
		case 65: // a
		case 37: // left
			moveLeft = false; break;
		case 83: // s
		case 40: // down
			moveBackward = false; break;
		case 68: // d
		case 39: // right
			moveRight = false; break;
		case 16: // shift
			moveDown = false; break;
		default:
			if (!event.shiftKey) {
				moveDown = false; break;
			}
			break;
	}
}
