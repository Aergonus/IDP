// Initialize Firebase
var config = {
	apiKey: "AIzaSyB-0DO8x-gUVR8sNbGr4LpMutVJaeJkusc",
	authDomain: "ball-aa7b1.firebaseapp.com",
	databaseURL: "https://ball-aa7b1.firebaseio.com",
	projectId: "ball-aa7b1",
	storageBucket: "ball-aa7b1.appspot.com",
	messagingSenderId: "422267344189"
};
firebase.initializeApp(config);

firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
	// Stored in firebase.auth().currentUser
    // ...
  } else {
    // User is signed out.
    // ...
  }
  // ...
});

// Get a reference to the database service
var database = firebase.database();

var info = document.getElementById( 'info' );
var blue = document.getElementById( 'blue' );
var red = document.getElementById( 'red' );

var playerRef = database.ref('players');

// TODO: Listener for blue/red updates to update UI
var blueRef = database.ref('players/blue');
var redRef = database.ref('players/red');
blueRef.on('value', function(snapshot) {
  console.log(snapshot.val());
});
redRef.on('value', function(snapshot) {
  console.log(snapshot.val());
});

var gameData;
var gameRef = database.ref('game');
gameRef.on('value', function(snapshot) {
	gameData = snapshot.val();
	if (!gameData.updated){
		gameRef.set({
			blue: {
				choice: gameData.blue.choice,
				score: gameData.blue.score + 
					(gameData.blue.choice 
						? (gameData.red.choice ? 1 : -1)
						: (gameData.red.choice ? 2 : -2)
					),
				uid: gameData.blue.uid
			},
			red: {
				choice: gameData.red.choice,
				score: gameData.red.score + 
					(gameData.red.choice 
						? (gameData.blue.choice ? 1 : -1)
						: (gameData.blue.choice ? 2 : -2)
					),
				uid: gameData.red.uid
			},
			updated: true
		});
	}
});

var pendingRef = database.ref('secret');

gameRef.once('value').then(function(snapshot) {
	gameData = snapshot.val();
	
	// Not sure if this is a race condition, so it's safer to enclose this inside here
	pendingRef.on('value', function(snapshot) {
	  var pending = snapshot.val();
	  gameRef.set({
		blue: {
			choice: pending.blue.choice,
			score: gameData.blue.score,
			uid: pending.blue.uid
		},
		red: {
			choice: pending.red.choice,
			score: gameData.red.score,
			uid: pending.red.uid
		},
		updated: false
	  });
	});
});

var secretRef; 
function take(color){
	playerRef.child(color).set({
		uid: firebase.auth().currentUser.uid,
		timestamp: firebase.database.ServerValue.TIMESTAMP
	}).then(function(success) {
		secretRef = database.ref("secret/"+color);
		info.innerHTML = "You are " + color + " Player.";
		if (color == 'red'){
			red.innerHTML = "Red";
			blue.innerHTML = "";
			//blue.style.display = 'none';
			document.body.style.backgroundColor = '#FFCCCC';
		}
		if (color == 'blue') {
			blue.innerHTML = "Blue";
			red.innerHTML = "";
			//red.style.display = 'none';
			document.body.style.backgroundColor = '#CCCCFF';
		}
	}).catch(function(error) {
		// Notify user of failure
		info.innerHTML = "Failed to take over " + color + " Player.";
		console.log(error.message);
	});
}


function guess(pchoice){
	secretRef.set({
		uid: firebase.auth().currentUser.uid,
		choice: pchoice
	}).then(function(success) {
		console.log("Updated Choice");
	}).catch(function(error) {
		console.log("Failed to update");
	});
}

// TODO: On Disconnect, remove uid from player. Revise rules to allow for faster disconnect