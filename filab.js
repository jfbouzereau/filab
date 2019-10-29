
//****************************************************************************

function FIContext() {

	this.ix = 0;
	this.iy = 0;
	this.width = 0;
	
	this.iter = 0;

	this.xmin = 0;
	this.ymin = 0;
	this.xmax = 0;
	this.ymax = 0;
}

//****************************************************************************

function FIControl(_value) {

	var self = this;

	
}

//****************************************************************************

function FIControlNumber(_value) {

	var self = this;

	FIControl.call(self);

	var value = ""+_value;	// saved as a string

	self.getValue = function() {
		return parseFloat(value) || 0;
	}

	self.getString = function() {
		return value;
	}

	self.setValue = function(_value) {
		value = ""+_value;
	}
}

FIControlNumber.prototype = Object.create(FIControl.prototype);

//****************************************************************************

function FIControlList(_list) {

	var self = this;

	FIControl.call(self);

	var choice = 0;
	var list = _list;

	self.getValue = function() {
		return choice;	
	}

	self.getString = function() {
		return list[choice];
	}

	self.setValue = function(_value) {

		if(typeof(_value)=="number") {
			choice = _value|0;
			if(choice<0) choice = 0;
			else if(choice>=list.length) choice = 0;	
			}
		else if(typeof(_value)=="string") {
			if(_value.match(/^[0-9]+$/))
				choice = parseInt(_value);
			else
				choice = list.indexOf(_value);
			if(choice<0) choice = 0;
			if(choice>=list.length) choice = 0;
		}
	}

	self.getStrings = function() {
		return list;
	}
}

FIControlList.prototype = Object.create(FIControl.prototype);
	
//****************************************************************************

function FIControlCompare() {

	var self = this;

	FIControlList.call(self, ["=","!=","<","<=",">",">="]);

	self.compute = function(a,b) {
		switch(self.getValue()) {
			case 0 : return (a==b) ? 1:0;
			case 1 : return (a!=b) ? 1:0;
			case 2 : return (a< b) ? 1:0;
			case 3 : return (a<=b) ? 1:0;
			case 4 : return (a> b) ? 1:0;
			case 5 : return (a>=b) ? 1:0;
		}
	}

}

FIControlCompare.prototype = Object.create(FIControlList.prototype);

//****************************************************************************

function FIControlDiadic() {

	var self = this;

	FIControlList.call(self, ["+","-","*","/","^","mod","min","max","avg",
		"bitor","bitxor","bitand"]);

	self.compute = function(a,b) {
		switch(self.getValue()) {
			case 0 : return a+b;
			case 1 : return a-b;
			case 2 : return a*b;
			case 3 : return a/b;
			case 4 : return Math.pow(a,b);
			case 5 : return a - (b*Math.round(a/b));
			case 6 : return a<b ? a : b;
			case 7 : return a>b ? a : b;
			case 8 : return (a+b)/2;
			case 9 : return (a|0)|(b|0);
			case 10: return (a|0)^(b|0);
			case 11: return (a|0)&(b|0);
		}
	}
}

FIControlDiadic.prototype = Object.create(FIControlList.prototype);

//****************************************************************************

function FIControlMonadic() {

	var self = this;

	FIControlList.call(self,["1 *","1 /","sin","cos","tan","exp","log",
		"sqrt","floor","frac","abs","asin","acos","atan"]);

	self.compute = function(x) {
		switch(self.getValue()) {
			case 0 : return x;
			case 1 : return 1/x;
			case 2 : return Math.sin(x);
			case 3 : return Math.cos(x);
			case 4 : return Math.tan(x);
			case 5 : return Math.exp(x);
			case 6 : return Math.log(x);
			case 7 : return Math.sqrt(x);
			case 8 : return Math.floor(x);
			case 9 : return x-Math.floor(x);
			case 10 : return Math.abs(x);
			case 11 : return Math.asin(x);
			case 12 : return Math.acos(x);
			case 13 : return Math.atan(x);
		}
	}
}

FIControlMonadic.prototype = Object.create(FIControlList.prototype);

