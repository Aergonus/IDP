'use strict';
/*globals globals, support, models, game, player*/

var vehicle = (function() {
  var vehicles = {}; //map row # to array of vehicles in that row

  function createVehicle(width, origin, startPos, speed, zPos) {
    var vehicle = models.createCar(width, origin, startPos, speed, zPos);
    game.scene.add(vehicle);
    return vehicle;
  }

  function addRow(rowId) {
    //faster w/ more rows
    var speed = support.getRandInt(1, 4) + (-rowId/(-rowId+50))*2;
    var width = support.getRandInt(1, 4);
    if (width === 3) {
      width = 2.5;
    }
    var origin = support.getRandInt(0, 2) === 0 ? 'left' : 'right';
    var zPos = rowId * globals.blockSize;
    vehicles[rowId] = [];
    var lower = 6 - width;
    var upper = 10 - width;
    var maxX = globals.maxX - (width * globals.blockSize);
    for (var i = globals.minX;
         i < maxX;
         i += (support.getRand(lower, upper) * width * globals.blockSize)) {
      var vehicle = createVehicle(width, origin, i, speed, zPos);
      vehicles[rowId].push(vehicle);
    }
  }

  function getRow(rowId) {
    return vehicles[rowId];
  }

  function deleteRow(rowId) {
    if (!(rowId in vehicles)) {
      return;
    }
    for (var i = 0; i < vehicles[rowId].length; ++i) {
      game.scene.remove(vehicles[rowId][i]);
    }
    delete vehicles[rowId];
  }

  function updateRow(rowId, delta) {
    //iterate over all vehicles and update position
    for (var i = 0; i < vehicles[rowId].length; ++i) {
      var vehicle = vehicles[rowId][i];
      var movement = vehicle.data.origin === 'right' ? -1 : 1;
      //TODO: get better speed
      vehicle.position.x += (movement * 5 * delta * vehicle.data.speed);
      if ((vehicle.data.origin === 'right' &&
           vehicle.position.x < globals.minX) ||
          (vehicle.data.origin === 'left' &&
           vehicle.position.x > globals.maxX)) {
        var max = globals.maxX;
        var min = globals.minX;
        vehicle.position.x = vehicle.data.origin === 'right' ? max : min;
      }
    }
  }

  function update(delta) {
    if (!game.playerActive()) {
      return;
    }
    //for each row, update row
    for (var key in vehicles) {
      if (vehicles.hasOwnProperty(key)) {
        updateRow(key, delta);
      }
    }
  }

  function checkCollision() {
    var playerBox = player.playerBox();
    var xPos = playerBox.position.x;
    var zPos = playerBox.position.z;
    var pdx = playerBox.data.width/2;
    var pdz = playerBox.data.depth/2;
    var rowIds = [Math.round(zPos/globals.blockSize)];
    var possibleRowId = Math.round((zPos + pdz)/globals.blockSize);
    if (possibleRowId !== rowIds[0]) {
      rowIds.push(possibleRowId);
    } else {
      possibleRowId = Math.round((zPos - pdz)/globals.blockSize);
      if (possibleRowId !== rowIds[0]) {
        rowIds.push(possibleRowId);
      }
    }
    for (var i = 0; i < rowIds.length; ++i) {
      if (!(rowIds[i] in vehicles)) {
        continue;
      }
      var rowId = rowIds[i];
      for (var j = 0; j < vehicles[rowId].length; ++j) {
        var vehicle = vehicles[rowId][j];
        var vdx = vehicle.data.width/2;
        var vdz = vehicle.data.depth/2;
        if (vehicle.position.x - vdx <= xPos + pdx && 
            vehicle.position.x + vdx >= xPos + pdx) {
          return true;
        }

        if (vehicle.position.x + vdx >= xPos - pdx &&
            vehicle.position.x - vdx <= xPos - pdx) {
          return true;
        }
      }
    }
    return false;
  }

  return {
    addRow: addRow,
    getRow: getRow,
    deleteRow: deleteRow,
    update: update,
    checkCollision: checkCollision
  };

})();