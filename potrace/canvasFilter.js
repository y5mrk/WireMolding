"use strict";
var CanvasFilter = (function(){
	
	//convolveMatrix
	function convolveMatrix(canvas, orderX, orderY, targetX, targetY, matrix, divisor, bias){
		var bias = bias ? bias: 0;
		bias *= 255;
		var len = matrix.length;
		var bm = new Bitmap(canvas);
		var buf = [];
		var pixel = {};
		bm.foreach(to);
		bm.save();
		function to(x, y){
			buf = this.getRect(x - orderX + targetX + 1, y - orderY + targetY + 1, orderX, orderY, buf);
			applyMatrix();
			this.set(x, y, pixel);
		}
		function applyMatrix(){
			pixel.r = 0;
			pixel.g = 0;
			pixel.b = 0;
			for(var i = 0; i<len; i++){
				var b = buf[i];
				var m = matrix[len - i - 1];
				pixel.r += (b.r * m);
				pixel.g += (b.g * m);
				pixel.b += (b.b * m);
			}
			pixel.r /= divisor;
			pixel.g /= divisor;
			pixel.b /= divisor;
			pixel.r += bias;
			pixel.g += bias;
			pixel.b += bias;
		}
	}
	
	function blur(canvas){
		convolveMatrix(canvas, 3, 3, 1, 1, [
			1,1,1,
			1,1,1,
			1,1,1], 9);
	}

	function edge(canvas){
		convolveMatrix(canvas, 3, 3, 1, 1, [
			1,1,1,
			1,-8,1,
			1,1,1], 8);
	}

	function sharpness(canvas){
		convolveMatrix(canvas, 3, 3, 1, 1, [
			0,-1,0,
			-1,5,-1,
			0,-1,0], 1);
	}
	
	//colorMatrix
	function colorMatrix(canvas, a){
		var a00=a[0], a01=a[1], a02=a[2], a03=a[3], a04=a[4],
			a10=a[5], a11=a[6], a12=a[7], a13=a[8], a14=a[9],
			a20=a[10], a21=a[11], a22=a[12], a23=a[13], a24=a[14],
			a30=a[15], a31=a[16], a32=a[17], a33=a[18], a34=a[19];
		var bm = new Bitmap(canvas);
		var buf = {};
		var pixel = {};
		bm.foreach(to);
		bm.save();
		function to(x, y){
			this.get(x, y, buf);
			var r = buf.r;
			var g = buf.g;
			var b = buf.b;
			var a = buf.a;
			pixel.r = r * a00 + g * a01 + b * a02 + a * a03 + 255 * a04;
			pixel.g = r * a10 + g * a11 + b * a12 + a * a13 + 255 * a14;
			pixel.b = r * a20 + g * a21 + b * a22 + a * a23 + 255 * a24;
			pixel.a = r * a30 + g * a31 + b * a32 + a * a33 + 255 * a34;
			this.set(x, y, pixel);
		}
	}

	var v1 = [
		0.213, 0.715, 0.072,
		0.213, 0.715, 0.072,
		0.213, 0.715, 0.072
	];
	var v2 = [
		 0.787, -0.715, -0.072,
		-0.213,  0.285, -0.072,
		-0.213, -0.715,  0.928
	];
	var v3 = [
		-0.213, -0.715,  0.928,
		 0.143,  0.140, -0.283,
		-0.787,  0.715,  0.072
	];
	function saturate(canvas, val){
		var _v2 = scolor(val, v2);
		var m = sum(v1, _v2);
		colorMatrix(canvas, to5by4(m));
	}
	function hueRotate(canvas, deg){
		var rad = deg / 180 * Math.PI;
		var _v2 = scolor(Math.cos(rad), v2);
		var _v3 = scolor(Math.sin(rad), v3);
		var m = sum(v1, _v2, _v3);
		colorMatrix(canvas, to5by4(m));
	}
	function grayscale(canvas, amount){
		saturate(canvas, 1 - amount);
	}
	var s1 = [
		0.393, 0.769, 0.189,
		0.349, 0.686, 0.168,
		0.272, 0.534, 0.131
	];
	var s2 = [
		 0.607, -0.769, -0.189,
		-0.349,  0.314, -0.168,
		-0.272, -0.534,  0.869
	];
	function sepia(canvas, amount){
		var _s2 = scolor(1 - amount, s2);
		var m = sum(s1, _s2);
		colorMatrix(canvas, to5by4(m));
	}

	function scolor(c, v){
		var rv = []
		for(var i=0, len=v.length; i<len; i++){
			rv.push(c*v[i]);
		}
		return rv;
	}

	function sum(v1, v2, v3){
		var v = [];
		for(var i=0, len=v1.length; i<len; i++){
			v.push(v1[i] + v2[i] + (v3 ? v3[i]: 0));
		}
		return v;
	}
	
	function to5by4(m){
		return [
			m[0], m[1], m[2], 0, 0,
			m[3], m[4], m[5], 0, 0,
			m[6], m[7], m[8], 0, 0,
			0, 0, 0, 1, 0
		];
	}

	function innerProduct(v1, v2){
		var result = 0;
		for(var i=0, len=v1.length; i<len; i++){
			result += v1[i] * v2[i];
		}
		return result;
	}

	function luminanceToAlpha(canvas){
		colorMatrix(canvas,[
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0.2125, 0.7154, 0.0721, 0, 0
		]);
	}

	function red(canvas){
		colorMatrix(canvas,[
			1, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function green(canvas){
		colorMatrix(canvas,[
			0, 0, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function blue(canvas){
		colorMatrix(canvas,[
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function rmred(canvas){
		colorMatrix(canvas,[
			0, 0, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function rmgreen(canvas){
		colorMatrix(canvas,[
			1, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function rmblue(canvas){
		colorMatrix(canvas,[
			1, 0, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function cyan(canvas){
		colorMatrix(canvas,[
			1, 0, 0, 0, 0,
			0, 0, 0, 0, 1,
			0, 0, 0, 0, 1,
			0, 0, 0, 1, 0
		]);
	}

	function magenta(canvas){
		colorMatrix(canvas,[
			0, 0, 0, 0, 1,
			0, 1, 0, 0, 0,
			0, 0, 0, 0, 1,
			0, 0, 0, 1, 0
		]);
	}

	function yellow(canvas){
		colorMatrix(canvas,[
			0, 0, 0, 0, 1,
			0, 0, 0, 0, 1,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0
		]);
	}
	
	function redToGray(canvas){
		colorMatrix(canvas,[
			1, 0, 0, 0, 0,
			1, 0, 0, 0, 0,
			1, 0, 0, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function greenToGray(canvas){
		colorMatrix(canvas,[
			0, 1, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	function blueToGray(canvas){
		colorMatrix(canvas,[
			0, 0, 1, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0
		]);
	}
	
	function nullFunc(component){
		return component;
	}
	
	//componentTransfer
	function componentTransfer(canvas, funcs){
		if(!funcs.r){funcs.r = nullFunc;}
		if(!funcs.g){funcs.g = nullFunc;}
		if(!funcs.b){funcs.b = nullFunc;}
		if(!funcs.a){funcs.a = nullFunc;}
		var bm = new Bitmap(canvas);
		var buf = {};
		var pixel = {};
		bm.foreach(to);
		bm.save();
		function to(x, y){
			this.get(x, y, buf);
			pixel.r = funcs.r(buf.r);
			pixel.g = funcs.g(buf.g);
			pixel.b = funcs.b(buf.b);
			pixel.a = funcs.a(buf.a);
			this.set(x, y, pixel);
		}
	}

	function gamma(canvas, amplitude, exponent, offset){
		amplitude = amplitude - 0;
		exponent = exponent - 0;
		offset = offset - 0;
		var pow;
		if(exponent == 1){
			pow = function(c, e){return c;};
		}else{
			pow = Math.pow;
		}
		function to(component){
			return (amplitude * pow(component/255, exponent) + offset)*255;
		}
		componentTransfer(canvas, {r:to, g:to, b:to});
	}

	function invert(canvas, amount){
		amount = amount - 0;
		var intercept = 255 * amount;
		var slope = 1 - 2 * amount;
		function to(c){
			return slope * c + intercept;
		}
		componentTransfer(canvas, {r:to, g:to, b:to});
	}

	function brightness(canvas, amount){
		amount = amount - 0;
		function to(c){
			return amount * c;
		}
		componentTransfer(canvas, {r:to, g:to, b:to});
	}

	function contrast(canvas, amount){
		amount = amount - 0;
		var slope = amount;
		var intercept = (-(0.5 * amount) + 0.5)*255;
		function to(c){
			return slope * c + intercept;
		}
		componentTransfer(canvas, {r:to, g:to, b:to});
	}
	
	var Bitmap = function(canvas){
		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.ctx = canvas.getContext("2d");
		this.id = this.ctx.getImageData(0, 0, this.width, this.height);
		this.d = this.id.data;
		this.new_id = this.ctx.getImageData(0, 0, this.width, this.height);
		this.new_d = this.new_id.data;
	};
	(function(p){
		//基底アドレスを取得する．
		function toBaseAddress(me, x, y){
			return (x + y * me.width) * 4;
		}
		//範囲内かどうか判定する．
		function isOut(me, x, y){
			return x < 0 || x >= me.width || y < 0 || y>= me.height;
		}
		//色を取得する
		p.get = function(x, y, buf){
			var ba = toBaseAddress(this, x, y);
			if(!isOut(this, x, y)){
				var d = this.d;
				buf.r = d[ba    ];
				buf.g = d[ba + 1];
				buf.b = d[ba + 2];
				buf.a = d[ba + 3];
			}else{
				buf.r = 255;
				buf.g = 255;
				buf.b = 255;
				buf.a = 255;
			}
			buf.toString = toString;
			return buf;
		};
		//矩形範囲を取得する
		p.getRect = function(x, y, width, height, buf){
			if(!buf){buf = [width * height]};
			for(var i = 0; i<height; i++){
				for(var j = 0; j<width; j++){
					var k = i * width + j;
					var p = buf[k];
					p = p ? p: {};
					buf[k] = this.get(x + j, y + i, p);
				}
			}
			return buf;
		};
		var toString = function(){
			return ["[r:", this.r, ",g:", this.g, ",b:", this.b, ",a:", this.a, "]"].join(""); 
		};
		//色を設定する
		var round = Math.round;
		function fix(c){
			return round(c);
		}
		p.set = function(x, y, pixel){
			if(isOut(this, x, y)){return;}
			var d = this.new_d;
			var ba = toBaseAddress(this, x, y);
			if(pixel.r != undefined){d[ba    ] = fix(pixel.r);}
			if(pixel.g != undefined){d[ba + 1] = fix(pixel.g);}
			if(pixel.b != undefined){d[ba + 2] = fix(pixel.b);}
			if(pixel.a != undefined){d[ba + 3] = fix(pixel.a);}
		};
		//保存
		p.save = function(){
			this.ctx.putImageData(this.new_id, 0, 0);
			this.id = this.new_id;
			this.d = this.new_d;
			this.new_id = this.ctx.getImageData(0, 0, this.width, this.height);
			this.new_d = this.new_id.data;
		};
		//ピクセル毎の処理
		p.foreach = function(func){
			var args = [2];
			for(var i = 0; i < this.width; i++){
				for(var j = 0; j < this.height; j++){
					args[0] = i;
					args[1] = j;
					func.apply(this, args);
				}
			}
		};
		p.toString = function(){
			return "Bitmap";
		};
	})(Bitmap.prototype);

	return {
		convolveMatrix: convolveMatrix,
		blur: blur,
		edge: edge,
		sharpness: sharpness,
		red: red,
		green: green,
		blue: blue,
		rmred: rmred,
		rmgreen: rmgreen,
		rmblue: rmblue,
		cyan: cyan,
		magenta: magenta,
		yellow: yellow,
		redToGray: redToGray,
		greenToGray: greenToGray,
		blueToGray: blueToGray,
		luminanceToAlpha: luminanceToAlpha,
		hueRotate: hueRotate,
		saturate: saturate,
		grayscale: grayscale,
		sepia: sepia,
		componentTransfer: componentTransfer,
		gamma: gamma,
		invert: invert,
		brightness: brightness,
		contrast: contrast
	};
})();
