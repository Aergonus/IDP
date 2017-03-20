if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

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

//var moourls = ["http://findtheinvisiblecow.com/static/sound/cow/win.mp3"];
var totalCalls = ajaxCallsRemaining = 12;
var returnedMoos = [];
var winmoo;

// Setup Libraries, Acquire Locks, and Load Assets
function setup() {

	blocker = document.getElementById( 'blocker' );
	instructions = document.getElementById( 'instructions' );
	info = document.getElementById( 'info' );

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
	
	// Load win sound
	loader.load(
		// Resource URL
		'./media/sounds/win.mp3',
		// Function when resource is loaded
		function ( audioBuffer ) {
			// Success Handler from Ajax call
			winmoo = audioBuffer; // Save audioBuffer response
			
			// See if we're done with the last ajax call
			--ajaxCallsRemaining;
			info.innerHTML = "Loaded Win M00 ;)";
			if (ajaxCallsRemaining < 0) {
				// All resources loaded! Unlock Game
				// Hook pointer lock state change events
				document.addEventListener("pause", lockchange, false );

				instructions.addEventListener( 'click', function ( event ) {

					instructions.style.display = 'none'; 

					// Unlock Pause
					pause = false;
					document.dispatchEvent(pauseEvent);

				}, false );
				
				info.innerHTML = "All loaded";
			}
		},
		// Function called when download progresses
		onProgress,
		// Function called when download errors
		onError
	);
	
	for (var i = 0; i <= 10; i++) {
		// Load moo resources
		loader.load(
			'./media/sounds/'+i+'.mp3',
			function ( audioBuffer ) {
				returnedMoos[i] = audioBuffer;
				--ajaxCallsRemaining;
				info.innerHTML = "Loading Progress " + ((totalCalls - ajaxCallsRemaining)/totalCalls*100) + " %";
				if (ajaxCallsRemaining <= 0) {
					document.addEventListener("pause", lockchange, false );
					instructions.addEventListener( 'click', function ( event ) {
						instructions.style.display = 'none'; 
						pause = false;
						document.dispatchEvent(pauseEvent);
					}, false );
					info.innerHTML = "All loaded";
				}
			},
			onProgress,
			onError
		);
	}

}

setup();