//****************************************************************************

function FIControlPoint(withconstant) {

	var self = this;
	
	if(withconstant) 
		FIControlList.call(self,["x","y","dist","angle","const"]);
	else
		FIControlList.call(self,["x","y","dist","angle"]);

	self.compute = function(coord,constant) {

		switch(self.getValue()) {
			case 0 : return coord[0];
			case 1 : return coord[1];
			case 2 : return Math.hypot(coord[0],coord[1]);
			case 3 : return Math.atan(coord[0],coord[1]);
			case 4 : return constant;
		}
	}
}

FIControlPoint.prototype = Object.create(FIControlList.prototype);

//****************************************************************************

function FIModule(_controls) {
	
	var self = this;

	self.help1 = "";
	self.help2 = "";
	self.help3 = "";

	// Maximum connections
	self.pointProducers = 0;
	self.valueProducers = 0;
	self.pointProviders = 0;
	self.valueProviders = 0;

	var controls = _controls;

	var providers = [];

	self.setProvider = function(_index,_provider) {
		providers[_index] = _provider;
	}

	self.getProvider = function(_index) {
		return providers[_index];
	}

	self.clearProviders = function() {
		providers = [];
	}
	
	self.getControl = function(_index) {
		return controls[_index];
	}
	
}

//****************************************************************************

function FIFrame(_controls) {

	FIModule.call(this,_controls);
}

FIFrame.prototype = Object.create(FIModule.prototype);

//****************************************************************************

function FIFrameSquare() {

	var self = this;

	FIFrame.call(self,[new FIControlNumber("10")]);

	self.help1 = "This module generates points on a square";
	self.help2 = "The side of the square is {0}";

	self.pointProducers = 1;

	self.getPoint = function(_context) {
		var width = self.getControl(0).getValue();
		if(_context.iter==0) {
			_context.xmin = _context.ymin = -width/2;
			_context.xmax = _context.ymax = width/2;
		}
		var w = _context.width;
		var x = (_context.ix-w/2)*width/w;
		var y = (w/2-_context.iy)*width/w;
		return [x,y];
	}

}

FIFrameSquare.prototype = Object.create(FIFrame.prototype);

//****************************************************************************


function FIEffect(_controls) {

	FIModule.call(this,_controls);

}

FIEffect.prototype = Object.create(FIModule.prototype);

//****************************************************************************

function FIEffectAffine() {

	var self = this;

	FIEffect.call(self, [
		new FIControlNumber("1.0"),
		new FIControlNumber("0.0")
	]);
	
	self.help1 = "Computes an affine transformation of the input color";
	self.help2 = "newcolor = {0} * oldcolor + {1}";
	
	self.valueProviders = 1;
	self.valueProducers = 1;
	
	self.getValue = function(_context) {
		var v = self.getProvider(0).getValue(_context);
		return self.getControl(0).getValue()*v + 
				self.getControl(1).getValue();	
	}

}

FIEffectAffine.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectAnd() {

	var self = this;

	FIEffect.call(self);

	self.help1 = "This module computes the AND of image1 and image2";
	self.help2 = "For grey levels, this is equivalent to min";

	self.valueProviders = 2;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v1 = self.getProvider(0).getValue(_context);
		var v2 = self.getProvider(1).getValue(_context);
		return (v1<v2) ? v1 : v2;
	}
	
}

FIEffectAnd.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectAverage() {

	var self = this;

	FIEffect.call(self);

	self.help1 = "This.module computes the average of image1 and image2";

	self.valueProviders = 2;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v1 = self.getProvider(0).getValue(_context);
		var v2 = self.getProvider(1).getValue(_context);
		return (v1+2)/2;
	}
	
}

FIEffectAverage.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectCompare() {

	var self = this;

	FIEffect.call(this,[new FIControlCompare()]);

	self.help1 = "This module compares the input colors";
	self.help2 = "newcolor is black if   color1  {0}  color2";

	self.valueProviders = 2;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v1 = self.getProvider(0).getValue(_context);
		var v2 = self.getProvider(1).getValue(_context);
		return self.getControl(0).compute(v1,b2);	
	}
	
}

