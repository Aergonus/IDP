// Global Object Variables
var camera, scene, renderer,
	geometry, material, mesh,
	pointLight, spotLight, highLight;

var stats;
var clock = new THREE.Clock(), delta = clock.getDelta();
var objects = [];
var raycaster;
var controls, fpsControls, plControls,
	controlsEnabled 	= false, 
	fpsControlsEnabled 	= false, 
	plControlsEnabled 	= false;

// Field variables to set Scene Dimensions
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;
var aspectRatio = canvasWidth / canvasHeight;

// Camera Attributes
var VIEW_ANGLE = 50,
  ASPECT_RATIO = aspectRatio,
  NEAR = 0.1,
  FAR = 1000; // To redo: dynamically change based on zoom

// Defs
var PI_2 = Math.PI / 2,
	rad45 = Math.PI / 4,
    rad90 = Math.PI / 2,
    rad180 = Math.PI,
    rad360 = Math.PI * 2,
    deg2rad = Math.PI / 180,
    rad2deg = 180 / Math.PI;
var ANIMATE_INCREMENT = 0.01;

// Get Attributes
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document; // serves purely for focus

var moveForward 	= false, 
	moveBackward 	= false,
	moveLeft 		= false,
	moveRight 		= false,
	panUp 			= false,
	panDown			= false,
	panLeft			= false,
	panRight 		= false,
	canJump 		= false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();


window.onload = function setup()
{
	// Scene initialisation code:
	init();
	// Add elements to DOM
	addToDOM();
	// Set up all 3D Objects in scene
	createScene();
	// PointerLock
	pointerLock();
	// Render/Drawing/Animate function
	tick();
}

function init()
{
	//var canvas = document.getElementById("cC"); // Cube Canvas
	//initGL(canvas);
	//Renderer:
	renderer = Detector.webgl? new THREE.WebGLRenderer({ antialias: true }): errorMessage();
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setClearColor(0xFFFFFF); // Set clear to White
	//renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(canvasWidth, canvasHeight);
	
	//Camera:
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR);
	// Args(FOV, Aspect Ratio, Near clipping plane, Far clipping plane)
	camera.position.set(0, 10, 10); // Initial position gives a orthographic perspective
										// Not setting inital camera position screws up shadow rendering
	//CameraControls:
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	
	addEventListeners();
}

function addToDOM()
{
	// var canvas = document.getElementById("cC"); // Cube Canvas
	var container = document.getElementById("gameCanvas");
	// Attach the render-supplied DOM element (the gameCanvas)
	container.appendChild(renderer.domElement);
	// Debugger Stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.left = '0px'; 
	container.appendChild(stats.domElement);
}

var ticks = 0;
var haveFocus = false;
function tick()
{	ticks++;
	if (ticks < 10)
	{
		console.log("Ticking!" + ticks);
	}
	delta = clock.getDelta()
	//cameraControls.update(delta);
	stats.update();
	if (haveFocus) {
		if (pause) {
		updateWorld(delta);
		}
		camera.position.set(cubie.position.x, cubie.position.y + 10, cubie.position.z + 50);
		camera.lookAt(cubie.position);
		//plControls.getObject().position.copy(cubie.position);
		//plControls.getObject().position.y -= 20;
		//plControls.getObject().position.x -= 20;
		lights.position.copy(camera.position); //plControls.getObject().position
	}
	endAnimation = false;
	// Draw THREE.JS scene
	renderer.render(scene, camera);
	// Loop draw function call
	window.requestAnimationFrame(tick); // requestAnimationFrame, window optional 
    //animate();
}

function createScene()
{
	var numObs = 10;
	// Create the scene
	scene = new THREE.Scene();
	// Add Lights to scene
	createLights();
	// Add Fog
	scene.fog = new THREE.Fog( 0x000000, 0, 250 );
	//scene.fog = new THREE.FogExp2( 0x006633, 0.9025 );
	// Add Camera to scene
	scene.add(camera);
	
	// Create Objects
	player = new createPlayer();
	
	// Create Cubes
	cubes = new createCubes(numObs);
	for ( var i = 0, l = cubes.length; i < l; ++i ) {
		objects.push( cubes[i] );
		scene.add( cubes[i] );
	}
	
	// Start the renderer
	renderer.setSize(canvasWidth, canvasHeight);

	// Create Camera Pivot 
	//pivot = new THREE.Object3D();
	//scene.add(pivot); // Default adds to Origin
	// Add Objects to scene 
	//scene.add(cubes[i]);
	
	planes = new createPlanes();
	for ( var i = 0, l = planes.length; i < l; ++i ) {
		objects.push( planes[i] );
		scene.add( planes[i] );
	}
}

