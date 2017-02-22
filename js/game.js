if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, raycaster, stats;

var camera, scene, renderer, composer, controls, velocity;
var blocker, instructions;

var loader;
var audioListener, soundFilter, soundAreaAnalyser, soundOutsideAnalyser;
var soundArea, collisionArea, lightArea, lightOutside;

var objects = [];

var clock = new THREE.Clock();

// Initialize Three.JS

init();
animate();

/*
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
*/

// Acquire Pointer Lock

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
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
	
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
	

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

				// floor

				geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
				geometry.rotateX( - Math.PI / 2 );

				for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

					var vertex = geometry.vertices[ i ];
					vertex.x += Math.random() * 20 - 10;
					vertex.y += Math.random() * 2;
					vertex.z += Math.random() * 20 - 10;

				}

				for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

					var face = geometry.faces[ i ];
					face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

				}

				material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				// objects

				geometry = new THREE.BoxGeometry( 20, 20, 20 );

				for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

					var face = geometry.faces[ i ];
					face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

				}

				for ( var i = 0; i < 500; i ++ ) {

					material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

					var mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
					mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
					mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
					scene.add( mesh );

					material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

					objects.push( mesh );

				}

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0x333333, 1 );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				//
				stats = new Stats();
				container.appendChild( stats.dom );
	/*
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

	composer.addPass( copyPass );
	copyPass.renderToScreen = true;
	
	*/

	// events

	addEventListeners();

}

//

function animateCamera( delta ) {

	var scale = 1400;
	
	// Friction 
	velocity.x -= velocity.x * 10.0 * delta;
	velocity.y -= velocity.y * 10.0 * delta;
	velocity.z -= velocity.z * 10.0 * delta;

	// Player Move
	if ( moveForward ) velocity.z -= scale * delta;
	if ( moveBackward ) velocity.z += scale * delta;

	if ( moveLeft ) velocity.x -= scale * delta;
	if ( moveRight ) velocity.x += scale * delta;

	if ( moveUp ) velocity.y -= scale * delta;
	if ( moveDown ) velocity.y += scale * delta;
	
	// Shift camera
	controls.getObject().translateX( velocity.x * delta );
	controls.getObject().translateY( velocity.y * delta );
	controls.getObject().translateZ( velocity.z * delta );
}

var audioPos = new THREE.Vector3();
var audioRot = new THREE.Euler();
/*
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
*/

//

function animate() {

	var delta = clock.getDelta();

	if ( controlsEnabled ) { animateCamera( delta ); }

	/*
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
	*/
	
	renderer.render( scene, camera );

	stats.update();

	requestAnimationFrame( animate );

}
/*
function render( delta ) {

	//renderer.render( scene, camera );
	composer.render( delta );

}
*/