FIEffectAverage.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectDiadic() {
	
	var self = this;

	FIEffect.call(self,[new FIControlDiadic()]);

	self.help1 = "This module compute diadic function of the input colors";
	self.help2 =  "newcolor = color1  {0}  color2";

	self.valueProviders = 2;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v1 = self.getProvider(0).getValue(_context);
		var v2 = self.getProvider(1).getValue(_context);
		return self.getControl(0).compute(v1,v2);
	}
	
		
}

FIEffectDiadic.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectMerge() {

	var self = this;

	FIEffect.call(self);
	
	self.help1 = "This module uses image2 as a weight to merge image1 and image3";
	self.help2 = "The resulting color is computed by :";
	self.help3 = "newcolor =  image1 * image2   +   image3 * ( 1 - image2 )";

	self.valueProviders = 3;
	self.valueProducers = 1;

	self.getValue = function(_context) {

		var source1 = self.getProvider(0);
		var mask = self.getProvider(1);
		var source2 = self.getProvider(2);

		var x1 = source1 ? source1.getValue(_context) : 0;
		var x2 = source2 ? source2.getValue(_context) : 0;
		var xm = mask ? mask.getValue(_context) : 0.5;
		
		return x1*xm + x2*(1-xm);
					
	}
	
}

FIEffectMerge.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectMonadic() {

	var self = this;

	FIEffect.call(self,[new FIControlMonadic()]);

	self.help1 = "This module computes a monadic function of the input color";
	self.help2 = "newcolor = {0}  ( color )";

	self.valueProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v = self.getProvider(0).getValue(_context);
		return self.getControl(0).compute(v);
	}
	
}

FIEffectMonadic.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectOr() {

	var self = this;

	FIEffect.call(self);

	self.help1 = "This module computes the OR of image1 and image2";
	self.help2 = "For grey levels, this is equivalent to max";

	self.valueProviders = 2;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v1 = self.getProvider(0).getValue(_context);
		var v2 = self.getProvider(1).getValue(_context);
		return (v1>v2) ? v1 : v2;
	}
	
}

FIEffectOr.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectParity() {

	var self = this;

	FIEffect.call(self,[new FIControlList(["even","odd"])]);

	self.help1 = "This module computes the parity of the input color";
	self.help2 = "newcolor is 1   if   floor(oldcolor) is {0}";

	self.valueProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v = self.getProvider(0).getValue(_context);
		var parity = Math.abs(Math.floor(v)) %2 ;
		var choice = self.getControl(0).getValue();
		return choice==0 ? 1-parity : parity;	
	}
}

FIEffectParity.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIEffectXor() {

	var self = this;

	FIEffect.call(self);

	self.help1 = "This module computes the XOR of image1 and image2";
	self.help2 = "For grey levels, this is equivalent to absolute difference";

	self.valueProviders = 2;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var v1 = self.getProvider(0).getValue(_context);
		var v2 = self.getProvider(1).getValue(_context);
		return Math.abs(v1-v2);
	}
	
}

FIEffectXor.prototype = Object.create(FIEffect.prototype);

//****************************************************************************

function FIImage(_controls) {

	FIModule.call(this,_controls);

}

FIImage.prototype = Object.create(FIModule.prototype);

//****************************************************************************

function FIImageAffine() {
	
	var self = this;
	
	FIImage.call(self, [
		new FIControlNumber("1"),
		new FIControlPoint(),
		new FIControlNumber("0")
		]
	);

	self.help1 = "This module generates colors as affine function of point coordinates";
	self.help2 = "color =  {0} * {1}  +  {2}";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);

		var v0 = self.getControl(0).getValue();
		var v1 = self.getControl(1).compute(coord);
		var v2 = self.getControl(2).getValue();

		return v0*v1 + v2;
	}
}

