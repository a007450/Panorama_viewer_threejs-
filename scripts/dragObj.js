/*
 *  Vienna Ly
 *  Aug 1, 2013
 *  clickable drag objects -- based on webgl_interactive_draggablecubes (three.js)
 *
 *  Set marker parameters: size, material...tbd
 */

	
var p0 = {
	id: "0", name: "point 1",
	description: "A mannequin is an often articulated doll used by artists, tailors, dressmakers, windowdressers and others especially to display or fit clothing. ",
	pos: {x: 10, y:-1, z:0},
	size: {x: 1, y:.3, z:0.1}, 
	type: "texture",
	url: "images/mannequin.png"
},
p1 = {
	id: "1", name: "point 2",
	description: "Description about another item.",
	pos: {x: -15, y:-2, z:0},
	size: {x: 1, y:1, z:1}, 
	type: "sphere"
}

// for drag object
var offset = new THREE.Vector3(),
	OBJECTS = [], PLANE, MOUSE2D;

// custom event
//var event = new THREE.EventDispatcher();
//event.addEventListener('dragObj', onDragObj, false );

function CreateObjects() {
	// plane
	//Lighting();
	//CreateGrid(true);

	DragObj(p0);
	//DragObj(p1);
	
}
function Lighting() {
	var ambientLight = new THREE.AmbientLight(0xbbbbbb),
		directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(1,1,1).normalize();

    SCENE.add(ambientLight);
	SCENE.add(directionalLight);	
}

function CreateGrid(visible) {
	var plane_w = 2000, plane_h = 2000;
	
	PLANE = new THREE.Mesh( new THREE.PlaneGeometry( plane_w, plane_h, plane_w/50, plane_h/50 ), new THREE.MeshBasicMaterial( { color: 0xdd3300, opacity: 0.1, transparent: true, wireframe: true } ) );
	PLANE.visible = visible;
	PLANE.position.set(0,-200,0);
	PLANE.rotation.x = Math.PI/2;
	PLANE.rotation.z = Math.PI/2;
	SCENE.add( PLANE );
}

function DragObj(p) {
	
	var geometry = new THREE.CubeGeometry(p.size.x, p.size.y, p.size.z),
		
		material = new THREE.MeshBasicMaterial(); // default material
		
		
	switch (p.type) {
		case "texture":
			var materialClass = THREE.MeshLambertMaterial,
			side1 = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.1, transparent: true, wireframe: true}),
			front = new THREE.MeshLambertMaterial( {color: 0xffffff, map: THREE.ImageUtils.loadTexture( p.url ), transparent: true} ),
			materials = [side1, side1, side1, side1, front,  side1];
			material = new THREE.MeshFaceMaterial(materials),
			geometry = new THREE.CubeGeometry( 1.5, 5, 1, 4, 4, 1 );
			break
		case "sphere":
			material = new THREE.MeshBasicMaterial( { color: 0xdeedf4, ambient: 0xffffff, overdraw: true, transparent: true, opacity: 0.5} );
			geometry = new THREE.SphereGeometry(p.size.x, 20, 20);
			break;
		default:
			break;
	} 
	
	// mesh
	var obj = new THREE.Mesh( geometry, material );
	obj.overdraw = true;
	obj.position.set(p.pos.x, p.pos.y, p.pos.z);
	obj.id = p.id;
	obj.name = p.name;
	obj.description = p.description;
	obj.reset = { pos: {x:p.pos.x, y: p.pos.y, z: p.pos.z}, rot: {x:obj.rotation.x, y:obj.rotation.y, z:obj.rotation.z }};
	obj.lookAt(new THREE.Vector3( 0, 0, 0 ));								
	obj.callback = function() { 
		isUserInteracting = false 
	}
	
	
	OBJECTS.push(obj);

	SCENE.add( obj );
}
