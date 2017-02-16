// Cube Array
var cubes = []; // General array [] 
// Size of cubes
var cDim = 6, cEdge = 4;
var coff = cDim + cEdge;
var worldEdge = 1000;

function createCubes(numCubes)
{
	var newCubes = [];
	for(var i = cubes.length; i < numCubes; ++i)
	{
		var cubeGeometry = new THREE.BoxGeometry(cDim * Math.random() + cEdge, cDim * Math.random() + cEdge, cDim * Math.random() + cEdge);
		var cubeMaterial = setCubeMaterial();
		var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial[i]);
		cubeMesh.position.set(- 16 * Math.random() + 8, cDim * 4 * Math.random(), - 700 * Math.random() - 25 );
		cubeMesh.name = "Obstacle";
		newCubes.push(cubeMesh);
	}
	return newCubes;
}

var redMaterial = new THREE.MeshPhongMaterial({ color: 0xFF2F2F, shininess: 0.25  });
var greenMaterial = new THREE.MeshPhongMaterial({ color: 0x24FF24, shininess: 0.25  });
var blueMaterial = new THREE.MeshPhongMaterial({ color: 0x3E3EFF , shininess: 0.25 });
var blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 0.25 });
var yellowMaterial = new THREE.MeshPhongMaterial({ color: 0xF7FC12, shininess: 0.25  });
var orangeMaterial = new THREE.MeshPhongMaterial({ color: 0xFA6721, shininess: 0.25  });
var whiteMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF, shininess: 0.205 });
var texture1 = THREE.ImageUtils.loadTexture('media/texture1.jpg');
var texture2 = THREE.ImageUtils.loadTexture('media/texture2.jpg');
var texture3 = THREE.ImageUtils.loadTexture('media/texture3.jpg');
var texture4 = THREE.ImageUtils.loadTexture('media/texture4.jpg');
var texture5 = THREE.ImageUtils.loadTexture('media/texture5.jpg');
var texture6 = THREE.ImageUtils.loadTexture('media/texture6.jpg');
var texture7 = THREE.ImageUtils.loadTexture('media/texture7.jpg');
var texture8 = THREE.ImageUtils.loadTexture('media/texture8.jpg');
var texture9 = THREE.ImageUtils.loadTexture('media/texture9.jpg');

// Black Specular 
var blackHex = 0x010101;
redMaterial.specular.setHex(blackHex);
greenMaterial.specular.setHex(blackHex);
blueMaterial.specular.setHex(blackHex);
blackMaterial.specular.setHex(blackHex);
yellowMaterial.specular.setHex(blackHex);
orangeMaterial.specular.setHex(blackHex);
whiteMaterial.specular.setHex(blackHex);
	
function setCubeMaterial() 
{
	var cubeMaterial = [];
	var curTexture;
	var randText = Math.floor(8 * Math.random());
	switch(randText) {
		case 0:
			curTexture = texture1; break;
		case 1:
			curTexture = texture2; break;
		case 2:
			curTexture = texture3; break;
		case 3:
			curTexture = texture4; break;
		case 4:
			curTexture = texture5; break;
		case 5:
			curTexture = texture6; break;
		case 6:
			curTexture = texture7; break;
		case 7:
			curTexture = texture8; break;
		case 8:
			curTexture = texture9; break;
	}
	console.log(curTexture);
	
	for (var i = 0; i < 6; ++i)
	{	
		cubeMaterial.push(new THREE.MeshPhongMaterial({color: 0xFFFFFF*Math.random(), shininess: 0.205 , map: curTexture}));
	}
	return cubeMaterial;
}
