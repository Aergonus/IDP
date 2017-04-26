'use strict';
/*globals player, globals, tree, game*/

var gameControls = (function() {

  var respawn = false; //marker for first time init vs respawn

  function checkValidPosition(x, z) {
    if (tree.checkValidPosition(x, z) &&
        x <= globals.upperCol &&
        x >= globals.lowerCol) {
      return true;
    }
    return false;
  }

  function checkKey(e) {
    var blocker = document.getElementById('blocker');
    if (blocker.style.display !== 'none') {
      return;
    }

    var left = 37;
    var up = 38;
    var right = 39;
    var down = 40;

    if (!game.playerActive()) {
      return;
    }

    e = e || window.event;

    var playerBox = player.playerBox();
    var colId = playerBox.position.x / globals.blockSize;
    var rowId = playerBox.position.z / globals.blockSize;
    if (e.keyCode === up && checkValidPosition(colId, rowId-1)) {
      player.moveZ(-1);
    } else if (e.keyCode === down && checkValidPosition(colId, rowId+1)) {
      player.moveZ(1);
    } else if (e.keyCode === left && checkValidPosition(colId-1, rowId)) {
      player.moveX(-1);
    } else if (e.keyCode === right && checkValidPosition(colId+1, rowId)) {
      player.moveX(1);
    }
  }

  function setBlocker() {
    var blocker = document.getElementById('blocker');
    blocker.style.display = '';
    var playerBox = player.playerBox();
    var rowId = Math.round(-playerBox.position.z/10);
    document.getElementById('message').innerHTML = 'You died!';
    document.getElementById('score').innerHTML = 'Score: ' + rowId;
    document.getElementById('click').innerHTML = 'Click to reload';
    document.getElementById('rowNumDiv').style.display = 'none';
  }

  function init() {
    window.addEventListener("click", function(e) {
      var blocker = document.getElementById('blocker');
      blocker.style.display = 'none';
      if (respawn) {
        if (!game.playerActive()) {
          location.reload();
        }
      } else {
        respawn = true;
      }
    });
    window.onkeydown = checkKey;
  }

  return {
    init: init,
    checkValidPosition: checkValidPosition,
    setBlocker: setBlocker
  };

})();