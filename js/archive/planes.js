function createPlanes()
{
	var planeArray = [];
	geometry = new THREE.PlaneGeometry( 20, 2000, 1, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) ); // Makes plane "horizontal" instead of "vertical"
	var texture = THREE.ImageUtils.loadTexture('media/ground.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 64 );
	material = new THREE.MeshLambertMaterial({color: 0xC0B352, map: texture, fog: true});
	//material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, transparent: true});

	ground = new THREE.Mesh( geometry, material );
	planeArray.push(ground);
	
	geometry = new THREE.PlaneGeometry( 400, 1200, 10, 20 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2) ); // Makes plane "horizontal" instead of "vertical"
	geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( - Math.PI / 2) );
	var texture = THREE.ImageUtils.loadTexture('media/ground.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 16, 48 );
	material = new THREE.MeshLambertMaterial({map: texture, fog: true});

	plane = new THREE.Mesh( geometry, material );
	plane.position.set(-10, 100, -500);
	planeArray.push(plane);

	geometry = new THREE.PlaneGeometry( 400, 1200, 10, 20 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2) ); // Makes plane "horizontal" instead of "vertical"
	geometry.applyMatrix( new THREE.Matrix4().makeRotationZ(   Math.PI / 2) );
	var texture = THREE.ImageUtils.loadTexture('media/ground.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 16, 48 );
	material = new THREE.MeshLambertMaterial({map: texture, fog: true});

	plane = new THREE.Mesh( geometry, material );
	plane.position.set(10, 100, -500);
	planeArray.push(plane);
	
	return planeArray;
}
