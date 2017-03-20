window.onload = function(){

	(function(){
		//dragイベントを無効に
		document.body.addEventListener("dragstart", function(e){
			e.preventDefault();
		}, true);
		document.body.addEventListener("drag", function(e){
			e.preventDefault();
		}, true);
		document.body.addEventListener("dragover", function(e){
			e.preventDefault();
		}, true);
		document.body.addEventListener("dragenter", function(e){
			e.preventDefault();
		}, true);
		document.body.addEventListener("dragleave", function(e){
			e.preventDefault();
		}, true);
		document.body.addEventListener("drop", function(e){
			e.preventDefault();
		}, true);
		document.body.addEventListener("dragend", function(e){
			e.preventDefault();
		}, true);
	})();

	(function(){
		var t;
		document.body.addEventListener("mousedown", function(e){
			var elem = e.target;
			if((elem instanceof HTMLElement) || (elem instanceof SVGSVGElement)){
				return;
			}
			var transforms = elem.transform.baseVal;
			var transform;
			try{
				transform = transforms.getItem(0);
			}catch(e){
				transform = elem.ownerSVGElement.createSVGTransform();
				transforms.appendItem(transform);
			}
			var matrix = transform.matrix;
			t = {
				elem: elem,
				x: e.pageX,
				y: e.pageY,
				matrix: matrix,
				e: matrix.e,
				f: matrix.f,
				rate: getRate()
			};
			this.style.cursor = "move";
		}, false);

		document.body.addEventListener("mousemove", function(e){
			if(!t){return;};
			var x = (e.pageX - t.x) * t.rate + t.e;
			var y = (e.pageY - t.y) * t.rate + t.f;
			if(x == 0 && y == 0){return;}
			t.matrix.e = x;
			t.matrix.f = y;
		}, false);

		document.body.addEventListener("mouseup", function(e){
			t = undefined;
			this.style.cursor = "auto";
		}, false);

		function getRate(){
			var svg = document.getElementsByTagName("svg")[0];
			var w = svg.width.baseVal.value;
			var h = svg.height.baseVal.value;
			return w > h ? w/400 : h/400;
		}

	})();

	document.body.addEventListener("dblclick", function(e){
		var elem = e.target;
		if((elem instanceof HTMLElement) || (elem instanceof SVGSVGElement)){
			return;
		}
		showDialog(elem);
	}, false);

	var showDialog = (function(){
		var elem;
		btnClose.onclick = function(){
			closeDialog();
		};

		btnColor.onclick = function(){
			elem.setAttribute("fill", color.value);
			addColor(color.value);
			closeDialog();
		};

		btnNone.onclick = function(){
			elem.removeAttribute("fill");
			closeDialog();
		};

		btnDelete.onclick = function(){
			if(!confirm("要素を削除します．よろしいですか？")){return;}
			elem.parentNode.removeChild(elem);
			closeDialog();
		};

		btnPos.onclick = function(){
			elem.setAttribute("transform", "");
			closeDialog();
		};

		colors.addEventListener("click", function(e){
			var target = e.target;
			if(!(target instanceof HTMLInputElement)){
				return;
			}
			elem.setAttribute("fill", target.style.backgroundColor);
			closeDialog();
		}, false);

		function setElem(e){
			elem = e;
			color.value = e.getAttribute("fill");
		};

		return function(e){
			elem = e;
			setElem(e);
			dialog.style.display = "block";
		};
	})();

	window.closeDialog = function(){
		dialog.style.display = "none";
	};

	window.addColor = function(color){
		if(dialog.style.display == "none"){
			return;
		}
		var buttons = colors.getElementsByTagName("input");
		var button;
		for(var i = 0, len = buttons.length; i<len; i++){
			button = buttons[i];
			if((button.style.backgroundColor+"") == (color+"")){
				return;
			}
		}
		if(buttons.length > 10){
			colors.removeChild(buttons[0]);
		}
		button = document.createElement("input");
		button.type = "button";
		button.value = " ";
		button.style.backgroundColor = color;
		colors.appendChild(button);
	};

	window.isDioalogShown = function(){
		return dialog.style.display != "none";
	};

	document.body.addEventListener("mousemove", function(e){
		if(!window.parent){
			return;
		}
		window.parent.setLoupePosition(e.pageX + 400, e.pageY);
	}, false);
};