FIImageAffine.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageChecker() {

	var self = this;

	FIImage.call(self);

	self.help1 = "This module generates a checker.";
	self.help2 = "The color of a given point is black if :";
	self.help3 = "floor(x) + floor(y)   is even";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var coord = self.getProvider(0).getPoint(_context);
		var x = Math.floor(coord[0]);
		var y = Math.floor(coord[1]);
		return 1- ((x+y)%2);
	}

}

FIImageChecker.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageCompare() {

	var self = this;

	FIImage.call(self, [
		new FIControlPoint(1),
		new FIControlCompare(),
		new FIControlPoint(1),
		new FIControlNumber("0")
	]);

	self.help1 = "This module generates colors as comparison function of point coordinates";
	self.help3 = "color is black if     {0}  {1}  {2}          const = {3}";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var x,y;

		var coord = self.getProvider(0).getPoint(_context);

		var x = self.getControl(0).compute(coord,self.getControl(3).getValue());
		var y = self.getControl(2).compute(coord,self.getControl(3).getValue());	
		return self.getControl(1).compute(x,y);	
	}
	
}

FIImageCompare.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageConstant() {

	var self = this;

	FIImage.call(self,[new FIControlNumber("1")]);

	self.help1 = "This module generates a constant value";
	self.help2 = "1 is black, 0 is white, other values are grays";
	self.help3 = "Value : {0}";

	self.valueProducers = 1;

	self.getValue = function(_context) {
		return self.getControl(0).getValue();
	}

}

FIImageConstant.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageDiadic() {

	var self = this;

	FIImage.call(self, [
		new FIControlPoint(1),
		new FIControlDiadic(),
		new FIControlPoint(1),
		new FIControlNumber("0")
	]);

	self.help1 = "This module generates colors as diadic function of point coordinates";
	self.help3 = "color =  {0}  {1}  {2}          const = {3}";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		var x,y;

		var coord = self.getProvider(0).getPoint(_context);

		var x = self.getControl(0).compute(coord,self.getControl(3).getValue());
		var y = self.getControl(2).compute(coord,self.getControl(3).getValue());

		return self.getControl(1).compute(x,y);
	}

}

FIImageDiadic.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageInterpol() {

	var self = this;

	FIImage.call(self, [
		new FIControlNumber("1"),
		new FIControlNumber("0"),
		new FIControlNumber("0"),
		new FIControlNumber("1")
	]);

	self.help1 = "This module generates interpolated colors";
	self.help2 = "Top Left Color : {0}        Top Right Color : {1}";
	self.help3 = "Bottom Left Color : {2}      Bottom Right Color : {3}";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);	
		var xratio = (coord[0]-context.xmin)/(context.xmax-context.xmin);
		var yratio = (coord[1]-context.ymin)/(context.ymax-context.ymin);

		var cnw = self.getControl(0).getValue();
		var cne = self.getControl(1).getValue();
		var csw = self.getControl(2).getValue();
		var cse = self.getControl(3).getValue();

		var v1 = cnw + (cne-cnw)*xratio;
		var v2 = csw + (cse-csw)*xratio;

		return v2 + (v2-v1)*yratio;
	}	

}

FIImageInterpol.prototype = Object.create(FIImage.prototype); 

//****************************************************************************

function FIImageMonadic() {

	var self = this;

	FIImage.call(self, [
		new FIControlMonadic(),
		new FIControlPoint()
	]);

	self.help1 = "This module generates colors as monadic function of point coordinates";
	self.help3 = "color =  {0} ( {1} )";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		//console.log("IMAGE MONADIC "+_context);
		var coord = self.getProvider(0).getPoint(_context);
		var arg = self.getControl(1).compute(coord);

		return self.getControl(0).compute(arg);
	}

}

FIImageMonadic.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageParity() {
	
	var self = this;

	FIImage.call(self, [
		new FIControlPoint(),
		new FIControlList(["even","odd"])
	]);
	
	self.help1 = "This module generates color according to coordinate parity";
	self.help2 = "Color is black if ";
	self.help3 = "floor( {0} ) is {1}";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);
		var arg = self.getControl(0).compute(coord);

		var parity = Math.abs(Math.floor(arg))%2;
		return self.getControl(1).getValue()==0 ? 1-parity : parity;
	}

}

