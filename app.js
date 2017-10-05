const BACKGROUND_BASE_COLOR = 0x999999;
var CAMERA_SPEED = 0.03;

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var loader = new THREE.JSONLoader();
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0000, 0.0025 );
scene.background = new THREE.Color( 0x0000 );
var bg_texture_loader = new THREE.TextureLoader();
var horizontal_movement = false;
var vertical_movement = false;
controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );

var controlsEnabled = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

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
	console.log( "NOT SUPPORTED" );
}

var bg_texture = bg_texture_loader.load( 'assets/image/bg.jpg', function ( texture ) {
   	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
   	texture.offset.set( 0, 0 );
   	texture.repeat.set( 1, 1 );
   	scene.background = texture;

   	setInterval(function(){
   		texture.offset.x -= 0.005;
   	}, 30 );
} );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setClearColor( BACKGROUND_BASE_COLOR );
document.body.appendChild( renderer.domElement );

function setUp() {
	camera.position.z = 10;
	camera.position.y = 60;
	camera.position.x = 0;
	camera.rotation.x = 1.6;
	setupSky();
	addTerrain();
	setUpControls();
	window.addEventListener( 'resize', onWindowResize, false );
}

function setupSky() {
	var shade = 100;
	const change_amount = 10;
	const max_lightness = 150;

	var point_light = new THREE.PointLight( 0xFFFFFF, .5 );
	point_light.position.x = 10;
	point_light.position.y = 40;
	point_light.position.z = 10;
	//point_light.rotation.x = 0.5;
	point_light.castShadow = true;
	scene.add( point_light );

	var point_light = new THREE.PointLight( 0xccccff, .4 );
	point_light.position.x = -100;
	point_light.position.y = -120;
	point_light.position.z = 10;
	//point_light.rotation.x = 0.5;
	point_light.castShadow = true;
	scene.add( point_light );

	var point_light = new THREE.PointLight( 0xccccff, .4 );
	point_light.position.x = 100;
	point_light.position.y = -120;
	point_light.position.z = 10;
	//point_light.rotation.x = 0.5;
	point_light.castShadow = true;
	scene.add( point_light );

	var point_light = new THREE.PointLight( 0xffffff, .5 );
	point_light.position.x = 0;
	point_light.position.y = 280;
	point_light.position.z = 180;
	//point_light.rotation.x = 0.5;
	point_light.castShadow = true;
	scene.add( point_light );

}