var cubie;
function createPlayer() {
	
	cubiegeometry = new THREE.BoxGeometry( 3, 3, 3 );
	cubiematerial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false, wireframeLinewidth: 20 } );
	cubie = new THREE.Mesh( cubiegeometry, cubiematerial );
	cubie.position.set(0,1.5,0);
	scene.add( cubie );
}

var lights;
function createLights()
{
	var ambientLight = new THREE.AmbientLight(0x404040);
	//scene.add(ambientLight);
	var hslight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
	hslight.position.set( 0.5, 1, 0.75 );
	//scene.add(hslight);
	
	lights = new THREE.Object3D();
	var pointlightL = new THREE.PointLight(0xFFFFFF, 0.99225);
	pointlightL.position.set(10,10,10);
	//spotlight.angle = 60 * Math.PI / 180;
	pointlightL.exponent = 10;
	//spotlight.target.position.set(0,0,0);

	var pointlightR = new THREE.PointLight(0xFFFFFF, 0.99225);
	pointlightR.position.set(-10,10,-10);
	//spotlight.angle = 60 * Math.PI / 180;
	pointlightR.exponent = 10;
	
	var spotlight = new THREE.SpotLight(0xFFFFFF, 0.99225);
	spotlight.position.set(-10,10,-10);
	spotlight.angle = 60 * Math.PI / 180;
	spotlight.exponent = 100;
	spotlight.target.position.set(0,0,0);
	
	var highlight = new THREE.SpotLight(0xFFFFFF, 0.99225);
	highlight.position.set(10,10,25);
	highlight.angle = 60 * Math.PI / 180;
	highlight.exponent = 100;
	highlight.target.position.set(0,0,0);
	lights.add(pointlightL);
	lights.add(pointlightR);
	lights.add(spotlight);
	lights.add(highlight);
	scene.add(lights);

}

var checkDownRay = new THREE.Vector3( 0, - 1, 0 );
var raycaster = new THREE.Raycaster( new THREE.Vector3(), checkDownRay.clone(), 1.501, 200 );
var raycasterDown = new THREE.Raycaster( new THREE.Vector3(), checkDownRay.clone(), 1.5, 1.8);

var rays = [
      new THREE.Vector3(0, 0, 1).normalize,
      new THREE.Vector3(1, 0, 1).normalize,
      new THREE.Vector3(1, 0, 0).normalize,
      new THREE.Vector3(1, 0, -1).normalize,
      new THREE.Vector3(0, 0, -1).normalize,
      new THREE.Vector3(-1, 0, -1).normalize,
      new THREE.Vector3(-1, 0, 0).normalize,
      new THREE.Vector3(-1, 0, 1).normalize
    ];
var maxVY = 0, maxY = 0;
var updateZ = false, updateX = false, updateY = false;
var goombajumps = 0;
var zmove = 9.8, pcontrol = 1;
var tex1 = false,
	tex2 = false,
	tex3 = false,
	tex4 = false,
	tex5 = false,
	tex6 = false,
	tex7 = false,
	tex8 = false,
	tex9 = false;
