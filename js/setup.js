if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// Scene, Camera, Renderer
let renderer	= new THREE.WebGLRenderer();
let scene		= new THREE.Scene();
let aspect		= window.innerWidth / window.innerHeight;
let camera		= new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
let controls	= new THREE.OrbitControls(camera);
let info		= document.getElementById( 'info' );
let listener	= new THREE.AudioListener(); // instantiate a listener
let controlsEnabled = false;

var velocity = new THREE.Vector3();
var acceleration = new THREE.Vector3();

var sound; // temp to replace TODO:

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
		size: 0.5,
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
		size: 0.003,
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
	
	var geometry = new THREE.CylinderGeometry( 5, 5, 20, 32, 1, true);
	var material = new THREE.MeshLambertMaterial( {color: 0xf0f0f0} );
	geometry.rotateX( Math.PI / 2 );
	tractor = new THREE.Mesh( geometry, material );
	
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
sound.setRefDistance( 10 );
sound.setRolloffFactor( 1 );
sound.setDistanceModel('exponential');
sound.setLoop(true);
sound.play();

	// events

	addEventListeners();

	animate();
}

var audioPos = new THREE.Vector3();
var audioRot = new THREE.Euler();

function animate() {
	// 3D Sound Spatial Transform Update
	listener.position.copy( audioPos.setFromMatrixPosition( camera.matrixWorld ) );
	listener.rotation.copy( audioRot.setFromRotationMatrix( camera.matrixWorld ) );
	
	// Move atmosphere
	earth.getObjectByName('atmosphere').rotation.y += 1/16 * 0.005;
	
	camera.lookAt(earth.position);
	
	renderer.render( scene, camera );

	stats.update();

	requestAnimationFrame( animate );
}

function onMouseMove( event ) {
	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	// See if the ray from the camera into the world hits one of our meshes
	var intersects = raycaster.intersectObject( earth );
	// Toggle rotation bool for meshes that we clicked
	if ( intersects.length > 0 ) {
		tractor.position.set( 0, 0, 0 );
		tractor.lookAt( intersects[ 0 ].face.normal );
		tractor.position.copy( intersects[ 0 ].point );
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