if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// Scene, Camera, Renderer
let renderer	= new THREE.WebGLRenderer();
let scene		= new THREE.Scene();
let aspect		= window.innerWidth / window.innerHeight;
let camera		= new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
let controls	= new THREE.OrbitControls(camera);
let info		= document.getElementById( 'info' );
var listener	= new THREE.AudioListener(); // instantiate a listener
let controlsEnabled = false;

var velocity = new THREE.Vector3();
var acceleration = new THREE.Vector3();
var cowrand = new THREE.Euler( 2 * Math.PI * Math.random(), 2 * Math.PI * Math.random(), 2 * Math.PI * Math.random(), 'XYZ' );

// XHR Loading functions
// Function called when download progresses
var onProgress = function ( xhr ) { 
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};
// Function called when download errors
var onError = function ( xhr ) {
	console.log( 'An error happened' );
};

var totalCalls = ajaxCallsRemaining = 12;
var moourls = [];
var returnedMoos = [];
var winmoo;

var cow;
var earth;
var tractor; 

init();

// Setup Libraries, Acquire Locks, and Load Assets
function init() {
	// Instantiate Threejs loader which sets up and inits AudioContext
	var loader = new THREE.AudioLoader();
	
	// Array of Sounds to Load
	for (var i = 0; i <= 10; i++) {
		moourls.push('./media/sounds/'+i+'.mp3');
	}
	moourls.push('./media/sounds/win.mp3');
	
	moourls.forEach(function(listItem, index){
		// Load sound
		loader.load(
			// Resource URL
			listItem,
			// Function when resource is loaded
			function ( audioBuffer ) {
				// Success Handler from Ajax call
				returnedMoos[index] = audioBuffer; // Save audioBuffer response
				// See if we're done with the last ajax call
				--ajaxCallsRemaining;
				info.innerHTML = "Loading Progress " + ((totalCalls - ajaxCallsRemaining)/totalCalls*100) + " %";
				if (ajaxCallsRemaining <= 0) {
					// All resources loaded! Unlock Game
					unlock();
				}
			},
			// Function called when download progresses
			onProgress,
			// Function called when download errors
			onError
		);
	});
	
	// Start Loading Non-Audio Assets

	// Lights
	let spotLight = new THREE.SpotLight(0xffffff, .25, 0, 10, 2);
	let ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
	
	// Texture Loader
	let textureLoader = new THREE.TextureLoader();
	
	// Earth
	earth = createPlanet({
	  surface: {
		size: .995,
		material: {
		  bumpScale: 0.25,
		  specular: new THREE.Color('grey'),
		  shininess: 10
		},
		textures: {
		  map: '',//'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthmap1k.jpg',
		  bumpMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthbump1k.jpg',
		  specularMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthspec1k.jpg'
		}
	  },
	  atmosphere: {
		size: 0.005,
		material: {
		  opacity: 0.8
		},
		textures: {
		  map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg',
		  alphaMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmaptrans.jpg'
		},
		glow: {
		  size: 0.02,
		  intensity: 0.7,
		  fade: 7,
		  color: 0x93cfef
		}
	  },
	});


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
	
	// Tractor Beam
	var tract_geometry = new THREE.CylinderGeometry( .007, .007, .1, 32, 1, true);
	var tract_material = new THREE.MeshLambertMaterial( {color: 0xf0f0f0} );
	tractor = new THREE.Mesh( tract_geometry, tract_material );
	
	// Cow
	var cow_geometry = new THREE.BoxGeometry( 20, 20, 20 );
	var cow_material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
	cow = new THREE.Mesh( cow_geometry, cow_material );
	cow.position.set(0,.95,0);
	cow.visible = false;
	
	// Scene, Camera, Renderer Configuration
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera.position.set(1,1,1);

	scene.add(camera);
	scene.add(spotLight);
	scene.add(ambientLight);
	scene.add(earth);
	scene.add(tractor);

	//scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );

	// Light Configurations
	spotLight.position.set(1,1,1);
	spotLight.lookAt(earth.position);

	// Mesh Configurations
	earth.receiveShadow = true;
	earth.castShadow = true;
	earth.getObjectByName('surface').geometry.center();

}

var current_sound;
// Runs once after page is loaded
function unlock() {
	blocker = document.getElementById( 'blocker' );
	instructions = document.getElementById( 'instructions' );

	var lockchange = function ( event ) {
		if ( pause ) {
			controls.enabled = false;
			
			//var delta = clock.getDelta(); // Added to prevent movement

			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';
			info.innerHTML = "Paused";
			//document.removeEventListener( 'mousedown', checkmoo, false);
			document.addEventListener( 'mousemove', onMouseMove, false );
		} else {

			controlsEnabled = true;
			controls.enabled = true;
			
			//var delta = clock.getDelta(); // Added to prevent movement
			
			blocker.style.display = 'none';
			
			//document.addEventListener( 'mousedown', checkmoo, false);
			document.addEventListener( 'mousemove', onMouseMove, false );
			info.innerHTML = "moo.";
		}

	};

	// Hook pointer lock state change events
	document.addEventListener("pause", lockchange, false );
	
	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none'; 
		
		// Unlock Pause
		pause = false;
		document.dispatchEvent(pauseEvent);
	}, false );
	
	info.innerHTML = "Resources Loaded, click to begin.";
	
	sound = new THREE.PositionalAudio( listener );
	sound.setBuffer( returnedMoos[0] );
	sound.setRefDistance( 0.05 );
	sound.setMaxDistance( 2.10 );
	sound.setRolloffFactor( 1 );
	sound.setDistanceModel('linear');
	sound.setLoop(true);
	sound.play();
	
	current_sound = 0;
	
	cow.position.applyEuler(cowrand);
	cow.add(sound);
	scene.add(cow);
	
	// events

	addEventListeners();

	animate();
}

var audioPos = new THREE.Vector3();
var audioRot = new THREE.Euler();

function animate() {
	// Move atmosphere
	earth.getObjectByName('atmosphere').rotation.y += 1/16 * 0.005;
	
	camera.lookAt(earth.position);
	
	renderer.render( scene, camera );

	stats.update();

	requestAnimationFrame( animate );
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var obj = [earth.children[0]];
function onMouseMove( event ) {
	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( obj, true );
	
	// Toggle rotation bool for meshes that we clicked
	if ( intersects.length > 0 ) {
		tractor.position.set( 0, 0, 0 );
		tractor.lookAt( intersects[ 0 ].point );
		tractor.position.copy( intersects[ 0 ].point );
	
		// 3D Sound Spatial Transform Update
		listener.position.copy( audioPos.setFromMatrixPosition( tractor.matrixWorld ) );
		listener.rotation.copy( audioRot.setFromRotationMatrix( tractor.matrixWorld ) );
		
		// Max is approx 2, goes down to approx 0.1
		let sound_model = Math.max(10 - Math.floor(tractor.position.distanceTo(cow.position)/ 0.2),0);

		if (current_sound != sound_model) {
			sound.pause();
			sound.setBuffer( returnedMoos[sound_model] );
			sound.play();
			current_sound = sound_model;
		}

		console.log(tractor.position.distanceTo(cow.position));
		console.log(sound_model);
		
		// Visual fix
		tractor.rotateX(Math.PI/2);
	}
}

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

// stats
stats = new Stats();
document.body.appendChild( stats.dom );