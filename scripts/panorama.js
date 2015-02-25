/*
 * Vienna Ly
 * July 31, 2013
 * 360 spherical panorama based on three.js
 */

/*
* SET PANO PARMETERS
*/
var mat = 'images/3998_1999.jpg', //http://sky.easypano.com/EPSUpload/Pano/2013/05-03/11/635031780108210803/upload.jpg
	panoSize = {w: 900, h: 450},
	ratio_wh =panoSize.w / panoSize.h,
	$info_window;

var CAMERA, SCENE, RENDERER, PROJECTOR, SELECTED;

// for pano drag				
var fov = 60, 
	texture_placeholder,
	isUserInteracting = false,
	lon = 0, lat = 0, 
	phi = 0, theta = 0;

$(document).ready(function() {
	init();
	animate();
});

function init() {

	var $container;
	
	$container = $( "#container" );
	$info_window = $( "#info_window" );
	$info_window.hide();
	$info_window.on("click", function() {isUserInteracting = false;})
	
	panoSize.w = $container.width();
					
	CAMERA = new THREE.PerspectiveCamera( fov, ratio_wh, 1, 1000 );
	CAMERA.target = new THREE.Vector3( 0, 0, 0 );

	SCENE = new THREE.Scene();
		
	// light
	SCENE.add( new THREE.AmbientLight( 0x222222 ) );
	           
	// light
	var light = new THREE.PointLight( 0xaaaaaa );
	light.position = CAMERA.position;
	SCENE.add( light );		
	
	// background pano -- spherical pano img
	var mesh = new THREE.Mesh( new THREE.SphereGeometry( 1000, 20, 20 ), new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( mat ) } ) );
	mesh.scale.z = -1;
	SCENE.add( mesh );
	
	CreateObjects();

	PROJECTOR = new THREE.Projector();	
	
	RENDERER = new THREE.WebGLRenderer();
	RENDERER.setSize( panoSize.w, panoSize.h );

	$container.append( RENDERER.domElement );
	// events
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);
	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
	panoSize.w =  $( '#container' ).width();
	ratio_wh = panoSize.w/panoSize.h;
	CAMERA.aspect =  ratio_wh;
	CAMERA.updateProjectionMatrix();
	
	RENDERER.setSize( panoSize.w, panoSize.h );

}


function onDocumentMouseDown( event ) {

	event.preventDefault();
	var ar_objects = [],
    	intersects;
    	       
	var vector = hitVector(event);
    PROJECTOR.unprojectVector( vector, CAMERA );
    
    var ray = new THREE.Raycaster( CAMERA.position, vector.sub( CAMERA.position ).normalize());
		
	intersects = ray.intersectObjects(OBJECTS); 
	
	if ( intersects.length > 0 ) {
    	SELECTED = intersects[0].object;
    	
    	container.style.cursor = 'help';
    	isUserInteracting = false;
    	
    	var pos = { x: event.clientX, y: event.clientY }
    	$info_window.show();
    	$("#info").html(SELECTED.description);
    	//$info_window.css("left", pos.x + 50);
    	//$info_window.css("top", pos.y - $info_window.height() - 50);
    	
 	} else {  // pano bg drag
 		container.style.cursor = 'col-resize';
	   	isUserInteracting = true;
		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;
		onPointerDownLon = lon;
		onPointerDownLat = lat;
   }

}

function onDocumentMouseMove( event ) {
	event.preventDefault();
 
	// pano drag
	if ( isUserInteracting ) {
		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
		//console.log(lon);
		$info_window.hide();
	} 
	
	
	var ar_objects = [],
    	intersects;
    	       
	var vector = hitVector(event);
    PROJECTOR.unprojectVector( vector, CAMERA );
    
    var ray = new THREE.Raycaster( CAMERA.position, vector.sub( CAMERA.position ).normalize());
		
	intersects = ray.intersectObjects(OBJECTS); 
	
	if ( intersects.length > 0 ) {
		container.style.cursor = 'help';
	} else {
		container.style.cursor = 'default';
	}
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	isUserInteracting = false;
	container.style.cursor = 'auto';
}

function onDocumentMouseWheel( event ) {
	var boundsMin = 20, boundsMax = 70;
	// WebKit

	if ( event.wheelDeltaY ) {

		fov -= event.wheelDeltaY * 0.05;

	// Opera / Explorer 9

	} else if ( event.wheelDelta ) {

		fov -= event.wheelDelta * 0.05;

	// Firefox

	} else if ( event.detail ) {

		fov += event.detail * 1.0;

	}

	fov = (fov < boundsMin)? boundsMin : fov;
	fov = (fov > boundsMax)? boundsMax : fov;
	CAMERA.projectionMatrix.makePerspective( fov,  ratio_wh, 1, 1100 );
	render();

}

function hitVector(event) {
	var elem = RENDERER.domElement, 
	    boundingRect = elem.getBoundingClientRect(),
	    x = (event.clientX - boundingRect.left) * (elem.width / boundingRect.width),
	    y = (event.clientY - boundingRect.top) * (elem.height / boundingRect.height);
	
	var vector = new THREE.Vector3( 
	    ( x / panoSize.w ) * 2 - 1, 
	    - ( y / panoSize.h ) * 2 + 1, 
	    0.5 
	);
	return vector;
}

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );

	CAMERA.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	CAMERA.target.y = 500 * Math.cos( phi );
	CAMERA.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	CAMERA.lookAt( CAMERA.target );

	/*
	// distortion
	CAMERA.position.x = - CAMERA.target.x;
	CAMERA.position.y = - CAMERA.target.y;
	CAMERA.position.z = - CAMERA.target.z;
	*/

	RENDERER.render( SCENE, CAMERA );
	
}

// Interaction methods
function Move(axis, amt){
	var newPos = SELECTED.position,
		incr = 0.5;
	switch (axis) {
		case "x":
			newPos.x += amt*incr;
			break;
		case "y":
			newPos.y += amt*incr;
			break;
		case "z":
			newPos.z += amt*incr;
			break;
		default:
			break;
		
	}
	console.log("new pos: " + newPos.x + ", " + newPos.y + ", " + newPos.z );
	SELECTED.position.set(newPos.x, newPos.y, newPos.z);
	SELECTED.lookAt(new THREE.Vector3( 0, newPos.y, 0 ));	
	SELECTED.material.materials[4].opacity = 1;	
}

function Reset(){
	var pos = SELECTED.reset.pos,
		rot = SELECTED.reset.rot
	SELECTED.position.set(pos.x, pos.y, pos.z);
	SELECTED.lookAt(new THREE.Vector3( 0, pos.y, 0 ));
	SELECTED.material.materials[4].opacity = 1;
	lon = 0;
}

function MoveTo(x,y,z, theta) {
	SELECTED.position.set(x,y,z);
	SELECTED.lookAt(new THREE.Vector3( 0, y, 0 ));
	SELECTED.material.materials[4].opacity = 1;
	// update camera
	lon=theta;
	
}
function Opacity(val) {
	SELECTED.material.materials[4].opacity = val;
}

function CheckAnswer(ans) {
	$("#feedback").html(ans);
}