FIImageParity.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIImageRange() {

	var self = this;

	FIImage.call(self, [
		new FIControlNumber("0"),
		new FIControlPoint(),
		new FIControlNumber("1")
	]);

	self.help1 = "This module produces color according to a range";
	self.help2 = "The color of a point is black if it verifies :";
	self.help3 = "{0}  <=  {1}  <=  {2} ";

	self.pointProviders = 1;
	self.valueProducers = 1;

	self.getValue = function(_context) {
		
		var coord = self.getProvider(0).getPoint(_context);

		var v0 = self.getControl(0).getValue();
		var v1 = self.getControl(1).compute(coord);
		var v2 = self.getControl(2).getValue();

		return (v0<=v1) && (v1<=v2) ? 1 : 0;		
	}

}

FIImageRange.prototype = Object.create(FIImage.prototype);

//****************************************************************************

function FIWarp(_controls) {
	
	var self = this;

	FIModule.call(this,_controls);

	self.pointProviders = 1;
	self.pointProducers = 1;
}

FIWarp.prototype = Object.create(FIModule.prototype);

//****************************************************************************

function FIWarpAffine() {

	var self = this;

	FIWarp.call(self,[
		new FIControlNumber("1"),
		new FIControlNumber("1"),
		new FIControlNumber("0"),
		new FIControlNumber("1"),
		new FIControlNumber("1"),
		new FIControlNumber("0")
	]);

	self.help1 = "This module makes an affine transformation of the points";
	self.help2 = "newx = {0} * oldx / {1}  +  {2}";
	self.help3 = "newy = {3} * oldy / {4}  +  {5}";

	self.getPoint = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);

		var v0 = self.getControl(0).getValue();
		var v1 = self.getControl(1).getValue();
		var v2 = self.getControl(2).getValue();
		var v3 = self.getControl(3).getValue();
		var v4 = self.getControl(4).getValue();
		var v5 = self.getControl(5).getValue();

		return [v0*coord[0]/v1+v2, v3*coord[1]/v4+v5];
	}

}

FIWarpAffine.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpCompare() {

	var self = this;

	FIWarp.call(self, [
		new FIControlList(["oldx","oldy","a"]),
		new FIControlCompare(),
		new FIControlList(["a","oldx","oldy"]),
		new FIControlNumber("0"),
		new FIControlList(["oldy","oldx","b"]),
		new FIControlCompare(),
		new FIControlList(["b","oldy","oldx"]),
		new FIControlNumber("0")
	]);

	self.help1 = "This module applies comparison functions to the coordinates";
	self.help2 = "newx  =  {0}  {1}  {2}         a = {3}";
	self.help3 = "newy  =  {4}  {5}  {6}         b = {7}";

	self.getPoint = function(_context) {
	
		var coord = self.getProvider(0).getPoint(_context);

		var x,y,z,t;
	
		switch(self.getControl(0).getValue()) {
			case 0 : x = coord[0]; break;
			case 1 : x = coord[1]; break;
			case 2 : x = self.getControl(3).getValue(); break;
		}

		switch(self.getControl(2).getValue()) {
			case 0 : y = self.getControl(3).getValue(); break;
			case 1 : y = coord[0]; break;
			case 2 : y = coord[1]; break;
		}

		switch(self.getControl(4).getValue()) {
			case 0 : z = coord[1]; break;
			case 1 : z = coord[0]; break;
			case 2 : z = self.getControl(7).getValue();break;
		}
	
		switch(self.getControl(6).getValue()) {
			case 0 : t = self.getControl(7).getValue(); break;
			case 1 : t = coord[1]; break;
			case 2 : t = coord[0]; break;
		}

		return [self.getControl(1).compute(x,y),
				self.getControl(5).compute(z,t)];	
	}

}

