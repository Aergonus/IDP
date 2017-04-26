// Credits to threex.planets http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/

// Texture Loader
let textureLoader = new THREE.TextureLoader();

// Planet Proto
let planetProto = {
  sphere: function(size) {
    let sphere = new THREE.SphereGeometry(size, 32, 32);
	
    return sphere;
  },
  material: function(options) {
    let material = new THREE.MeshPhongMaterial();
    if (options) {
      for (var property in options) {
        material[property] = options[property];
      } 
    }
    
    return material;
  },
  glowMaterial: function(intensity, fade, color) {
    // Custom glow shader from https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: { 
        'c': {
          type: 'f',
          value: intensity
        },
        'p': { 
          type: 'f',
          value: fade
        },
        glowColor: { 
          type: 'c',
          value: new THREE.Color(color)
        },
        viewVector: {
          type: 'v3',
          value: camera.position
        }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`
      ,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() 
        {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }`
      ,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    return glowMaterial;
  },
  texture: function(material, property, uri) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = true;
    textureLoader.load(
      uri,
      function(texture) {
        material[property] = texture;
        material.needsUpdate = true;
      }
    );
  }
};

let createPlanet = function(options) {
  // Create the planet's Surface
  let surfaceGeometry = planetProto.sphere(options.surface.size);
  let surfaceMaterial = planetProto.material(options.surface.material);
  let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  
  // Create the planet's Atmosphere
  let atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
  let atmosphereMaterialDefaults = {
    side: THREE.DoubleSide,
    transparent: true
  }
  let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
  let atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
  let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  
  // Create the planet's Atmospheric glow
  let atmosphericGlowGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
  let atmosphericGlowMaterial = planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
  let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);
  
  // Nest the planet's Surface and Atmosphere into a planet object
  let planet = new THREE.Object3D();
  surface.name = 'surface';
  atmosphere.name = 'atmosphere';
  atmosphericGlow.name = 'atmosphericGlow';
  planet.add(surface);
  planet.add(atmosphere);
  planet.add(atmosphericGlow);

  // Load the Surface's textures
  for (let textureProperty in options.surface.textures) {
    planetProto.texture(
      surfaceMaterial,
      textureProperty,
      options.surface.textures[textureProperty]
    ); 
  }
  
  // Load the Atmosphere's texture
  for (let textureProperty in options.atmosphere.textures) {
    planetProto.texture(
      atmosphereMaterial,
      textureProperty,
      options.atmosphere.textures[textureProperty]
    );
  }
  
  return planet;
};

// Marker Proto
let markerProto = {
  latLongToVector3: function latLongToVector3(latitude, longitude, radius, height) {
    var phi = (latitude)*Math.PI/180;
    var theta = (longitude-180)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+height) * Math.sin(phi);
    var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
  },
  marker: function marker(size, color, vector3Position) {
    let markerGeometry = new THREE.SphereGeometry(size);
    let markerMaterial = new THREE.MeshLambertMaterial({
      color: color
    });
    let markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.copy(vector3Position);
    
    return markerMesh;
  }
}

// Place Marker
let placeMarker = function(object, options) {
  let position = markerProto.latLongToVector3(options.latitude, options.longitude, options.radius, options.height);
  let marker = markerProto.marker(options.size, options.color, position);
  object.add(marker);
}

// Place Marker At Address
let placeMarkerAtAddress = function(address, color) {
  let encodedLocation = address.replace(/\s/g, '+');
  let httpRequest = new XMLHttpRequest();
  
  httpRequest.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedLocation);
  httpRequest.send(null);
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      let result = JSON.parse(httpRequest.responseText);
      
      if (result.results.length > 0) {
        let latitude = result.results[0].geometry.location.lat;
        let longitude = result.results[0].geometry.location.lng;

        placeMarker(earth.getObjectByName('surface'),{
          latitude: latitude,
          longitude: longitude,
          radius: 0.5,
          height: 0,
          size: 0.01,
          color: color,
        });
      }
    }
  };
}

// Tank Proto
let tankProto = {
	body: function(width, height, depth) {
		let body = new THREE.BoxGeometry(width, height, depth);
		
		return body;
	},
	turret: function(width, height, depth) {
		let turret = new THREE.BoxGeometry(width, height, depth);
		
		return turret;
	},
	gun: function(width, height, depth) {
		let gun = new THREE.BoxGeometry(width, height, depth);
		
		return gun;
	},
	material: function() {
		let material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
	}
}

let createTank = function(options) {
	var groupTank = new THREE.Group();
	
	let tankMaterial = tankProto.material();
	
	let bodyGeometry = tankProto.body( 72, 42, 120 );
	let bodyMesh = new THREE.Mesh( bodyGeometry, tankMaterial );
	groupTank.add( bodyMesh );
	
	groupUpper = new THREE.Group();
	groupUpper.position.y = 35.0;
	groupTank.add( groupUpper );
	
	let turretGeometry = tankProto.turret( 40, 28, 68 );
	let turretMesh = new THREE.Mesh( turretGeometry, tankMaterial );
	groupUpper.add( turretMesh );
	
	let gunHolder = new THREE.Object3D();
	let gunGeometry = tankProto.gun( 10.0, 10.0, 80.0 );
	let gunMesh = new THREE.Mesh( gunGeometry, tankMaterial );
	gunMesh.position.z = 40.0;
	gunHolder.position.set( 0.0, 3.0, 34.0 );
	gunHolder.add( gunMesh );
	groupUpper.add( gunHolder );
	
	groupTank.turret = groupUpper;
	groupTank.gun = gunHolder;
	
	return groupTank;
}