/*global Physijs, THREE, sceneSetup, globals, support, gameControls,
  player, vehicle, log, requestAnimationFrame*/
'use strict';

var game = (function () {
  var scene = new THREE.Scene();
  var camera;
  var clock = new THREE.Clock();
  var width = window.innerWidth;
  var height = window.innerHeight - 5;
  var playerBox;
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var playerActive = true;
  var light;

  renderer.setSize(width, height);
  renderer.setClearColor(0xE0EEEE);
  // enable shadows, turn off for now
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  document.getElementById("webgl-container").appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    30,
    width / height,
    1,
    1000
  );
  scene.add(camera);

  var ambientLight = new THREE.AmbientLight(0xcccccc);
  // scene.add(ambientLight);

  var pointLight = new THREE.PointLight( 0x404040, 0.1);
  // scene.add(pointLight);

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-50, 250, -50);
  spotLight.intensity = 0.25;

  var directionalLight = new THREE.DirectionalLight( 0x404040, 0.4 );
  directionalLight.position.set(globals.directionalLightBasePosition.x,
                                globals.directionalLightBasePosition.y,
                                globals.directionalLightBasePosition.z);
  directionalLight.shadowMapWidth = 1024;
  directionalLight.shadowMapHeight = 1024;
  directionalLight.shadowDarkness = 0.6;
  directionalLight.shadowCameraLeft = -145;
  directionalLight.shadowCameraRight = 145;
  directionalLight.shadowCameraTop = 145;
  directionalLight.shadowCameraBottom = -145;
  directionalLight.castShadow = true;
  //directionalLight.shadowCameraVisible = true; // only for debugging
  light = directionalLight;
  light.add(spotLight);
  light.add(pointLight);
  light.add(ambientLight);
  scene.add(light);

  function init() {

    //-45, 15, 0 degs
    camera.rotation.set(support.toRad(-60),
                        support.toRad(15),
                        support.toRad(15));
    camera.position.set(75, 150, 75);
    //camera.rotation.set(0, support.toRad(90), support.toRad(15));
    //camera.position.set(0, 20, 100);
    if (!player.playerBox()) {
      player.createPlayer();      
    }
    sceneSetup.addSceneObjects();
    gameControls.init();
    
    render();
  }

  function render() {
    var delta = clock.getDelta();
    vehicle.update(delta);
    log.update(delta);
    player.update(delta);
    if (vehicle.checkCollision() === true) {
      playerActive = false;
      player.flatten();
      gameControls.setBlocker();
    }
    sceneSetup.generateMoreRows();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  return {
    scene: scene,
    camera: camera,
    playerBox: playerBox,
    init: init,
    playerActive: function() {
      return playerActive;
    },
    light: light
  }

})();

window.onload = game.init();