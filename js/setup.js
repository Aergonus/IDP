if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// Scene, Camera, Renderer
let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
let controls = new THREE.OrbitControls(camera);
let info = document.getElementById( 'info' );
let listener = new THREE.AudioListener(); // instantiate a listener

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

// Setup Libraries, Acquire Locks, and Load Assets
function setup() {

	blocker = document.getElementById( 'blocker' );
	instructions = document.getElementById( 'instructions' );

	var lockchange = function ( event ) {
		if ( pause ) {
			controls.enabled = false;
			
			var delta = clock.getDelta(); // Added to prevent movement

			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';
			console.log("Paused");
			document.removeEventListener( 'mousedown', checkmoo, false);
		} else {

			controlsEnabled = true;
			controls.enabled = true;
			
			var delta = clock.getDelta(); // Added to prevent movement
			
			blocker.style.display = 'none';
			
			document.addEventListener( 'mousedown', checkmoo, false);
			console.log("Acquired");

		}

	};

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
					// Hook pointer lock state change events
					document.addEventListener("pause", lockchange, false );
					
					instructions.addEventListener( 'click', function ( event ) {
						instructions.style.display = 'none'; 
						
						// Unlock Pause
						pause = false;
						document.dispatchEvent(pauseEvent);
					}, false );
					
					info.innerHTML = "Resources Loaded, click to begin.";
				}
			},
			// Function called when download progresses
			onProgress,
			// Function called when download errors
			onError
		);
	});
	
	var sound = new THREE.PositionalAudio( listener );
	sound.setBuffer( returnedMoos[0] );
	sound.setRefDistance( 10 );
	sound.setRolloffFactor( 1 );
	sound.setDistanceModel('exponential');
	sound.setLoop(true);
	sound.play();
}

setup();