function updateWorld(delta)
{
	raycaster.ray.origin.copy( cubie.position );
	raycaster.ray.direction = checkDownRay;
	var intersections = raycaster.intersectObjects( objects );
	var isOnObject = intersections.length > 0;
	/*
	for (i = 0; i < rays.length; i ++) {
		var raycheck = new THREE.Raycaster( cubie.position, rays[i], 1.501, 2 );
		var collisions = raycheck.intersectObjects( objects );
		if (collisions.length > 0) {
			alert("Lost");
			lose();
		}
	}
	*/
	velocity.x -= velocity.x * 10.0 * delta;
	velocity.z -= velocity.z * 10.0 * delta + zmove;
	velocity.y -= 7.8 * 10.0 * delta; // 100.0 = mass
	maxVY = (maxVY > velocity.y) ? maxVY : velocity.y;
	
	velocity.y = (velocity.y > 90) ? 90 : velocity.y;
	if ( moveForward ) velocity.z -= 10.0 * delta * pcontrol;
	if ( moveBackward ) velocity.z += 10.0 * delta * pcontrol;
	
	if ( moveLeft ) velocity.x -= 400.0 * delta;
	if ( moveRight ) velocity.x += 400.0 * delta;
	/*
	if (allIntersect.length > 0) {
		if ( (allIntersect[0].distance < 1.5 + velocity.y * delta) && !updateY) {
	*/
	if ( isOnObject === true && !updateY) {
	//console.log(intersections);
		updateY = true;
			//cubie.translateY( - intersections[0].distance + 1.5);
			//console.log(velocity.y, (- velocity.y * delta), intersections[0].distance, ((- velocity.y * delta) - (intersections[0].distance - 1.5)));
		if (velocity.y < 0 && (- velocity.y * delta) - (intersections[0].distance - 1.5) > 0 )	{
			cubie.position.setY = intersections[0].object.position.y + intersections[0].object.geometry.parameters.height;
			//console.log("Moved to ", cubie.position.y);
			velocity.y = Math.max( 0, velocity.y );
		}
		raycasterDown.ray.origin.copy( cubie.position );
		var allIntersect = raycasterDown.intersectObjects( objects );
		//console.log(cubie.position, raycasterDown.ray.origin.y, allIntersect);
		if (allIntersect.length > 0) {
			/*if (allIntersect[0].object.material.map != null) {
				var texcheck = allIntersect[0].object.material.map.sourceFile;
				alert("Texture!");
			}*/
			console.log("Hit! ", allIntersect);
			velocity.y = Math.max( 0, velocity.y );
			if (jumped) {
				goombajumps++;
				jumped = false;
			}
			canJump = true;
		}
			updateY = false;
	}
	
	cubie.translateX( velocity.x * delta );
	cubie.translateY( velocity.y * delta );
	cubie.translateZ( velocity.z * delta );
	maxY = (maxVY > cubie.position.y) ? maxVY : cubie.position.y;
	if ( cubie.position.y < 1.5 ) {
		velocity.y = 0;
		cubie.position.y = 1.5;
		canJump = true;
	}
	
	if ( Math.abs(cubie.position.x) > (10-1.5) ) {
		velocity.x *= -0.8;
		cubie.position.x = (cubie.position.x > 0) ? (10-1.5) : -(10-1.5);
	}
	if ((ground.position.z - cubie.position.z) > 350 && !updateZ) {
		updateZ = true;
		cubie.position.z = 350 + cubie.position.z;
		for ( var i = 0; scene.children[i] !== undefined; ++i ) {
			//console.log(scene.children);
			//console.log(scene.children[i]);
			if (scene.children[i].name !== undefined && scene.children[i].name == "Obstacle") {
				scene.children[i].position.z = 350 + scene.children[i].position.z;
				if (scene.children[i].position.z > cubie.position.z) {
					scene.remove(scene.children[i]);
					i--;
					}
			}
		}
		if (objects.length > 0) {
			while (objects[0].name != "Obstacle" || objects[0].position.z > cubie.position.z) {
				objects.shift();
			}
		}
		cubes = new createCubes(15);
		for ( var i = 0, l = cubes.length; i < l; ++i ) {
			objects.push( cubes[i] );
			scene.add( cubes[i] );
		}
		updateZ = false;
	}
	if ((cubie.position.x) > 600 && !updateX) {
		updateX = true;
		cubie.position.x = cubie.position.x - 600;
		updateX = false;
	}
	if ((- cubie.position.x) > 600 && !updateX) {
		updateX = true;
		cubie.position.x = 600 + cubie.position.x;
		updateX = false;
	}

}

function lose() 
{
	alert("You didn't avoid drama!");
}

function win() 
{
	alert("You have crushed Cooper drama!");
}

function errorMessage()
{
	alert("Oh no! It seems WebGL is either not supported or your GPU is blacklisted! Switching to Canvas Renderer... Will get slow!");
	return new THREE.CanvasRenderer();
}

function pointerLock() 
{
	if ( havePointerLock ) {
		
		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				//plControlsEnabled = true;
				//plControls.enabled = true;
				haveFocus = true;

				blocker.style.display = 'none';

			} else {
				haveFocus = false;
				plControls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';
				instructions.innerHTML = 'You\'ve reached '  + maxY + ' height of drama by stomping on ' + goombajumps + ' worth of political heads.';

			}

		}

		var pointerlockerror = function ( event ) {

			instructions.style.display = '';

		}

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

			if ( /Firefox/i.test( navigator.userAgent ) ) {

				var fullscreenchange = function ( event ) {

					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				}

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false );

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}
	
	plControls = new THREE.PointerLockControls( camera );
	scene.add( plControls.getObject() );
}
