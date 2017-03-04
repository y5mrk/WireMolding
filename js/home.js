window.onload = function(){
  var imageSelect = document.getElementById("imageSelect"),
      imageInput = document.getElementById("imageInput"),
      btnThreshold = document.getElementById("btnThreshold");
  imageSelect.addEventListener("click", function (e) {
    imageInput.click();
    e.preventDefault();
  }, false);

  imageInput.addEventListener("change", function (e) {
    handleFiles(this.files);
  }, false);

  document.getElementById("run").addEventListener("click", function (e) {
    Potrace.loadImageFromUrl("./image/test.jpg");
    Potrace.process(function(){
      displayImg();
      displaySVG(3);
    });
  }, false);

  document.getElementById("save").addEventListener("click", function (e) {
   e.target.download = "potrace" + (new Date()).toLocaleTimeString() + ".svg";
   e.target.href = "data:image/svg+xml;," + Potrace.getSVG(1);
  }, false);

  var drop = document.getElementById('drop');
  drop.addEventListener("dragenter", function (e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.classList.add('hovering');
    return false;
  }, false);

  drop.addEventListener("dragleave", function (e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.classList.remove('hovering');
    return false;
  }, false);

  drop.addEventListener("dragover", function (e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.classList.add('hovering');
    return false;
  }, false);

  drop.addEventListener("drop", function (e) {
    if (e.preventDefault) e.preventDefault();
    this.classList.remove('hovering');
    handleFiles(e.dataTransfer.files);
    return false;
  }, false);

  btnThreshold.onclick = function(){
    Potrace.loadImageFromUrl(Potrace.img.src);
    Potrace.process(function(){
      displayImg();
      displaySVG(3);
    });
  };
};

var animate_id;

$('#tab-menu a').on('show.bs.tab', function (event) {
	var sampleTextTarget = $(event.target).text();
	var sampleTextRelatedTarget = $(event.relatedTarget).text();
	if(sampleTextTarget == "Construct"){
    init();
    animate();
  }else{
    stop();
  }
});

function handleFiles(files) {
  Potrace.loadImageFromFile(files[0]);
  Potrace.process(function(){
    displayImg();
    displaySVG(1);
  });
}

function displayImg(){
  var imgdiv = document.getElementById('imgdiv');
  imgdiv.style.display = 'inline-block';
  imgdiv.innerHTML = "<p>Input image:</p>";
  imgdiv.appendChild(Potrace.img);
}

function displaySVG(size, type){
  var svgdiv = document.getElementById('svgdiv');
  svgdiv.style.display = 'inline-block';
  svgdiv.innerHTML = "<p>Result:</p>" + Potrace.getThumbSVG(size, type);
}

function getValue(newVal){
  document.getElementById("thresholdval").innerHTML=newVal;
  Potrace.setThreshold(newVal);
}

// three.js

var scene, axes, grid, camera, controls, renderer;
var geometry, material, mesh;

function init() {

    scene = new THREE.Scene();

    // 座標軸を表示
    axes = new THREE.AxisHelper(2000);
    scene.add(axes);

    grid = new THREE.GridHelper(10000, 50);
    grid.material.color = new THREE.Color( 0xffffff);
    scene.add(grid);

    camera = new THREE.PerspectiveCamera( 75, 600 / 400, 1, 1000000 );
    // camera.position.z = 1000;
    camera.position.set(30, 45, 1000);
    camera.lookAt(scene.position);
    controls = new THREE.OrbitControls(camera);

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( 600, 400 );
    renderer.setClearColor(0xF0F0F0, 1.0);

    document.getElementById("viewer-area").appendChild( renderer.domElement );

}

function animate() {

    controls.update();
    animate_id = requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}

function stop(){
  // renderer.clear();
  // scene.remove( mesh );
  // geometry.dispose();
  // material.dispose();
  // camera.remove();
  // sceen = null;

  cancelAnimationFrame( animate_id );
  this.renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
  this.scene = null;
  this.projector = null;
  this.camera = null;
  this.controls = null;
  $('canvas').remove();
}
