'use strict';
/*globals globals, support, models, game*/

var log = (function() {
  var logs = {}; //map row # to array of logs in that row

  function createLog(width, origin, startPos, speed, zPos) {
    var log = models.createLog(width, origin, startPos, speed, zPos);
    game.scene.add(log);
    return log;
  }

  function addRow(rowId) {
    var speed = support.getRandInt(1, 4);
    var width = support.getRandInt(2, 5);
    var origin = support.getRandInt(0, 2) === 0 ? 'left' : 'right';
    var zPos = rowId * globals.blockSize;
    logs[rowId] = [];
    var maxX = globals.maxX - (width * globals.blockSize);
    for (var i = globals.minX;
         i < maxX;
         i += (support.getRand(2, 3) * width * globals.blockSize)) {
      var log = createLog(width, origin, i, speed, zPos);
      logs[rowId].push(log);
    }
  }

  function getRow(rowId) {
    return logs[rowId];
  }

  function deleteRow(rowId) {
    if (!(rowId in logs)) {
      return;
    }
    for (var i = 0; i < logs[rowId].length; ++i) {
      game.scene.remove(logs[rowId][i]);
    }
    delete logs[rowId];
  }

  function updateRow(rowId, delta) {
    //iterate over all logs and update position
    for (var i = 0; i < logs[rowId].length; ++i) {
      var log = logs[rowId][i];
      var movement = log.data.origin === 'right' ? -1 : 1;
      log.position.x += (movement * 5 * delta * log.data.speed);
      if ((log.data.origin === 'right' &&
           log.position.x < globals.minX) ||
          (log.data.origin === 'left' &&
           log.position.x > globals.maxX)) {
        var max = globals.maxX;
        var min = globals.minX;
        log.position.x = log.data.origin === 'right' ? max : min;
      }
    }
  }

  function update(delta) {
    //for each row, update row
    for (var key in logs) {
      if (logs.hasOwnProperty(key)) {
        updateRow(key, delta);
      }
    }
  }

  return {
    addRow: addRow,
    getRow: getRow,
    deleteRow: deleteRow,
    update: update
  };

})();