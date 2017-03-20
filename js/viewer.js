var animate_id;

var scene, axis, grid, camera, orbit, webGLRenderer;
var geometry, material, mesh;
var controls;

var main = () =>{
  scene = new THREE.Scene();

  // camera settings

  camera = new THREE.PerspectiveCamera( 75, 600 / 400, 1, 1000000 );
  camera.position.set(30, 45, 300);
  camera.lookAt(scene.position);
  // scene.add(camera);
  // orbit = new THREE.OrbitControls(camera);

  geometry = new THREE.BoxGeometry( 200, 200, 200 );
  material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  //add renderer to DOM
  webGLRenderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true
  });
  webGLRenderer.setSize( 600, 400 );
  webGLRenderer.setClearColor(0xF0F0F0, 1.0);
  webGLRenderer.domElement.className = "viewer-canvas";
  document.getElementById('viewer-area').appendChild( webGLRenderer.domElement );

  var shape = createMesh(new THREE.ShapeGeometry(drawShape()));
  // add the sphere to the scene
  scene.add(shape);

  //add grid
  grid = new THREE.GridHelper(10000, 50);
  grid.material.color = new THREE.Color( 0xffffff);
  // grid.material.opacity = 0;
  scene.add(grid);

  // var directionalLight = new THREE.DirectionalLight( 0xffffff );
  // directionalLight.position.set( 0, 0.7, 0.7 );
  // scene.add( directionalLight );
  // scene.rotation.x = Math.PI/2;
  // //スポットライトにしてみる
  // //console.log(getViewerPos());

  var spotLight = new THREE.DirectionalLight(0xffffff);
  spotLight.position = new THREE.Vector3(70, 170, 70);
  spotLight.intensity = 0.7;
  // spotLight.target = shape;
  scene.add(spotLight);

  axis = new THREE.AxisHelper(2000);
  scene.add(axis);

  var step = 0;
  // setup the control gui
  controls = new function () {
      this.amount = 2;
      this.bevelThickness = 2;
      this.bevelSize = 0.5;
      this.bevelEnabled = true;
      this.bevelSegments = 3;
      this.bevelEnabled = true;
      this.curveSegments = 12;
      this.steps = 1;
      this.asGeom = function () {
          // remove the old plane
          scene.remove(shape);
          // create a new one
          var options = {
              amount: controls.amount,
              bevelThickness: controls.bevelThickness,
              bevelSize: controls.bevelSize,
              bevelSegments: controls.bevelSegments,
              bevelEnabled: controls.bevelEnabled,
              curveSegments: controls.curveSegments,
              steps: controls.steps
          };
          console.log(options.amount);
          shape = createMesh(new THREE.ExtrudeGeometry(drawShape(), options));
          // add it to the scene.
          scene.add(shape);
      };
  };
  // var gui = new dat.GUI();
  // gui.add(controls, 'amount', 0, 20).onChange(controls.asGeom);
  // gui.add(controls, 'bevelThickness', 0, 10).onChange(controls.asGeom);
  // gui.add(controls, 'bevelSize', 0, 10).onChange(controls.asGeom);
  // gui.add(controls, 'bevelSegments', 0, 30).step(1).onChange(controls.asGeom);
  // gui.add(controls, 'bevelEnabled').onChange(controls.asGeom);
  // gui.add(controls, 'curveSegments', 1, 30).step(1).onChange(controls.asGeom);
  // gui.add(controls, 'steps', 1, 5).step(1).onChange(controls.asGeom);

  //document.getElementById("thresholdval").innerHTML=newVal;
  controls.asGeom();

  function drawShape() {
      var svgString = document.querySelector("#wire-path").getAttribute("d");
      var shape = transformSVGPathExposed(svgString);
      // return the shape
      return shape;
  }
  function createMesh(geom) {
      geom.applyMatrix(new THREE.Matrix4().makeTranslation(-390, -74, 0));
      // assign two materials
      var meshMaterial = new THREE.MeshPhongMaterial({color: 0x333333, shininess: 100, metal: true});
      var mesh = new THREE.Mesh(geom, meshMaterial);
      mesh.scale.x = 0.1;
      mesh.scale.y = 0.1;
      mesh.rotation.z = Math.PI;
      mesh.rotation.x = -1.5;
      return mesh;
  }

  rendering();
  mouseEvent(webGLRenderer);
}

