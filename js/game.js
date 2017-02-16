		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, raycaster, stats;

var camera, scene, renderer, composer, controls, velocity;
var blocker, instructions;
var moveLeft, moveForward, moveBackward, moveRight;
var loader;
var audioListener, soundFilter, soundAreaAnalyser, soundOutsideAnalyser;
var soundArea, collisionArea, lightArea, lightOutside;

// Initialize Three.JS

init();

//
// SEA3D Loader
//

loader = new THREE.SEA3D( {

	autoPlay : true, // Auto play animations
	container : scene // Container to add models

} );

loader.onComplete = function( e ) {

	audioListener = loader.audioListener;

	// sound filter

	soundFilter = audioListener.context.createBiquadFilter();
	soundFilter.type = 'lowpass';
	soundFilter.Q.value = 10;
	soundFilter.frequency.value = 440;

	// sound asset 1

	lightOutside = loader.getLight("Light1");

	soundOutside = loader.getSound3D("Point001");
	soundOutsideAnalyser = new THREE.AudioAnalyser( soundOutside, 32 );

	// sound asset 2 + area

	lightArea = loader.getLight("Light2");

	soundArea = loader.getSound3D("Point002");
	soundAreaAnalyser = new THREE.AudioAnalyser( soundArea, 512 );

	collisionArea = loader.getMesh("Torus003");

	animate();

};

loader.load( './models/sea3d/sound.tjs.sea' );

//

function initPointerLock() {

	blocker = document.getElementById( 'blocker' );
	instructions = document.getElementById( 'instructions' );

	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				controlsEnabled = true;
				controls.enabled = true;

				blocker.style.display = 'none';

			} else {

				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

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

function init() {
	initPointerLock();
	
	raycaster = new THREE.Raycaster();

	scene = new THREE.Scene();
	velocity = new THREE.Vector3();

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	//Camera:
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	// Args(FOV, Aspect Ratio, Near clipping plane, Far clipping plane)
	
	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	controls.getObject().translateX( 250 );
	controls.getObject().translateZ( 250 );
	
	//Renderer:
	renderer = Detector.webgl? new THREE.WebGLRenderer({ antialias: true }): errorMessage();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x333333, 1 );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

	// post-processing

	composer = new THREE.EffectComposer( renderer );

	var renderPass = new THREE.RenderPass( scene, camera );
	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	composer.addPass( renderPass );

	var vh = 1.4, vl = 1.2;
	/*
	var colorCorrectionPass = new THREE.ShaderPass( THREE.ColorCorrectionShader );
	colorCorrectionPass.uniforms[ "powRGB" ].value = new THREE.Vector3( vh, vh, vh );
	colorCorrectionPass.uniforms[ "mulRGB" ].value = new THREE.Vector3( vl, vl, vl );
	composer.addPass( colorCorrectionPass );

	var vignettePass = new THREE.ShaderPass( THREE.VignetteShader );
	vignettePass.uniforms[ "darkness" ].value = 1.0;
	composer.addPass( vignettePass );
	*/
	composer.addPass( copyPass );
	copyPass.renderToScreen = true;

	// events

	addEventListeners();

}

//

function animateCamera( delta ) {

	var scale = 1400;

	velocity.x -= velocity.x * 10.0 * delta;
	velocity.y -= velocity.y * 10.0 * delta;
	velocity.z -= velocity.z * 10.0 * delta;

	if ( moveForward ) velocity.z -= scale * delta;
	if ( moveBackward ) velocity.z += scale * delta;

	if ( moveLeft ) velocity.x -= scale * delta;
	if ( moveRight ) velocity.x += scale * delta;

	if ( moveUp ) velocity.y -= scale * delta;
	if ( moveDown ) velocity.y += scale * delta;
	
	controls.getObject().translateX( velocity.x * delta );
	controls.getObject().translateY( velocity.y * delta );
	controls.getObject().translateZ( velocity.z * delta );

}

var clock = new THREE.Clock();
var audioPos = new THREE.Vector3();
var audioRot = new THREE.Euler();

function updateSoundFilter() {

	// difference position between sound and listener
	var difPos = new THREE.Vector3().setFromMatrixPosition( soundArea.matrixWorld ).sub(audioPos);
	var length = difPos.length();

	// pick a vector from camera to sound
	raycaster.set( audioPos, difPos.normalize() );

	// intersecting sound1
	if ( length > 50 && raycaster.intersectObjects( [collisionArea] ).length ) {

		if ( soundArea.getFilters()[0] !== soundFilter ) soundArea.setFilters( [ soundFilter ] );

	} else if ( soundArea.getFilters()[0] === soundFilter ) {

		soundArea.setFilters( [] );

	}

}

//

function animate() {

	var delta = clock.getDelta();

	animateCamera( delta );

	// Sound3D Spatial Transform Update
	loader.audioListener.position.copy( audioPos.setFromMatrixPosition( camera.matrixWorld ) );
	loader.audioListener.rotation.copy( audioRot.setFromRotationMatrix( camera.matrixWorld ) );

	// Update sound filter from raycaster intersecting
	updateSoundFilter();

	// light intensity from sound amplitude
	lightOutside.intensity = soundOutsideAnalyser.getAverageFrequency() / 100;
	lightArea.intensity = soundAreaAnalyser.getAverageFrequency() / 50;

	// Update SEA3D Animations
	THREE.SEA3D.AnimationHandler.update( delta );

	render( delta );

	stats.update();

	requestAnimationFrame( animate );

}

function render( delta ) {

	//renderer.render( scene, camera );
	composer.render( delta );

}
