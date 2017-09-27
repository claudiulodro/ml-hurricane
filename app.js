const BACKGROUND_BASE_COLOR = 0x333333;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( BACKGROUND_BASE_COLOR );
document.body.appendChild( renderer.domElement );

function setUp() {
	camera.position.z = 10;
	camera.position.y = 60;
	camera.position.x = 0;
	camera.rotation.x = 1.6;
	addTerrain();
	addLight();

	window.addEventListener( 'resize', onWindowResize, false );
}

function addTerrain() {

	//road
	const road_width = 120;
	const road_length = 360;
	var road_geometry = new THREE.PlaneGeometry( road_width, road_length, road_width - 1, road_length - 1 );
	var road_material = new THREE.MeshLambertMaterial( {color: 0xeeeeee, side: THREE.DoubleSide} );
	var road = new THREE.Mesh( road_geometry, road_material );
	scene.add( road );

	//sidewalks
	const sidewalk_width = 20;
	const sidewalk_length = road_length;
	const sidewalk_height = 4;
	var sidewalk_geometry = new THREE.BoxGeometry( sidewalk_width, sidewalk_length, sidewalk_height );
	var sidewalk_material = new THREE.MeshLambertMaterial( {color: 0xdddddd} );
	var sidewalk_left = new THREE.Mesh( sidewalk_geometry, sidewalk_material );
	sidewalk_left.position.x = - road_width / 2;
	scene.add( sidewalk_left );
	var sidewalk_right = new THREE.Mesh( sidewalk_geometry, sidewalk_material );
	sidewalk_right.position.x = road_width / 2;
	scene.add( sidewalk_right );

	//bridge sides
	const barrier_width = 4;
	const barrier_length = road_length;
	const barrier_height = 10;
	var barrier_geometry = new THREE.BoxGeometry( barrier_width, barrier_length, barrier_height );
	var barrier_material = new THREE.MeshLambertMaterial( {color: 0xFFFFFF} );
	var barrier_left = new THREE.Mesh( barrier_geometry, barrier_material );
	barrier_left.position.x = - (road_width / 2) - ( sidewalk_width / 2 );
	barrier_left.position.y = sidewalk_height;
	scene.add( barrier_left );
	var barrier_right = new THREE.Mesh( barrier_geometry, barrier_material );
	barrier_right.position.x = (road_width / 2) + ( sidewalk_width / 2 );
	barrier_right.position.y = sidewalk_height;
	scene.add( barrier_right );

	//water
	const water_width = 200;
	const water_length = road_length;
	var water_geometry = new THREE.PlaneGeometry( water_width, water_length, water_width - 1, water_length - 1 );
	var water_material = new THREE.MeshPhongMaterial( {color: 0x0000FF, side: THREE.DoubleSide} );
	var water_left = new THREE.Mesh( water_geometry, water_material );
	water_left.position.x = - water_width + barrier_left.position.y + 40;
	scene.add( water_left );
	var water_right = new THREE.Mesh( water_geometry, water_material );
	water_right.position.x = water_width - barrier_left.position.y - 40;
	scene.add( water_right );

	//distance ground

	//houses

}

function addLight() {
	var point_light = new THREE.PointLight( 0xFFFFFF, .75 );
	point_light.position.x = 10;
	point_light.position.y = 40;
	point_light.position.z = 20;
	point_light.rotation.x = 0.5;
	scene.add( point_light );
}

function setUpControls() {

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
	camera.rotation.y += 0.001;
}

setUp();
render();
