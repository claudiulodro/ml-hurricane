var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var loader = new THREE.JSONLoader();
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0000, 0.0015 );
scene.background = new THREE.Color( 0x0000 );
var bg_texture_loader = new THREE.TextureLoader();
controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );
mobileControls = new THREE.DeviceOrientationControls( camera );
var lastTime = ( new Date() ).getTime();
var ms_Ocean = false;

var controlsEnabled = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

var bg_texture = bg_texture_loader.load( 'assets/image/bg.jpg', function ( texture ) {
   	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
   	texture.offset.set( 0, 0 );
   	texture.repeat.set( 1, 1 );
   	scene.background = texture;

   	// Move sky.
   	setInterval( function(){
   		texture.offset.x -= 0.002;
   	}, 30 );
} );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.context.getExtension('OES_texture_float');
renderer.context.getExtension('OES_texture_float_linear');
document.body.appendChild( renderer.domElement );

function setUp() {
	camera.position.z = 17;
	camera.position.y = 0;
	camera.position.x = 0;
	camera.rotation.x = 1.6;
	setupSky();
	setUpWater();
	addTerrain();
	setUpControls();
	window.addEventListener( 'resize', onWindowResize, false );
}

function setupSky() {
	var point_light = new THREE.PointLight( 0xFFFFFF, .8 );
	point_light.position.x = 10;
	point_light.position.y = 200;
	point_light.position.z = 40;
	point_light.castShadow = true;
	scene.add( point_light );
}

function setUpWater() {
	var gsize = 512;
	var res = 1024;
	var gres = res / 2;
	var origx = -gsize / 2;
	var origz = -gsize / 2;
	ms_Ocean = new THREE.Ocean(renderer, camera, scene,
		{
			USE_HALF_FLOAT : true,
			INITIAL_SIZE : 380,
			INITIAL_WIND : [4.0, 4.0],
			INITIAL_CHOPPINESS : 4,
			CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
			GEOMETRY_ORIGIN : [origx, origz],
			SUN_DIRECTION : [1.0, -1.0, 1.0],
			OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.027),
			SKY_COLOR: new THREE.Vector3(1, 1, 2.8),
			EXPOSURE : 0.01,
			GEOMETRY_RESOLUTION: gres,
			GEOMETRY_SIZE : gsize,
			RESOLUTION : res
	});
	ms_Ocean.materialOcean.uniforms.u_projectionMatrix = { value: camera.projectionMatrix };
	ms_Ocean.materialOcean.uniforms.u_viewMatrix = { value: camera.matrixWorldInverse };
	ms_Ocean.materialOcean.uniforms.u_cameraPosition = { value: camera.position };
	scene.add(ms_Ocean.oceanMesh);
}

function updateOcean() {
	var currentTime = new Date().getTime();
	ms_Ocean.deltaTime = (currentTime - lastTime) / 1000 || 0.0;
	lastTime = currentTime;
	ms_Ocean.render(ms_Ocean.deltaTime);
	ms_Ocean.overrideMaterial = ms_Ocean.materialOcean;
	if (ms_Ocean.changed) {
		ms_Ocean.materialOcean.uniforms.u_size.value = ms_Ocean.size;
		ms_Ocean.materialOcean.uniforms.u_sunDirection.value.set( ms_Ocean.sunDirectionX, ms_Ocean.sunDirectionY, ms_Ocean.sunDirectionZ );
		ms_Ocean.materialOcean.uniforms.u_exposure.value = ms_Ocean.exposure;
		ms_Ocean.changed = false;
	}
	ms_Ocean.materialOcean.uniforms.u_normalMap.value = ms_Ocean.normalMapFramebuffer.texture;
	ms_Ocean.materialOcean.uniforms.u_displacementMap.value = ms_Ocean.displacementMapFramebuffer.texture;
	ms_Ocean.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix;
	ms_Ocean.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse;
	ms_Ocean.materialOcean.uniforms.u_cameraPosition.value = camera.position;
	ms_Ocean.materialOcean.depthTest = true;
}