FIWarpCompare.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpDiadic() {

	var self = this;

	FIWarp.call(self, [
		new FIControlList(["oldx","oldy","a"]),
		new FIControlDiadic(),
		new FIControlList(["a","oldx","oldy"]),
		new FIControlNumber("0"),
		new FIControlList(["oldy","oldx","b"]),
		new FIControlDiadic(),
		new FIControlList(["b","oldy","oldx"]),
		new FIControlNumber("0")
	]);

	self.help1 = "This module applies diadic functions to the coordinates";
	self.help2 = "newx  =  {0}  {1}  {2}         a = {3}";
	self.help3 = "newy  =  {4}  {5}  {6}         b = {7}";

	self.getPoint = function(_context) {
	
		var coord = self.getProvider(0).getPoint(_context);

		var x,y,z,t;
	
		switch(self.getControl(0).getValue()) {
			case 0 : x = coord[0]; break;
			case 1 : x = coord[1]; break;
			case 2 : x = self.getControl(3).getValue(); break;
		}

		switch(self.getControl(2).getValue()) {
			case 0 : y = self.getControl(3).getValue(); break;
			case 1 : y = coord[0]; break;
			case 2 : y = coord[1]; break;
		}

		switch(self.getControl(4).getValue()) {
			case 0 : z = coord[1]; break;
			case 1 : z = coord[0]; break;
			case 2 : z = self.getControl(7).getValue();break;
		}
	
		switch(self.getControl(6).getValue()) {
			case 0 : t = self.getControl(7).getValue(); break;
			case 1 : t = coord[1]; break;
			case 2 : t = coord[0]; break;
		}

		return [self.getControl(1).compute(x,y),
				self.getControl(5).compute(z,t)];	
	}

	
}

FIWarpDiadic.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpMatrix() {

	var self = this;

	FIWarp.call(self,[
		new FIControlNumber("1"),
		new FIControlNumber("1"),
		new FIControlNumber("0"),
		new FIControlNumber("1"),
		new FIControlNumber("0"),
		new FIControlNumber("0"),
		new FIControlNumber("1"),
		new FIControlNumber("1"),
		new FIControlNumber("1"),
		new FIControlNumber("0")
	]);

	self.help1 =  "This module makes a matrix transformation of the points";
	self.help2 = "newx = {0} * oldx / {1}  +  {2} * oldy / {3}  +  {4}";
	self.help3 = "newy = {5} * oldx / {6}  +  {7} * oldy / {8}  +  {9}";

	self.getPoint = function(_context) {	

		var coord = self.getProvider(0).getPoint(_context);

		var v0 = self.getControl(0).getValue();		
		var v1 = self.getControl(0).getValue();		
		var v2 = self.getControl(0).getValue();		
		var v3 = self.getControl(0).getValue();		
		var v4 = self.getControl(0).getValue();		
		var v5 = self.getControl(0).getValue();		
		var v6 = self.getControl(0).getValue();		
		var v7 = self.getControl(0).getValue();		
		var v8 = self.getControl(0).getValue();		
		var v9 = self.getControl(0).getValue();		
	
		return [v0*coord[0]/v1 + v2*coord[1]/v3 + v4,
				v5*coord[0]/v6 + v7*coord[1]/v8 + v9];
	}

}

FIWarpMatrix.prototype = Object.create(FIWarp.prototype);


//****************************************************************************

function FIWarpMerge() {

	var self = this;

	FIWarp.call(self,[ ]);

	self.pointProviders = 2;

	self.help1 = "This module merges two coordinates (x1,y1) and (x2,y2)";
	self.help2 = "newx = oldx1"
	self.help3 = "newy = oldy2";

	self.getPoint = function(_context) {
	
		var coord0 = self.getProvider(0).getPoint(_context);
		var coord1 = self.getProvider(1).getPoint(_context);
		
		return [coord0[0],coord1[1]];
	}

}

FIWarpMerge.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpMonadic() {

	var self = this;

	FIWarp.call(self, [
		new FIControlMonadic(),
		new FIControlList(["oldx","oldy"]),
		new FIControlMonadic(),
		new FIControlList(["oldx","oldy"])
	]);

	self.help1 = "This module applies monadic functions to the coordinates";
	self.help2 = "newx = {0} ( {1} )";
	self.help3 = "newy = {2} ( {3} )";

	self.getPoint = function(_context) {
				
		var coord = self.getProvider(0).getPoint(_context);
		
		var x = coord[self.getControl(1).getValue()|0];
		x = self.getControl(0).compute(x);

		var y = coord[self.getControl(3).getValue()|0];	
		y = self.getControl(2).compute(y);

		return [x,y];
	}

}

