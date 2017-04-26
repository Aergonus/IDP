'use strict';
/*global THREE, models, game, globals, vehicle, log, tree, support, player*/

var sceneSetup = (function () {

  var rows = {}; //map of rowId to row
  var currentNumRows = 0;
  var currentRowId = 0; //current generated row id
  var highestRowId;

  function increaseRows() {
    --currentRowId;
    ++currentNumRows;
  }

  function generateMoreRows() {
    var playerBox = player.playerBox();
    var rowId = Math.round(playerBox.position.z/10);
    if (-rowId + 20 >= currentNumRows) {
      createRandomRows();
    }
    while (highestRowId >= rowId+20) {
      deleteRow(highestRowId);
      --highestRowId;
      --currentNumRows;
    }
  }

  function createRoad(rowId) {
    var road = models.createRoad(rowId*globals.blockSize);
    vehicle.addRow(rowId);
    game.scene.add(road);
    rows[rowId] = road;
    increaseRows();
  }

  function createRiver(rowId) {
    var river = models.createRiver(rowId*globals.blockSize);
    log.addRow(rowId);
    game.scene.add(river);
    rows[rowId] = river;
    increaseRows();
  }

  function createGrass(rowId, probTree) {
    var grass = models.createGrass(rowId*globals.blockSize);
    game.scene.add(grass);
    tree.addRow(rowId, probTree);
    rows[rowId] = grass;
    increaseRows();
  }

  function deleteRow(rowId) {
    log.deleteRow(rowId);
    vehicle.deleteRow(rowId);
    tree.deleteRow(rowId);
    if (rowId in rows) {
      game.scene.remove(rows[rowId]);
    }
    delete rows[rowId];
  }

  function createRandomRows() {
    var type = support.getRandInt(0, 3);
    var nRows;
    if (type === 0) {
      nRows = 1;
    } else {
      nRows = support.getRandInt(1, 6);
    }
    var i;
    for (i = 0; i < nRows; ++i) {
      switch (type) {
      case 0:
        createGrass(currentRowId, support.getRand(0.1, 0.3));
        break;
      case 1:
        createRoad(currentRowId);
        break;
      case 2:
        createRoad(currentRowId); //river not supported yet
        break;
      }
    }
    if (type !== 0) {
      nRows = support.getRandInt(1, 3);
      for (i = 0; i < nRows; ++i) {
        createGrass(currentRowId);
      }
    }

  }

  function addSceneObjects() {
    currentNumRows = 0;
    highestRowId = 7;
    var i;
    for (i = -1; i < 4; ++i) {
      createGrass(i, 0);
    }
    for (i = 4; i < 8; ++i) {
      createGrass(i, 1);
    }

    var nRows = support.getRandInt(2, 4);
    for (i = -2; i > -2-nRows; --i) {
      createRoad(i);
    }

    currentRowId = -2-nRows;
    createGrass(-2-nRows, 0.1);
    createRandomRows();
    createRandomRows();
  }


  return {
    addSceneObjects: addSceneObjects,
    createRoad: createRoad,
    createRiver: createRiver,
    generateMoreRows: generateMoreRows
  };

})();