function addTerrain() {
	var texture_loader = new THREE.TextureLoader();
	const bridge_height = 7;
	const bridge_rotation = - 0.05;

	// Road
	const road_width = 120;
	const road_length = 360;
	var road_geometry = new THREE.PlaneGeometry( road_width, road_length, road_width - 1, road_length - 1 );

	var road_texture = texture_loader.load( 'assets/image/asphalt.jpg', function ( texture ) {
    	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    	texture.offset.set( 0, 0 );
    	texture.repeat.set( 8, 16 );
	} );

	var road_material = new THREE.MeshLambertMaterial( { transparent: false, map: road_texture, side: THREE.DoubleSide} );

	var road = new THREE.Mesh( road_geometry, road_material );
	road.position.z = bridge_height;
	road.rotation.x = bridge_rotation;
	road.receiveShadow = true;
	scene.add( road );

	// Sidewalks
	const sidewalk_width = 20;
	const sidewalk_length = road_length;
	const sidewalk_height = 4;
	var sidewalk_geometry = new THREE.BoxGeometry( sidewalk_width, sidewalk_length, sidewalk_height );
	var sidewalk_texture = texture_loader.load( 'assets/image/concrete.png', function ( texture ) {
    	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    	texture.offset.set( 0, 0 );
    	texture.repeat.set( 1, 40 );
	} );

	var sidewalk_material = new THREE.MeshLambertMaterial( { transparent: false, map: sidewalk_texture, side: THREE.DoubleSide} );

	var sidewalk_left = new THREE.Mesh( sidewalk_geometry, sidewalk_material );
	sidewalk_left.receiveShadow = true;
	sidewalk_left.castShadow = true;
	sidewalk_left.position.x = - road_width / 2;
	sidewalk_left.position.z = bridge_height;
	sidewalk_left.rotation.x = bridge_rotation;
	scene.add( sidewalk_left );
	
	var sidewalk_right = new THREE.Mesh( sidewalk_geometry, sidewalk_material );
	sidewalk_right.receiveShadow = true;
	sidewalk_right.castShadow = true;
	sidewalk_right.position.x = road_width / 2;
	sidewalk_right.position.z = bridge_height;
	sidewalk_right.rotation.x = bridge_rotation;
	scene.add( sidewalk_right );

	// Bridge sides
	const barrier_width = 4;
	const barrier_length = road_length;
	const barrier_height = 8;
	var barrier_geometry = new THREE.BoxGeometry( barrier_width, barrier_length, barrier_height );
	var barrier_material = sidewalk_material;

	var barrier_left = new THREE.Mesh( barrier_geometry, barrier_material );
	barrier_left.position.x = - (road_width / 2) - ( sidewalk_width / 2 );
	barrier_left.position.y = sidewalk_height;
	barrier_left.position.z = bridge_height;
	barrier_left.receiveShadow = true;
	barrier_left.castShadow = true;
	barrier_left.rotation.x = bridge_rotation;
	scene.add( barrier_left );

	var barrier_right = new THREE.Mesh( barrier_geometry, barrier_material );
	barrier_right.position.x = (road_width / 2) + ( sidewalk_width / 2 );
	barrier_right.position.y = sidewalk_height;
	barrier_right.position.z = bridge_height;
	barrier_right.receiveShadow = true;
	barrier_right.castShadow = true;
	barrier_right.rotation.x = bridge_rotation;
	scene.add( barrier_right );

	// Distance road
	const north_road_width = 100;
	const north_road_length = 120
	var north_road_geometry = new THREE.PlaneGeometry( north_road_width, north_road_length, north_road_width - 1, north_road_length - 1 );
	var north_road = new THREE.Mesh( north_road_geometry, road_material );
	north_road.rotation.z = Math.PI / 2;
	north_road.rotation.x = 0.2;
	north_road.position.y = road_length - 60;
	north_road.position.z = bridge_height;	
	scene.add( north_road );

	// Land
	loader.load( "assets/model/terrain.json", function( geometry ) {
		var land_material = new THREE.MeshPhongMaterial( {color: 0x967e61, side: THREE.DoubleSide} );

		const land_coordinates = [

			// South
			{
				'rotation': 0,
				'position': [ 0, 480, -4 ]
			},
			{
				'rotation': Math.PI / 4,
				'position': [ 500, 480, 0 ]
			},
			{
				'rotation': Math.PI / 4,
				'position': [ -500, 480, 0 ]
			},
			{
				'rotation': Math.PI / 4,
				'position': [ -900, 380, -40 ]
			},

			// North
			{
				'rotation': Math.PI,
				'position': [ 0, -640, 0 ]
			}
		];

		for ( var i = 0; i < land_coordinates.length; ++i ) {
			var post_mesh = new THREE.Mesh( geometry, land_material );
			post_mesh.scale.set( 45, 15, 15 );
			post_mesh.position.set( land_coordinates[i]['position'][0], land_coordinates[i]['position'][1], land_coordinates[i]['position'][2] )
			post_mesh.rotation.y = land_coordinates[i]['rotation'];
			post_mesh.rotation.x = Math.PI / 2;
			post_mesh.castShadow = true;
			scene.add( post_mesh );
		}
	} );

	// Lamp posts
	loader.load( "assets/model/lamppost.json?46", function( geometry ) {
		var post_texture = texture_loader.load( 'assets/image/asphalt.jpg', function ( texture ) {
    		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    		texture.offset.set( 0, 0 );
    		texture.repeat.set( 3, 80 );
		} );

		var post_material = new THREE.MeshLambertMaterial( { transparent: false, map: post_texture, side: THREE.DoubleSide} );

		const post_coordinates = [

			// South
			{
				'rotation': 0,
				'position': [ ( road_width / 2 ) + 10, 80, 0 ]
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 20, 120, 0 ]
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 20, 230, 0 ],
				'skew': Math.PI / 4
			},

			// North
			{
				'rotation': 0,
				'position': [ ( road_width / 2 ) + 20, -150, 0 ]
			}
		];

		for ( var i = 0; i < post_coordinates.length; ++i ) {
			var post_mesh = new THREE.Mesh( geometry, post_material );
			post_mesh.scale.set( 5, 5, 5 );
			post_mesh.position.set( post_coordinates[i]['position'][0], post_coordinates[i]['position'][1], post_coordinates[i]['position'][2] )
			post_mesh.rotation.y = post_coordinates[i]['rotation'];
			if ( 'undefined' === typeof post_coordinates[i]['skew'] ) {
				post_mesh.rotation.x = Math.PI / 2;
			} else {
				post_mesh.rotation.x = post_coordinates[i]['skew'];
			}
			post_mesh.castShadow = true;
			scene.add( post_mesh );
		}
	} );

	// House 1
	loader.load( "assets/model/house1.json?46", function( geometry ) {
		var house_texture = texture_loader.load( 'assets/image/house1.jpg?46', function ( texture ) {
    		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    		texture.offset.set( 0, -0.3 );
    		texture.repeat.set( 2, 2 );
		} );

		var house_material = new THREE.MeshLambertMaterial( { transparent: false, map: house_texture, side: THREE.DoubleSide} );

		const post_coordinates = [

			// South
			{
				'rotation': Math.PI / 2,
				'position': [ 130, 300, 10 ],
				'scale': 8,
				'skew': - 2 * Math.PI / 3
			},

			// North
			{
				'rotation': 2 * Math.PI / 3,
				'position': [ -130, -580, 10 ],
				'scale': 7
			},
			{
				'rotation': Math.PI / 2,
				'position': [ 100, -580, 30 ],
				'scale': 7
			}	
		];

		for ( var i = 0; i < post_coordinates.length; ++i ) {
			var post_mesh = new THREE.Mesh( geometry, house_material );
			if ( 'undefined' === typeof post_coordinates[i]['scale'] ) {
				post_mesh.scale.set( 5, 5, 5 );
			} else {
				post_mesh.scale.set( post_coordinates[i]['scale'], post_coordinates[i]['scale'], post_coordinates[i]['scale'] );
			}
			if ( 'undefined' === typeof post_coordinates[i]['skew'] ) {
				post_mesh.rotation.x = Math.PI / 2;
			} else {
				post_mesh.rotation.x = post_coordinates[i]['skew'];
			}
			post_mesh.position.set( post_coordinates[i]['position'][0], post_coordinates[i]['position'][1], post_coordinates[i]['position'][2] )
			post_mesh.rotation.y = post_coordinates[i]['rotation'];
			post_mesh.castShadow = true;
			scene.add( post_mesh );
		}
	} );

	// House 2
	loader.load( "assets/model/house2.json?46", function( geometry ) {
		var house_texture = texture_loader.load( 'assets/image/house2.jpg', function ( texture ) {
    		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    		texture.offset.set( -0.05, -0.2 );
    		texture.repeat.set( 3, 3 );
		} );

		var house_material = new THREE.MeshLambertMaterial( { transparent: false, map: house_texture, side: THREE.DoubleSide} );

		const post_coordinates = [

			// South
			{
				'rotation': Math.PI / 3,
				'position': [ 200, 220, -30 ],
				'scale': 9,
				'skew': 3 * Math.PI / 4
			},
			{
				'rotation': Math.PI,
				'position': [ -250, 440, 20 ],
				'scale': 8
			},
			{
				'rotation': 3 * Math.PI / 4,
				'position': [ -40, 480, 20 ],
				'scale': 7
			},
			{
				'rotation': Math.PI / 2,
				'position': [ ( road_width / 2 ) + 60, 420, 0 ],
				'scale': 7,
				'skew': 3 * Math.PI / 5
			},

			// North
			{
				'rotation': 2 * Math.PI / 3,
				'position': [ 120, -520, 35 ],
				'scale': 7
			},
			{
				'rotation': Math.PI / 2,
				'position': [ -200, -520, 5 ],
				'scale': 7
			}	
		];

		for ( var i = 0; i < post_coordinates.length; ++i ) {
			var post_mesh = new THREE.Mesh( geometry, house_material );
			if ( 'undefined' === typeof post_coordinates[i]['scale'] ) {
				post_mesh.scale.set( 5, 5, 5 );
			} else {
				post_mesh.scale.set( post_coordinates[i]['scale'], post_coordinates[i]['scale'], post_coordinates[i]['scale'] );
			}
			post_mesh.position.set( post_coordinates[i]['position'][0], post_coordinates[i]['position'][1], post_coordinates[i]['position'][2] )
			post_mesh.rotation.y = post_coordinates[i]['rotation'];
			if ( 'undefined' === typeof post_coordinates[i]['skew'] ) {
				post_mesh.rotation.x = Math.PI / 2;
			} else {
				post_mesh.rotation.x = post_coordinates[i]['skew'];
			}
			post_mesh.castShadow = true;
			scene.add( post_mesh );
		}
	} );

	// House 3
	loader.load( "assets/model/house3.json?46", function( geometry ) {
		var house_texture = texture_loader.load( 'assets/image/house3.jpg', function ( texture ) {
    		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    		texture.offset.set( 0, -0.3 );
    		texture.repeat.set( 2, 3 );
		} );

		var house_material = new THREE.MeshLambertMaterial( { transparent: false, map: house_texture, side: THREE.DoubleSide} );

		const post_coordinates = [

			// South
			{
				'rotation': Math.PI / 3,
				'position': [ 150, 480, 0 ],
				'skew': Math.PI / 4
			},
			{
				'rotation': Math.PI,
				'position': [ -200, 420, 15 ],
				'scale': 7
			},
			{
				'rotation': 0,
				'position': [ -150, 480, 15 ],
				'scale': 7
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 30, 400, 5 ],
				'scale': 7
			},

			// North
			{
				'rotation': 0,
				'position': [ 160, -570, 25 ],
				'scale': 7
			}	
		];

		for ( var i = 0; i < post_coordinates.length; ++i ) {
			var post_mesh = new THREE.Mesh( geometry, house_material );
			if ( 'undefined' === typeof post_coordinates[i]['scale'] ) {
				post_mesh.scale.set( 5, 5, 5 );
			} else {
				post_mesh.scale.set( post_coordinates[i]['scale'], post_coordinates[i]['scale'], post_coordinates[i]['scale'] );
			}
			post_mesh.position.set( post_coordinates[i]['position'][0], post_coordinates[i]['position'][1], post_coordinates[i]['position'][2] )
			post_mesh.rotation.y = post_coordinates[i]['rotation'];
			if ( 'undefined' === typeof post_coordinates[i]['skew'] ) {
				post_mesh.rotation.x = Math.PI / 2;
			} else {
				post_mesh.rotation.x = post_coordinates[i]['skew'];
			}
			post_mesh.castShadow = true;
			scene.add( post_mesh );
		}
	} );

}

function setUpControls() {
	setupMouse();
}

function setupMouse() {
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		const pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				controlsEnabled = true;
				controls.enabled = true;
			} else {
				controls.enabled = false;
			}
		};

		const pointerlockerror = function ( event ) {
			console.log( "ERROR" );
			console.log( event );
		}

		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		element.addEventListener( 'click', function ( event ) {

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();

		}, false );

	} else {
		console.log( "POINTERLOCK NOT SUPPORTED" );
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
	requestAnimationFrame( render );
	mobileControls.update();
	updateOcean();
	renderer.render( scene, camera );
}

setUp();
render();
