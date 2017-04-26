'use strict';
/*globals THREE, game, support, globals*/

var models = (function() {

  function createInvisibleBox() {
    var invisibleBoxMaterial = new THREE.MeshPhongMaterial({
      visible: false,
      transparent: true
    });
    var box = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      invisibleBoxMaterial
    );
    return box;
  }

  function createPlayer() {
    var personMaterial = new THREE.MeshPhongMaterial({
      color: 0x00dd00
    });

    var whiteMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff
    });
    var blackMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000
    });
    var playerBody = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 8),
      personMaterial
    );

    var mouth = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1, 0.1),
      blackMaterial
    );
    mouth.position.z = -4;
    mouth.position.y = -1;
    playerBody.add(mouth);
    playerBody.position.y = -4;
    playerBody.receiveShadow = true;
    playerBody.castShadow = true;

    var eyey = 2;
    var eyez = -2;
    [-2, 2].forEach(function(x) {
      var eye = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 2),
        personMaterial
      );
      var white = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.1),
        whiteMaterial
      );
      white.position.z = -1;
      eye.add(white);
      var pupil = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 2, 0.11),
        blackMaterial
      );
      pupil.position.z = -1;
      pupil.position.y = 0.5;
      eye.add(pupil);

      playerBody.add(eye);
      eye.position.z = eyez;
      eye.position.y = eyey;
      eye.position.x = x;
      eye.receiveShadow = true;
    });

    var legy = -3;
    [-3, 3].forEach(function(z) {
      [-2, 2].forEach(function(x) {
        var leg = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          personMaterial
        );
        playerBody.add(leg);
        leg.position.z = z;
        leg.position.y = legy;
        leg.position.x = x;
        leg.receiveShadow = true;
        leg.castShadow = true;
      });
    });

    var playerBox = createInvisibleBox();
    playerBox.name = 'playerBox';
    playerBox.add(playerBody);
    playerBody.position.y = 5;

    playerBox.data = {
      width: 8,
      depth: 8
    }

    return playerBox;
  }

  function createRoad(zPos) {
    var roadDepth = 10;
    var roadWidth = 400; //20 spaces
    var roadHeight = 1;
    var roadBorderDepth = 1;

    var road = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, roadHeight, roadDepth),
      new THREE.MeshLambertMaterial({
        color: 0x7b8396 //grey
      })
    );

    var counter = 0;
    var step = roadWidth/(2*20);
    for (var i = -roadWidth/2; i < roadWidth/2; i+= step) {
      if (counter % 2 === 0) {
        var roadBorder = new THREE.Mesh(
          new THREE.BoxGeometry(step, roadHeight, roadBorderDepth),
          new THREE.MeshLambertMaterial({
            color: 0xffffff
          })
        );
        road.add(roadBorder);
        roadBorder.receiveShadow = true;
        roadBorder.position.x = i+step/2;
        roadBorder.position.y = 0.1;
        roadBorder.position.z = (roadDepth/2) + roadBorderDepth;
      }
      ++counter;
    }

    road.name = 'road';
    road.receiveShadow = true;
    road.position.z = zPos;

    return road;
  }

  function createRiver(zPos) {

    //2 size buffer on both sides
    var river = new THREE.Mesh(
      new THREE.BoxGeometry(400, 1, 10),
      new THREE.MeshPhongMaterial({
        color: 0x80f5ff,
        shininess: 2
      })
    );
    river.receiveShadow = true;
    river.name = 'river';
    river.position.z = zPos;
    return river;
  }

  function createGrass(zPos) {
    var rowId = zPos / globals.blockSize;
    var color = rowId % 2 === 0 ? 0xbef566 : 0xb3e85f;
    var grass = new THREE.Mesh(
      new THREE.BoxGeometry(400, 2, 10),
      new THREE.MeshLambertMaterial({ color: color })
    );

    grass.name = 'grass';
    grass.castShadow = false;
    grass.receiveShadow = true;
    grass.position.z = zPos;
    grass.position.y = 1;
    return grass;
  }

  //height 1-3
  function createTree(xPos, zPos) {
    var numTreeStacks = support.getRandInt(1, 4);
    var treeSectionHeight = 7;
    var trunkHeight = 10;

    var trunk = new THREE.Mesh(
      new THREE.BoxGeometry(5, trunkHeight, 5),
      new THREE.MeshLambertMaterial({ color: 0x563631 })
    );
    trunk.castShadow = true;

    for (var i = 0; i < numTreeStacks; ++i) {
      var treeSection = new THREE.Mesh(
        new THREE.BoxGeometry(8, treeSectionHeight, 8),
        new THREE.MeshLambertMaterial({ color: 0x748E06 })
      );
      trunk.add(treeSection);
      treeSection.castShadow = true;
      treeSection.position.y = trunkHeight/2 + treeSectionHeight * i;
    }

    trunk.position.z = zPos;
    trunk.position.x = xPos;
    trunk.position.y = trunkHeight/2;
    trunk.name = 'tree';

    return trunk;
  }

  function createCar(width, origin, startPos, speed, zPos) {
    var colors = [ 0xfffe65, 0xff7035, 0x17EDFF, 0xBAF06C ];
    var secondaryColors = [ 0xe6e55b, 0xe66530, 0x15d5e6, 0xa7d861 ];
    var randInt = support.getRandInt(0, colors.length);
    var color = colors[randInt];
    var totalWidth = width*5 + 8;
    var car = new THREE.Mesh(
      new THREE.BoxGeometry(totalWidth, 6, 8),
      new THREE.MeshLambertMaterial({ color: color })
    );
    var carCenter = new THREE.Mesh(
      new THREE.BoxGeometry(totalWidth+0.1, 6+0.1, 5),
      new THREE.MeshLambertMaterial({ color: secondaryColors[randInt] })
    );
    car.add(carCenter);
    car.castShadow = true;
    var carBottom = new THREE.Mesh(
      new THREE.BoxGeometry(totalWidth+0.11, 1, 8+0.11),
      new THREE.MeshLambertMaterial({ color: 0xd8d5e0 })
    );
    carBottom.position.y = -2.5; //-3 + 0.5
    car.add(carBottom);

    var blackMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000
    });
    var hoodWidth = totalWidth*0.6;
    var carMirror = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 10),
      new THREE.MeshLambertMaterial({ color : color })
    );
    carMirror.position.y = 3 - 1; //1/2 height of body - 1/2 mirror height
    carMirror.position.x = -hoodWidth*0.1;
    car.add(carMirror);
    var hood = new THREE.Mesh(
      new THREE.BoxGeometry(hoodWidth, 3, 7),
      new THREE.MeshLambertMaterial({ color: color })
    );
    var hoodWindow = new THREE.Mesh(
      new THREE.BoxGeometry(hoodWidth + 0.5, 2, 5),
      blackMaterial
    );
    hoodWindow.position.y = -1;
    hood.add(hoodWindow);
    var hoodWindowSide1 = new THREE.Mesh(
      new THREE.BoxGeometry(hoodWidth*0.5, 2, 7.2),
      blackMaterial
    );
    hoodWindowSide1.position.y = -1;
    hoodWindowSide1.position.x = -hoodWidth*0.1;
    hood.add(hoodWindowSide1);
    var hoodWindowSide2 = new THREE.Mesh(
      new THREE.BoxGeometry(hoodWidth*0.1, 2, 7.2),
      blackMaterial
    );
    hoodWindowSide2.position.y = -1;
    hoodWindowSide2.position.x = hoodWidth*0.3;
    hood.add(hoodWindowSide2);
    car.add(hood);
    hood.position.y = 5;
    hood.position.x = totalWidth*0.3/2;

    [-1, 1].forEach(function(pos) {
      var wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 9),
        blackMaterial
      );
      wheel.rotation.x = support.toRad(90);
      car.add(wheel);
      wheel.position.y = -3;
      wheel.position.x = pos * totalWidth/4;
    });

    car.data = {
      origin: origin,
      startPos: startPos,
      speed: speed,
      zPos: zPos,
      width: totalWidth,
      depth: 8
    }
    car.name = 'car';
    car.position.y = 5.5;
    car.position.x = startPos;
    car.position.z = zPos;
    if (car.data.origin === 'left') {
      car.rotation.y = support.toRad(180);
    }
    return car;
  }

  //width from 1-3
  function createLog(width, origin, startPos, speed, zPos) {
    var totalWidth = width * 10 - 2;
    var log = new THREE.Mesh(
      new THREE.BoxGeometry(totalWidth, 2, 6),
      new THREE.MeshLambertMaterial({ color: 0x7f3f3d })
    );

    startPos = origin === 'right' ? startPos: -startPos;
    log.position.set(startPos, 1, zPos);

    log.data = {
      origin: origin,
      startPos: startPos,
      speed: speed,
      zPos: zPos,
      width: totalWidth,
      depth: 8
    };
    log.name = 'log';

    return log;
  }

  return {
    createInvisibleBox: createInvisibleBox,
    createPlayer: createPlayer,
    createRoad: createRoad,
    createRiver: createRiver,
    createGrass: createGrass,
    createTree: createTree,
    createCar: createCar,
    createLog: createLog
  };

})();