window.addEventListener( 'DOMContentLoaded', main, false );

var rendering = ()=>{
  var frame = 0;
  ( function renderLoop () {
    animate_id = requestAnimationFrame( renderLoop );
      webGLRenderer.clear();
      webGLRenderer.render(scene, camera);
  } )();

}

var mouseEvent = (webGLRenderer)=>{
  var mousedown = false;
  var prevPosition = {x: 0, y: 0}
    webGLRenderer.domElement.addEventListener('mousedown', function(e){
      mousedown = true;
      prevPosition = {x: e.pageX, y: e.pageY};

    }, false);

    // document.getElementById("viewer-area").addEventListener("mouseover", mouseOver);
    // document.getElementById("viewer-area").addEventListener("mouseout", mouseOut);

    webGLRenderer.domElement.addEventListener('mousemove', function(e){
      if(!mousedown) return;
      moveDistance = {x: prevPosition.x - e.pageX, y: prevPosition.y - e.pageY};
      scene.rotation.x -= moveDistance.y * 0.02;
      scene.rotation.y -= moveDistance.x * 0.02;
      //console.log(scene.rotation);
      prevPosition = {x: e.pageX, y: e.pageY};

     }, false);

    // webGLRenderer.domElement.addEventListener( 'wheel', function(e){
    //   if(!mousedown) return;
    //   e.preventDefault();
  	// 	e.stopPropagation();
    //
  	// 	handleMouseWheel( e );
    //
  	// 	// scope.dispatchEvent( startEvent ); // not sure why these are here...
  	// 	// scope.dispatchEvent( endEvent );
    // }, false );

    webGLRenderer.domElement.addEventListener('mouseup', function(e){
      mousedown = false;
    }, false);

    webGLRenderer.domElement.addEventListener('mouseout', function(e){
      mousedown = false;
    }, false);
}

function changeControlOptions(idName, option, newVal){
  document.getElementById(idName).innerHTML=newVal;
  switch (option){
    case 'amount':
      controls.amount = newVal;
      break;
    case 'bevelThickness':
      controls.bevelThickness = newVal;
      break;
    case 'bevelSize':
      controls.bevelSize = newVal;
      break;
    case 'bevelSegments':
      controls.bevelSegments = newVal;
      break;
    case 'bevelEnabled':
      controls.bevelEnabled = newVal;
      break;
    case 'curveSegments':
      controls.curveSegments = newVal;
      break;
    case 'steps':
      controls.steps = newVal;
      break;
  }
  controls.option = newVal;
  controls.asGeom();
}

// function handleMouseWheel( event ) {
//   // console.log( 'handleMouseWheel' );
//
//   if ( event.deltaY < 0 ) {
//     dollyOut( getZoomScale() );
//   } else if ( event.deltaY > 0 ) {
//     dollyIn( getZoomScale() );
//   }
//
//   // scope.update();
//
// }

// function dollyOut( dollyScale ) {
//
//   if ( scope.object instanceof THREE.PerspectiveCamera ) {
//
//     scale *= dollyScale;
//
//   } else if ( scope.object instanceof THREE.OrthographicCamera ) {
//
//     scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
//     scope.object.updateProjectionMatrix();
//     zoomChanged = true;
//
//   } else {
//
//     console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
//     scope.enableZoom = false;
//
//   }

// }

var getViewerPos = ()=>{
  var element = document.getElementById('viewer')
  var pos = element.getBoundingClientRect()

  var res = {
    top: pos.top,
    left: pos.left,
    width: pos.width,
    height: pos.height
  }

  return res
}

var radians = (degrees)=>{
  var rad = degrees * (Math.PI / 180);
  return rad
}

function stop(){
  // renderer.clear();
  // scene.remove( mesh );
  // geometry.dispose();
  // material.dispose();
  // camera.remove();
  // sceen = null;

  cancelAnimationFrame( animate_id );
  this.scene = null;
  this.projector = null;
  this.camera = null;
  // this.orbit = null;
  $('canvas').remove();
}