FIWarpMonadic.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpPolar() {

	var self = this;

	FIWarp.call(self,[ ]);

	self.help1 = "This module changes from rectangular to polar coordinates";
	self.help2 = "newx = sqrt ( oldx * oldx  +  oldy * oldy )";
	self.help3 = "newy = atan ( oldy / oldx )";
	
	self.getPoint = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);

		var x = Math.sqrt(coord[0]*coord[0] + coord[1]*coord[1]);
		var y = Math.atan(coord[0],coord[1]);

		return [x,y];
	}


}

FIWarpPolar.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpRadial() {

	var self = this;

	FIWarp.call(self,[]);
	
	self.help1 = "This module changes the distance of the points";

	self.getPoint = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);

		var dist = Math.sqrt(coord[0]*coord[0] + coord[1]*coord[1]);
		var angle = Math.atan(coord[0],coord[1]);
	
		dist = Math.atan(2*Math.PI*dist/10);
		
		return [dist*Math.cos(angle),dist*Math.sin(angle)];	
	}

}

FIWarpRadial.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpRect() {

	var self = this;

	FIWarp.call(self,[]);

	self.help1 = "This modules changes from polar to rectangular coordinates";
	self.help2 = "newx = oldx * cos(oldy)";
	self.help3 = "newy = oldx * sin(oldy)";

	self.getPoint = function(_context) {

		var coord = self.getProvider(0).getPoint(_context);

		return [ coord[0]*Math.cos(coord[1]),
				coord[0]*Math.sin(coord[1])];
	}

}

FIWarpRect.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIWarpRotate() {

	var self = this;

	FIWarp.call(self,[
		new FIControlNumber("0")
	]);

	self.help1 = "This module rotates points by {0} degrees";
	
	self.getPoint = function(_context) {
		
		var coord = self.getProvider(0).getPoint(_context);

		var dist = Math.sqrt(coord[0]*coord[0] + coord[1]*coord[1]);
		var angle = Math.atan(coord[0],coord[1]);

		angle += Math.PI*self.getControl(0).getValue()/180;

		return [dist*Math.cos(angle) , dist*Math.sin(angle)]	;
	}

}

FIWarpRotate.prototype = Object.create(FIWarp.prototype);

//****************************************************************************

function FIDisplay(_controls) {

	var self = this;

	var levels = null;

	FIModule.call(self,_controls);

	self.run = function()  {

		// compute the gray levels

		var width = self.getControl(0).getValue()|0;

		levels = new Array(width*width);

		var context = new FIContext();
		context.iter = 0;
		context.width = width;

		var provider = self.getProvider(0);

		for(let i=0;i<width;i++) {
			context.ix = i;
			for(let j=0;j<width;j++) {
				context.iy = j;
				var v = provider.getValue(context);
				if(v<0) v = 0;
				else if(v>1) v = 1;
				levels[j*width+i] = 1-v;
				context.iter++;
			}
		}

	}
	
	self.getLevels = function() {
		return levels;	
	}

}

FIDisplay.prototype = Object.create(FIModule.prototype);

//****************************************************************************

function FIDisplayScreen() {

	var self = this;

	FIDisplay.call(self,[
		new FIControlNumber("500")
	]);

	self.valueProviders = 1;

	self.help1 = "Display the image in a canvas of witdh {0}";

}

FIDisplayScreen.prototype = Object.create(FIDisplay.prototype);

//****************************************************************************

function FIDisplayFile() {

	var self = this;

	FIDisplay.call(self, [
		new FIControlNumber("500"),
		new FIControlList(["PNG","JPEG"])
	]);

	self.valueProviders = 1;

	self.help1 = "Generate an image file of width {0}";
	self.help2 = "Type of file : {1}";
}

//****************************************************************************

