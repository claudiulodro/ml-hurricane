const BACKGROUND_BASE_COLOR = 0x333333;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( BACKGROUND_BASE_COLOR );
document.body.appendChild( renderer.domElement );

function setUp() {

}

function addTerrain() {

}

function addLight() {

}

function setUpControls() {

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize, false );

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

setUp();
render();
