/*
written by DEFGHI1977@xbox.live
license: GPL2.0
*/
"use strict";
window.onload = function(){

	//input and other elements
	//NOTE:operaではinput要素は暗黙の変数から参照できない．
	//他のブラウザではid付きの要素はグローバル変数として参照可能となる．
	var fields = {
		//iframe
		svgFrame: document.getElementById("svgFrame"),
		//svg elements
		svgBGImg: document.getElementById("svgBGImg"),
		//input
		threshold: document.getElementById("threshold"),
		turdSize: document.getElementById("turdSize"),
		alphamax: document.getElementById("alphamax"),
		precision: document.getElementById("precision"),
		prevCond: document.getElementById("prevCond"),
		inputs: document.getElementsByTagName("input"),
		txtBefore: document.getElementById("txtBefore"),
		txtAfter: document.getElementById("txtAfter"),
		ignoreFill: document.getElementById("ignoreFill"),
		sourceWidth: document.getElementById("sourceWidth"),
		sourceHeight: document.getElementById("sourceHeight"),
		resultLength: document.getElementById("resultLength"),
		resultTime: document.getElementById("resultTime"),
		file: document.getElementById("file"),
		btnTrace: document.getElementById("btnTrace"),
		btnReset: document.getElementById("btnReset"),
		flip: document.getElementById("flip"),
		gamma: document.getElementById("gamma"),
		contrast: document.getElementById("contrast"),
		filterState: document.getElementById("filterState"),
		chkSvgEdit: document.getElementById("chkSvgEdit"),
		chkLoupe: document.getElementById("chkLoupe"),
		showSketch: document.getElementById("showSketch")
	};

	//環境条件チェック
	function checkEnvironment(){

		fields.prevCond.value = "";//firefoxは画面リロード時にinputの内容を引き継いでしまう．
		if(window.FileReader == undefined
			|| document.createElement("canvas").getContext == undefined
			|| document.createElementNS("http://www.w3.org/2000/svg", "svg").viewBox == undefined
		){
			fieldManager.fieldDisabled(true, "お使いのブラウザではこのページのスクリプトは動作しません．");
			document.getElementById("svgTxt").textContent = "未対応";
			return;
		}else{
			if(!window.MSBlobBuilder && !window.MozBlobBuilder && !window.WebKitBlobBuilder && !window.OBlobBuilder && !window.BlobBuilder){
				linkSvgz.style.display = "none";
			}
			fieldManager.fieldDisabled(false);
		}
		if(navigator.userAgent.indexOf("Firefox") < 0){
			fields.chkLoupe.style.visibility = "hidden";
			chkLoupeLabel.style.visibility = "hidden";
		}
	}

	//画像読込関連
	(function(){
		window.ondragover = function(e){
			e.preventDefault();
		};

		window.ondrop = function(e){
			e.preventDefault();
		};
		//for chrome
		//TODO:firefoxでは無効．なお，履歴を辿れるので何とかなる．
		fields.svgFrame.contentWindow.ondrop = function(e){
			e.preventDefault();
		};

		canvasContainer.ondrop = function(e){
			e.preventDefault();
			var file = e.dataTransfer.files[0];
			imageManager.loadFile(file);
		};

		fields.file.onchange = function(e){
			var files = e.target.files;
			if(files.length == 0){
				return;
			}
			var file = files[0];
			imageManager.loadFile(file);
		};

	})();

	//イベント処理群
	(function(){

		fields.file.onclick = function(e){
			if(this.disabled){e.preventDefault();};
		};

		fields.btnTrace.onclick = function(){
			if(img.src == "" || !img.src.match(/^data/)){
				return;
			}
			if(img.width * img.height > 2000 * 2000){
				if(fieldManager.changedCondition() && !confirm("The number of pixels exceeds 4,000,000. It may take time...")){
					return;
				}
			}
			fieldManager.fieldDisabled(true);
			while(true){//chrome対策
				if(this.disabled){
					setTimeout(drawStart, 20);
					break;
				}
			}

			function drawStart(){
				var start = new Date();
				svgManager.drawSvg(canvas);
				var end = new Date();
				var svgData = svgManager.getSVGSource();
				fields.resultLength.value = format(svgData.length);
				fields.resultTime.value = format(end.getTime() - start.getTime());
				linkSvg.href = "ready";
				linkSvgz.href = "ready";
				linkPng.href = "ready";
				fieldManager.fieldDisabled(false);
				document.getElementById("batman").innerHTML = svgData;
				// controls.asGeom();
			}

			function format(val){
				return ("" + val).replace(/(\d{3})$/, ",$1")
					.replace(/(\d)(\d{3}\,)/, "$1,$2")
					.replace(/^\,/, "");
			}
		};

		fields.btnReset.onclick = function(){
			imageManager.displayImage("null.png");
		};

		img.onload = function(){
			imageManager.resetImages();
			fields.svgFrame.contentWindow.closeDialog();
			var img = this;
			setTimeout(function(){
				imageManager.drawToCanvas(img);
			}, 0);

			if(this.src.match(/^data/)){
				fields.sourceWidth.value = this.width;
				fields.sourceHeight.value = this.height;
			}else{
				fields.sourceWidth.value = "";
				fields.sourceHeight.value = "";
			}
		}

		fields.showSketch.onclick = function(){
			controls.asGeom();
		}

		//フィルタ処理
		input.addEventListener("click", function(e){
			var target = e.target;
			if(!target instanceof HTMLInputElement || target.type != "button"){
				return;
			}
			if(!img.src.match(/^data/)){
				return;
			}
			var type = target.id.replace(/^btn/, "");
			type = type.substring(0,1).toLowerCase() + type.substring(1);
			imageManager.filter(type);
		}, false);

	})();

	//svg保存関連
	(function(){
		//onkeydown
		// linkSvg.onkeydown = function(){
		// 	this.href = svgManager.getSVGUrl();
		// };

		document.getElementById("linkSvg").addEventListener("click", function (e) {
		 	var svgData = svgManager.getSVGSource();
	    e.target.download = "potrace" + (new Date()).toLocaleTimeString() + ".svg";
	    e.target.href = "data:image/svg+xml;," + svgData;
   	}, false);

		linkSvgz.onkeydown = function(){
			try{
				this.href = svgManager.getSVGZUrl();
			}catch(e){
				//can't create svgz.
			}
		};
		linkPng.onkeydown = function(){
			this.href = svgManager.getPngUrl();
		};

		//onmousedown
		linkSvg.onmousedown = function(){
			this.href = svgManager.getSVGUrl();
		};
		linkSvgz.onmousedown = function(){
			try{
				this.href = svgManager.getSVGZUrl();
			}catch(e){
				//can't create svgz.
			}
		};
		linkPng.onmousedown = function(){
			this.href = svgManager.getPngUrl();
		};

		//oncontextmenu
		linkSvg.oncontextmenu = function(){
			this.href = svgManager.getSVGUrl();
		};
		linkSvgz.oncontextmenu = function(){
			try{
				this.href = svgManager.getSVGZUrl();
			}catch(e){
				//can't create svgz.
			}
		};
		linkPng.oncontextmenu = function(){
			this.href = svgManager.getPngUrl();
		};

	})();

	//svg編集機能関連
	(function(){
		canvas.onclick = function(e){
			if(!fields.svgFrame.contentWindow.isDioalogShown()){
				return;
			}
			var x = (e.layerX == undefined)
				? e.offsetX
				: e.layerX - this.offsetLeft;
			var y = (e.layerY == undefined)
				? e.offsetY
				: e.layerY - this.offsetTop;
			fields.svgFrame.contentWindow.addColor(imageManager.getColor(x, y));
		};

		fields.chkSvgEdit.addEventListener("click", function(){
			svgCover.style.display = this.checked ? "none":"block";
			if(!this.checked){
				fields.chkLoupe.checked = false;
				loupeContainer.style.display = "none";
			}
		}, false);

		fields.chkLoupe.addEventListener("click", function(){
			loupeContainer.style.display = this.checked ? "block": "none";
		}, false);

		mainForm.onreset = function(){
			svgCover.style.display = "block";
			loupeContainer.style.display = "none";
		};

	})();

	//拡大鏡関連イベント
	(function(){
		var arr = [0, "px"," ", 0, "px"];
		var NULL = "";
		window.setLoupePosition = function(x, y){
			arr[0] = -x*4+100;
			arr[3] = -y*4+100;
			loupe.style.backgroundPosition = arr.join(NULL);
		};

		canvasContainer.addEventListener("mousemove", function(e){
			var x = (e.layerX == undefined)
				? e.offsetX
				: e.layerX - this.offsetLeft;
			var y = (e.layerY == undefined)
				? e.offsetY
				: e.layerY - this.offsetTop;
			setLoupePosition(x, y);
		}, false);
	})();

	//カンバス描画関連
	var imageManager = (function(){

		function loadFile(file){
			if(!file.type.match(/image\/.+/)){
				return;
			}
			//NOTE:svgを渡すとchromeでcanvasのgetImageDataがエラーを発してしまう．
			if(file.type == "image/svg+xml"){
				return;
			}
			var reader = new FileReader();
			reader.onload = function(){
				displayImage(reader.result);
			};
			reader.readAsDataURL(file);
		}

		function displayImage(data){
			img.src = data;
		}

		function resetImages(){
			svgManager.clearSVG();
			linkSvg.removeAttribute("href");
			linkSvgz.removeAttribute("href");
			linkPng.removeAttribute("href");
		}

		var style = canvas.style;
		var ctx = canvas.getContext("2d");

		var PX = "px";
		var c_size = 400;
		function drawToCanvas(img){
			setTimeout(function(){
				fields.svgBGImg.href.baseVal = img.src;
			}, 0);
			//カンバスサイズはimgと同じものとし，styleで拡大縮小を行う．
			var width = img.width;
			var height = img.height;
			var m_x, m_y, c_width, c_height;

			if(width < height){
				c_width = c_size * width / height;
				c_height = c_size;
				m_x = (c_size - c_width) / 2;
				m_y = 0;
			}else{
				c_width = c_size;
				c_height = c_size * height / width;
				m_x = 0;
				m_y = (c_size - c_height) / 2;
			}
			canvas.height = height;
			canvas.width = width;

			style.width = c_width + PX;
			style.height = c_height + PX;
			style.marginTop = m_y + PX;
			style.marginRight = m_x + PX;
			style.marginBottom = m_y + PX;
			style.marginLeft = m_x + PX;
			//setTimeout( function(){//bug:fixed 2013/11/29 画像の書き込みに失敗する．
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0, width, height);
			//}, 0);
		}

		function getColor(x, y){
			var p = toCanvasAddress(x, y);
			var d = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
			var ba = (p.y * canvas.width + p.x) * 4;
			var r = d[ba];
			var g = d[ba + 1];
			var b = d[ba + 2];
			var color = [
				"#",
				r < 16 ? "0" + r.toString(16): r.toString(16),
				g < 16 ? "0" + g.toString(16): g.toString(16),
				b < 16 ? "0" + b.toString(16): b.toString(16)
			].join("");
			return color;
		}

		function toCanvasAddress(x, y){
			var c = canvas;
			var w = c.width;
			var h = c.height;
			if(w > h){
				return {
					x: Math.round(x * w / 400),
					y: Math.round(y * w / 400)
				};
			}else{
				return {
					x: Math.round(x * h / 400),
					y: Math.round(y * h / 400)
				};
			}
		}

		function filter(type){

			if(type == "original"){
				fields.filterState.value = "";
				imageManager.drawToCanvas(img);
			}else if(type == "border"){
				fields.filterState.value += type;
				var ctx = canvas.getContext("2d");
				ctx.fillStyle="black";
				ctx.fillRect(0, 0, 1, canvas.height);
				ctx.fillRect(0, 0, canvas.height, 1);
				ctx.fillRect(canvas.width - 1, 0, 1, canvas.height);
				ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
			}else{
				fields.filterState.value += type;
				fieldManager.fieldDisabled(true);
				while(true){//chrome対策
					if(!fields.inputs[0].disabled){continue;}
					setTimeout(doFilter, 20);
					break;
				}
			}

			function doFilter(){
				switch(type){
					case "gamma":
						CanvasFilter.gamma(canvas, 1, fields.gamma.value - 0, 0);
						break;
					case "contrast":
						CanvasFilter.contrast(canvas, fields.contrast.value - 0);
						break;
					default:
						CanvasFilter[type](canvas);
				}
				fieldManager.fieldDisabled(false);
			}
		}

		return {
			loadFile: loadFile,
			resetImages: resetImages,
			displayImage: displayImage,
			drawToCanvas: drawToCanvas,
			getColor: getColor,
			filter: filter
		};
	})();

	//svg関連メソッド群
	var svgManager = (function(){

		function showSvg(){
			setTimeout(function(){
				window.open(getSVGUrl(), "view");
			}, 0);
		}

		var prevResult;
		var FILL = "fill", ODD = "odd";
		function drawSvg(img){
			clearSVG();
			var svg = getSVGElement();
			// if(img.width>)
			svg.setAttribute("width", img.width);
			svg.setAttribute("height", img.height);
			svg.setAttribute("viewBox", [0,0,img.width,img.height].join(" "));

			if(fieldManager.changedCondition()){
				setupParam();
				prevResult = Potrace.trace(img);
				node = prevResult.toPathElement();
				fieldManager.setCondition();
			}
			var node;
			switch(fieldManager.getMode()){
				case "single":
					node = prevResult.toPathElement();
					if(fields.flip.checked){
						node.setAttribute("d", getBoundary()+node.getAttribute("d"));
					}
					if(fieldManager.ignoreFill()){
						break;
					}
					node.setAttribute("id", "wire-path");
					node.setAttribute("fill", fieldManager.getColor1());
					break;
				case "multi":
				default:
					node = prevResult.toPathElements();
					if(fields.flip.checked){
						var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
						path.setAttribute("class", "even");
						path.setAttribute("id", "wire-path");
						path.setAttribute("d", getBoundary());
						node.insertBefore(path, node.firstChild);
					}
					if(fieldManager.ignoreFill()){
						break;
					}
					var pathNodes = node.childNodes;
					var oddColor = fieldManager.getColor1();
					var evenColor = fieldManager.getColor2();
					for(var i = 0, len = pathNodes.length; i<len; i++){
						var path = pathNodes[i];
						if(path.className.baseVal == ODD){
							path.setAttribute(FILL, oddColor);
						}else{
							path.setAttribute(FILL, evenColor);
						}
					}
					break;
			}
			appendChilds(svg, getBeforeElements());
			svg.appendChild(node);
			appendChilds(svg, getAfterElements());
			function getBoundary(){
				return ["M0 0" , img.width, 0, img.width, img.height, 0, img.height, "Z "].join(" ");
			}
			// console.log(svg);
		}

		function setupParam(){
			Potrace.setParam({
				threshold: fields.threshold.value,
				turdSize: fields.turdSize.value,
				turnPolicy: 1,
				alphamax: fields.alphamax.value,
				precision: fields.precision.value
			});
		}

		var SVG = "svg";
		function getSVGData(){
			return svgData;
		}


		function getSVGElement(){
			return fields.svgFrame.contentDocument.getElementsByTagName(SVG)[0];
		}

		function clearSVG(){
			var svg = getSVGElement();
			var newSvg = svg.cloneNode(false);
			svg.parentNode.replaceChild(newSvg, svg);
		}

		var xmlHeader = '<?xml version="1.0" standalone="no"?>';
		function getSVGSource(){
			var parent = getSVGElement().parentNode;
			return xmlHeader
				+ parent.innerHTML
				.replace(/\t/g, "")
				.replace(/\sxlink/, " xmlns:xlink");
		}

		function getSVGUrl(){

			var svg = getSVGSource();
			try{
				var URL = window.URL || window.webkitURL;
				var bbConstractor = window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.OBlobBuilder || window.BlobBuilder;
				var bb = new bbConstractor();
				bb.append(svg);
				var blob = bb.getBlob("image/svg+xml");
				return URL.createObjectURL(blob);
			}catch(e){
				return toDataScheme(svg);

			}
			function toDataScheme(svgText){
				return "data:image/svg+xml," + encodeURIComponent(svgText);
			}
		}

		function getSVGZUrl(){
			var URL = window.URL || window.webkitURL;
			var svg = getSVGSource();
			var gzbuff = jz.gz.compress(jz.utils.stringToArrayBuffer(svg));
			var bb = new jz.BlobBuilder();
			bb.append(gzbuff);
			return URL.createObjectURL(bb.getBlob());
		}

		function getPngUrl(){
			var svg = getSVGSource();
			var c_svg = document.createElement("canvas");
			c_svg.width = canvas.width;
			c_svg.height = canvas.height;
			var ctx = c_svg.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawSvg(svg, 0, 0, canvas.width, canvas.height);
			console.log(svg);
			var dataUrl = c_svg.toDataURL("image/png");
			try{
				//var blob = c_svg.toBlob();
				//https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-html5/WOxmqfDAaqo
				var bin = atob(dataUrl.split("base64,")[1]);
				var len = bin.length;
				var barr = new Uint8Array(len);
				for(var i = 0; i<len; i++){
					barr[i] = bin.charCodeAt(i);
				}
				var bbConstractor = window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.OBlobBuilder || window.BlobBuilder;
				var bb = new bbConstractor();
				bb.append(barr.buffer);
				var URL = window.URL || window.webkitURL;
				return URL.createObjectURL(bb.getBlob("image/png"));
			}catch(e){
				return dataUrl;
			}
		}

		function getBeforeElements(){
			var source = fields.txtBefore.value;
			return toSVGElements(source);
		}

		function getAfterElements(){
			var source = fields.txtAfter.value;
			return toSVGElements(source);
		}

		function appendChilds(svg, childNodes){
			try{
				for(var i = 0, len = childNodes.length; i<len; i++){
					svg.appendChild(childNodes[i].cloneNode(true));
				}
			}catch(e){
				alert(e);
			}
		}

		var divTmpl = document.createElement("div");
		function toSVGElements(source){
			var div = divTmpl.cloneNode(false);
			div.innerHTML = ['<svg>',source,'</svg>'].join("");
			var svg = div.getElementsByTagName(SVG)[0];
			return svg.childNodes;
		}

		return {
			getSVGSource: getSVGSource,
			getSVGUrl: getSVGUrl,
			getSVGZUrl: getSVGZUrl,
			getPngUrl: getPngUrl,
			clearSVG: clearSVG,
			drawSvg: drawSvg,
			showSvg: showSvg
		};
	})();

	//フィールドメソッド群
	var fieldManager = (function(){

		function getColor1(){
			return getColor("color1");
		}

		function getColor2(){
			return getColor("color2");
		}

		function getColor(group){
			var val = getRadioValue(group);
			if(val != "free"){
				return val;
			}else{
				return document.getElementById(group).value;
			}
		}

		function getMode(){
			return getRadioValue("mode");
		}

		function getRadioValue(name){
			var radios = document.getElementsByName(name);
			for(var i = 0, len = radios.length; i<len; i++){
				var radio = radios[i];
				if(radio.checked){
					return radio.value;
				}
			}
			return "";
		}

		function ignoreFill(){
			return fields.ignoreFill.checked;
		}
		var HIDDEN = "hidden";
		var VISIBLE = "visible";
		var BUTTON = "button";
		var RESET = "reset";
		function fieldDisabled(bool, _msg){

			for(var i = 0, len = fields.inputs.length; i<len; i++){
				var input = fields.inputs[i];
				input.disabled = bool;
				var type = input.type;
				if(type == BUTTON || type == RESET){
					input.style.visibility = bool ? HIDDEN: VISIBLE;
				}
			}
			linkSvg.style.visibility = bool ? HIDDEN: VISIBLE;
			linkSvgz.style.visibility = bool ? HIDDEN: VISIBLE;
			fields.txtBefore.disabled = bool;
			fields.txtAfter.disabled = bool;
			busy.style.display = bool ? "block": "none";
			if(_msg){msg.innerHTML = _msg;}
		}

		function getCondition(){
			return [
				img.src,
				fields.threshold.value,
				fields.turdSize.value,
				fields.alphamax.value,
				fields.precision.value,
				fields.filterState.value
			].join(":");
		}

		function setCondition(){
			fields.prevCond.value = getCondition();
		}

		function changedCondition(){
			return fields.prevCond.value != getCondition();
		}

		return {
			getColor1: getColor1,
			getColor2: getColor2,
			getMode: getMode,
			ignoreFill: ignoreFill,
			fieldDisabled: fieldDisabled,
			setCondition: setCondition,
			changedCondition: changedCondition
		};
	})();

	checkEnvironment();
};
