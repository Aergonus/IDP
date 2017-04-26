'use strict';
/*global THREE, Physijs, game, models, support, tree, globals*/

var player = (function() {

  var playerBox = null;
  var invisibleBox; //for the light to follow, the light must follow an object
  var direction = 0;
  var progress = 0;
  var animating = false;
  var originalState = {
    cameraX: 0,
    cameraZ: 0,
    playerX: 0,
    playerZ: 0
  }

  function getY(progress) {
    //cx(1-x) x = 1, y = 0; x = 0, y = 0;
    return 8*progress*(1 - progress);
  }

  function stepX(step) {
    var rotation = step < 0 ? 1 : 3;
    playerBox.rotation.y = support.toRad(rotation * 90);
    playerBox.position.x += step;
    playerBox.position.y = getY(progress);
    game.camera.position.x += step;
  }

  function stepZ(step) {
    var rotation = step < 0 ? 0 : 1;
    playerBox.rotation.y = support.toRad(rotation * 180);
    playerBox.position.y = getY(progress);
    playerBox.position.z += step;
    invisibleBox.position.z = playerBox.position.z;
    game.camera.position.z += step;
    game.light.position.z = playerBox.position.z + 
                            globals.directionalLightBasePosition.z;
    game.light.target = invisibleBox;
    game.light.updateMatrix();
    game.light.updateMatrixWorld();
  }

  function saveOriginalState() {
    originalState.cameraX = game.camera.position.x;
    originalState.cameraZ = game.camera.position.z;
    originalState.playerX = playerBox.position.x;
    originalState.playerY = playerBox.position.y;
    originalState.playerZ = playerBox.position.z;
  }

  function moveX(step) {
    if (animating) {
      return;
    }
    animating = true;
    progress = 0;
    direction = step < 0 ? 2 : 1;
    saveOriginalState();
  }

  function moveZ(step) {
    if (animating) {
      return;
    }
    animating = true;
    progress = 0;
    direction = step < 0 ? 4 : 3;
    saveOriginalState();
  }

  function createPlayer() {
    invisibleBox = models.createInvisibleBox();
    invisibleBox.position.x = 0;
    invisibleBox.position.y = 0;
    invisibleBox.position.z = 0;
    game.scene.add(invisibleBox);
    playerBox = models.createPlayer();
    playerBox.position.x = 0;
    playerBox.position.z = 0;
    game.scene.add(playerBox);
  }

  function update(delta) {
    if (animating === false) {
      return;
    }
    var dprogress = 3*delta;
    var step = dprogress * 10;
    progress += dprogress;
    switch (direction) {
    case 1:
      stepX(step);
      break;
    case 2:
      stepX(-step);
      break;
    case 3:
      stepZ(step);
      break;
    case 4:
      stepZ(-step);
      break;
    }

    var rowNum = Math.round(-playerBox.position.z/globals.blockSize);
    if (progress >= 1) {
      animating = false;
      progress = 0;
      playerBox.position.x = Math.round(playerBox.position.x/globals.blockSize)*
                             globals.blockSize;
      playerBox.position.z = -rowNum * globals.blockSize;
      playerBox.position.y = originalState.playerY;
      invisibleBox.position.z = playerBox.position.z;
      game.camera.position.x = playerBox.position.x - 
                               originalState.playerX + 
                               originalState.cameraX;
      game.camera.position.z = playerBox.position.z - 
                               originalState.playerZ + 
                               originalState.cameraZ;
    }

    //update row number
    rowNum = rowNum < 0 ? 0 : rowNum;
    document.getElementById("rowNum").innerHTML = "Row: " + rowNum;

    //edge case for when hit by car but jumped to next row
    if (!game.playerActive()) {
      flatten();
    }
  }

  function flatten() {
    playerBox.position.y = -5;
  }

  return {
    playerBox: function() {
      return playerBox;
    },
    moveX: moveX,
    moveZ: moveZ,
    createPlayer: createPlayer,
    update: update,
    flatten: flatten
  };

})();