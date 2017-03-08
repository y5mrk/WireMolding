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
    // animate();
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

var scene, axes, grid, camera, orbit, webGLRenderer;
var geometry, material, mesh;

function init() {
    var stats = initStats();

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
    // camera.lookAt(new THREE.Vector3(60, -60, 0));
    orbit = new THREE.OrbitControls(camera);

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setSize( 600, 400 );
    webGLRenderer.setClearColor(0xF0F0F0, 1.0);
    // webGLRenderer.shadowMapEnabled = true;

    var shape = createMesh(new THREE.ShapeGeometry(drawShape()));
    // add the sphere to the scene
    scene.add(shape);

    var spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position = new THREE.Vector3(70, 170, 70);
    spotLight.intensity = 0.7;
    spotLight.target = shape;
    scene.add(spotLight);

    document.getElementById("viewer-area").appendChild(webGLRenderer.domElement);

    var step = 0;
    // setup the control gui
    var controls = new function () {
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
            shape = createMesh(new THREE.ExtrudeGeometry(drawShape(), options));
            // add it to the scene.
            scene.add(shape);
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'amount', 0, 20).onChange(controls.asGeom);
    gui.add(controls, 'bevelThickness', 0, 10).onChange(controls.asGeom);
    gui.add(controls, 'bevelSize', 0, 10).onChange(controls.asGeom);
    gui.add(controls, 'bevelSegments', 0, 30).step(1).onChange(controls.asGeom);
    gui.add(controls, 'bevelEnabled').onChange(controls.asGeom);
    gui.add(controls, 'curveSegments', 1, 30).step(1).onChange(controls.asGeom);
    gui.add(controls, 'steps', 1, 5).step(1).onChange(controls.asGeom);
    controls.asGeom();
    render();
    function drawShape() {
        var svgString = document.querySelector("#batman-path").getAttribute("d");
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
        mesh.rotation.x = -1.1;
        return mesh;
    }
    function render() {
        stats.update();
        shape.rotation.y = step += 0.005;
        orbit.update();
        // render using requestAnimationFrame
        animate_id = requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }
    function initStats() {
        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats-output").appendChild(stats.domElement);
        return stats;
    }

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
  this.controls = null;
  $('canvas').remove();
}