function addTerrain() {
	var texture_loader = new THREE.TextureLoader();

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
	scene.add( sidewalk_left );
	
	var sidewalk_right = new THREE.Mesh( sidewalk_geometry, sidewalk_material );
	sidewalk_right.receiveShadow = true;
	sidewalk_right.castShadow = true;
	sidewalk_right.position.x = road_width / 2;
	scene.add( sidewalk_right );

	// Bridge sides
	const barrier_width = 4;
	const barrier_length = road_length;
	const barrier_height = 10;
	var barrier_geometry = new THREE.BoxGeometry( barrier_width, barrier_length, barrier_height );
	var barrier_material = sidewalk_material;

	var barrier_left = new THREE.Mesh( barrier_geometry, barrier_material );
	barrier_left.position.x = - (road_width / 2) - ( sidewalk_width / 2 );
	barrier_left.position.y = sidewalk_height;
	barrier_left.receiveShadow = true;
	barrier_left.castShadow = true;
	scene.add( barrier_left );

	var barrier_right = new THREE.Mesh( barrier_geometry, barrier_material );
	barrier_right.position.x = (road_width / 2) + ( sidewalk_width / 2 );
	barrier_right.position.y = sidewalk_height;
	barrier_right.receiveShadow = true;
	barrier_right.castShadow = true;
	scene.add( barrier_right );

	// Water
	const water_width = 400;
	const water_length = road_length;
	var water_geometry = new THREE.PlaneGeometry( water_width, water_length, water_width - 1, water_length - 1 );
	var water_material = new THREE.MeshPhongMaterial( {color: 0xaaaaFF, side: THREE.DoubleSide} );

	var water_left = new THREE.Mesh( water_geometry, water_material );
	water_left.position.x = - water_width + barrier_left.position.y + 120;
	scene.add( water_left );

	var water_right = new THREE.Mesh( water_geometry, water_material );
	water_right.position.x = water_width - barrier_left.position.y - 120;
	scene.add( water_right );

	// Distance road
	const south_road_width = 120;
	const south_road_length = 400
	var south_road_geometry = new THREE.PlaneGeometry( south_road_width, south_road_length, south_road_width - 1, south_road_length - 1 );
	var south_road = new THREE.Mesh( south_road_geometry, road_material );
	south_road.rotation.z = Math.PI / 2;
	south_road.rotation.x = 0.2;
	south_road.position.y = road_length - south_road_width;
	south_road.position.z = -15;	
	scene.add( south_road );

	const deep_south_road_width = 120;
	const deep_south_road_length = 800
	var deep_south_road_geometry = new THREE.PlaneGeometry( deep_south_road_width, deep_south_road_length, deep_south_road_width - 1, deep_south_road_length - 1 );
	var deep_south_road = new THREE.Mesh( deep_south_road_geometry, road_material );
	deep_south_road.rotation.z = Math.PI / 2;
	deep_south_road.rotation.x = - 0.2;
	deep_south_road.position.y = - road_length;
	deep_south_road.position.z = -10;	
	scene.add( deep_south_road );

	const north_road_width = 120;
	const north_road_length = 400
	var north_road_geometry = new THREE.PlaneGeometry( north_road_width, north_road_length, north_road_width - 1, north_road_length - 1 );
	var north_road = new THREE.Mesh( north_road_geometry, road_material );
	north_road.rotation.z = Math.PI / 2;
	north_road.rotation.x = - 0.2;
	north_road.position.y = - road_length + south_road_width;
	north_road.position.z = -15;	
	scene.add( north_road );

	// Land
	loader.load( "assets/model/terrain.json", function( geometry ) {
		var land_material = new THREE.MeshPhongMaterial( {color: 0x332200, side: THREE.DoubleSide} );

		const land_coordinates = [

			// South
			{
				'rotation': 0,
				'position': [ 0, -680, 0 ]
			},
			{
				'rotation': 0,
				'position': [ 500, -680, 0 ]
			},
			{
				'rotation': 0,
				'position': [ -500, -680, 0 ]
			},

			// North
			{
				'rotation': 0,
				'position': [ 0, 600, -20 ]
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
				'position': [ ( road_width / 2 ) + 10, -80, 0 ]
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 20, -120, 0 ]
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 20, -280, 0 ]
			},

			// North
			{
				'rotation': 0,
				'position': [ ( road_width / 2 ) + 20, 150, 0 ]
			}
		];

		for ( var i = 0; i < post_coordinates.length; ++i ) {
			var post_mesh = new THREE.Mesh( geometry, post_material );
			post_mesh.scale.set( 5, 5, 5 );
			post_mesh.position.set( post_coordinates[i]['position'][0], post_coordinates[i]['position'][1], post_coordinates[i]['position'][2] )
			post_mesh.rotation.y = post_coordinates[i]['rotation'];
			post_mesh.rotation.x = Math.PI / 2;
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
				'rotation': 3 * Math.PI / 4,
				'position': [ 170, -300, 0 ]
			},

			// North
			{
				'rotation': 2 * Math.PI / 3,
				'position': [ -130, 580, -100 ],
				'scale': 25
			},
			{
				'rotation': Math.PI / 2,
				'position': [ 100, 580, -25 ],
				'scale': 25
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
			post_mesh.rotation.x = Math.PI / 2;
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
				'position': [ 200, -240, 0 ]
			},
			{
				'rotation': Math.PI / 3,
				'position': [ -250, -380, 0 ]
			},
			{
				'rotation': Math.PI / 2,
				'position': [ -150, -480, 20 ]
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 20, -280, 0 ]
			},

			// North
			{
				'rotation': 2 * Math.PI / 3,
				'position': [ -60, 480, -15 ],
				'scale': 15
			},
			{
				'rotation': Math.PI / 2,
				'position': [ -200, 480, -15 ],
				'scale': 15
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
			post_mesh.rotation.x = Math.PI / 2;
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
				'position': [ 150, -380, 0 ]
			},
			{
				'rotation': Math.PI / 2,
				'position': [ -200, -380, 0 ]
			},
			{
				'rotation': Math.PI / 2,
				'position': [ -150, -480, 0 ]
			},
			{
				'rotation': Math.PI,
				'position': [ - ( road_width / 2 ) - 20, -380, 0 ]
			},

			// North
			{
				'rotation': 2 * Math.PI / 3,
				'position': [ 120, 480, -15 ],
				'scale': 15
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
			post_mesh.rotation.x = Math.PI / 2;
			post_mesh.castShadow = true;
			scene.add( post_mesh );
		}
	} );

}

function setUpControls() {
	setupMouse();
}

function setupMouse() {
	var previous = {
		screenX: 0,
		screenY: 0
	};

	document.onmousemove = function( evt ) {
		horizontal_movement = ( evt.screenX > previous.screenX ) ? 'right' : 'left';
		vertical_movement = ( evt.screenY > previous.screenY ) ? 'down' : 'up';
		previous.screenX = evt.screenX;
		previous.screenY = evt.screenY;
	};
}

function updateMouseLook() {
	if ( 'left' == horizontal_movement ) {
		camera.rotation.y += CAMERA_SPEED;
	} 
	if ( 'right' == horizontal_movement ) {
		camera.rotation.y -= CAMERA_SPEED;
	}
	if ( 'up' == vertical_movement ) {
		camera.rotation.x += ( CAMERA_SPEED / 2 );
	}
	if ( 'down' == vertical_movement ) {
		camera.rotation.x -= ( CAMERA_SPEED / 2 );
	}
	// Need to level off vertical rotation when moving horizontally.
	// Currently it spins off-axis like a globe
	horizontal_movement = false;
	vertical_movement = false;
	var PI_2_3 = 2 * Math.PI / 3;
	//camera.rotation.x = Math.max( Math.PI - PI_2_3, Math.min( PI_2_3, camera.rotation.x ) );
}


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
	requestAnimationFrame( render );
	//updateMouseLook();
	renderer.render( scene, camera );
}

setUp();
render();
