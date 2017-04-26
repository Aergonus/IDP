if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// Scene, Camera, Renderer
let renderer	= new THREE.WebGLRenderer();
let scene		= new THREE.Scene();
let camera		= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500);
let controls	= new THREE.PointerLockControls( camera );
let info		= document.getElementById( 'info' );
let controlsEnabled = false;

var player;
var velocity = new THREE.Vector3();
var acceleration = new THREE.Vector3();


// Initialize Three.JS
init();
animate();

// Acquire Pointer Lock
function initPointerLock() {

	blocker = document.getElementById( 'blocker' );
	instructions = document.getElementById( 'instructions' );
	info = document.getElementById( 'info' );

	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				controlsEnabled = true;
				controls.enabled = true;
				
				blocker.style.display = 'none';
				
				//document.addEventListener( 'mousedown', checkmoo, false);
				console.log("Acquired");

			} else {

				controls.enabled = false;
				
				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';
				console.log("Paused");
				//document.removeEventListener( 'mousedown', checkmoo, false);

			}

		};

		var pointerlockerror = function ( event ) {

			instructions.style.display = '';

		};

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.addEventListener( 'click', function ( event ) {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();

		}, false );

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}

}

// Setup Libraries, Acquire Locks, and Load Assets
function init() {
	
	// Acquire Pointer Lock
	initPointerLock();
	
	/*** Start Loading Assets ***/

	/** Initializing Lights **/
	;(function(){
		// add a ambient light
		let ambientLight	= new THREE.AmbientLight( 0x404040 ); // soft white light
		scene.add( ambientLight );
		// new THREE.SpotLight(0xffffff, .25, 0, 10, 2);
		// add a light in front
		var frontlight	= new THREE.DirectionalLight('white', 5)
		frontlight.position.set(0.5, 0.0, 2)
		scene.add( frontlight )
		// add a light behind
		var backlight	= new THREE.DirectionalLight('white', 0.75*2)
		backlight.position.set(-0.5, -0.5, -2)
		scene.add( backlight )
	})()

	/** Loading Enviroment **/
	// Texture Loader
	let textureLoader = new THREE.TextureLoader();
	
	// Later: Todo add Ocean at y=0
	
	// Galaxy
	let galaxyGeometry = new THREE.SphereGeometry(100, 32, 32);
	let galaxyMaterial = new THREE.MeshBasicMaterial({
	  side: THREE.BackSide
	});
	let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

	// Load Galaxy Textures
	textureLoader.crossOrigin = true;
	textureLoader.load(
	  'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/starfield.png',
	  function(texture) {
		galaxyMaterial.map = texture;
		scene.add(galaxy);
	  }
	);
	
	/** Loading Tanks **/
	// Create Player Tank
	player = createTank();
	
	// Scene, Camera, Renderer Configuration
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	THREEx.WindowResize(renderer, camera); // Resize Event Listener

	// camera.position.set(1,1,1);
	camera.position.z = 3;

	scene.add(camera);
	scene.add(controls.getObject());
	scene.add(galaxy);
	
	scene.add(player);

	//scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );
	
	// Keyboard 
	/*
	var updateFcts = [];
	var keyboard = new THREEx.KeyboardState(renderer.domElement);
	renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();
	
	updateFcts.push(function(delta, now){
		if( keyboard.pressed('left') ){
			mesh.rotation.y -= 1 * delta;			
		}else if( keyboard.pressed('right') ){
			mesh.rotation.y += 1 * delta;
		}
		if( keyboard.pressed('down') ){
			mesh.rotation.x += 1 * delta;		
		}else if( keyboard.pressed('up') ){
			mesh.rotation.x -= 1 * delta;		
		}
	})
	// only on keydown
	keyboard.domElement.addEventListener('keydown', function(event){
		if( keyboard.eventMatches(event, 'w') )	mesh.scale.y	/= 2
		if( keyboard.eventMatches(event, 's') )	mesh.scale.y	*= 2
	})
	// only on keyup
	keyboard.domElement.addEventListener('keyup', function(event){
		if( keyboard.eventMatches(event, 'a') )	mesh.scale.x	*= 2
		if( keyboard.eventMatches(event, 'd') )	mesh.scale.x	/= 2
	})
	*/

}

function animate() {
	renderer.render( scene, camera );

	stats.update();

	requestAnimationFrame( animate );
}

/*
// dat.gui
var gui = new dat.GUI();
var guiMarkers = gui.addFolder('Markers');
// dat.gui controls object
var markersControls = new function() {
  this.address = '';
  this.color = 0xff0000;
  this.placeMarker= function() {
    placeMarkerAtAddress(this.address, this.color);
  }
}
guiMarkers.add(markersControls, 'address');
guiMarkers.addColor(markersControls, 'color');
guiMarkers.add(markersControls, 'placeMarker');
guiMarkers.open();
*/
// stats
stats = new Stats();
document.body.appendChild( stats.dom );
