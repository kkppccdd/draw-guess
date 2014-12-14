/**
 * New node file
 */

function midPointBtw(p1, p2) {
	return {
		x : p1.x + (p2.x - p1.x) / 2,
		y : p1.y + (p2.y - p1.y) / 2
	};
}

function Eraser(context) {
	this.init(context);
}

Eraser.prototype = {
	context : null,
	init : function(context) {
		this.context = context;

	},
	destroy : function() {

	},
	strokeStart : function(x, y, color) {
		this.context.lineWidth = 10;
		this.context.globalCompositeOperation = "destination-out";

		this.context.beginPath();
		this.context.moveTo(x, y);
	},
	stroke : function(x, y) {

		this.context.lineTo(x, y);
		this.context.stroke();
	},
	strokeEnd : function() {
	}
}

function Pen(context) {
	this.init(context);
}

Pen.prototype = {
	context : null,
	init : function(context) {
		this.context = context;

	},
	destroy : function() {

	},
	strokeStart : function(x, y, color) {
		this.context.globalCompositeOperation = "source-over";
		this.context.globalAlpha = 1.0;
		this.context.lineWidth = 1;
		this.context.lineJoin = 'round';
		this.context.lineCap = 'round';

		this.context.strokeStyle = color;
		this.context.fillStyle = color;
		this.context.shadowBlur = 0.2;
		this.context.shadowColor = color;

		this.context.beginPath();
		this.context.moveTo(x, y);
	},
	stroke : function(x, y) {

		this.context.lineTo(x, y);
		this.context.stroke();
	},
	strokeEnd : function() {
	}
};

function FeltPen(context) {
	this.init(context);
}

FeltPen.prototype = {
	context : null,
	init : function(context) {
		this.context = context;

	},
	destroy : function() {

	},
	strokeStart : function(x, y, color) {
		this.context.globalCompositeOperation = "source-over";
		this.context.globalAlpha = 1.0;
		this.context.lineWidth = 5;
		this.context.lineJoin = 'round';
		this.context.lineCap = 'round';

		this.context.strokeStyle = color;
		this.context.shadowBlur = 1;
		this.context.shadowColor = color;

		this.context.beginPath();
		this.context.moveTo(x, y);
	},
	stroke : function(x, y) {
		this.context.lineTo(x, y);
		this.context.stroke();
	},
	strokeEnd : function() {
	}
};

function HardBrush(context) {
	this.init(context);
}

HardBrush.prototype = {
	context : null,
	lastPoint : null,
	init : function(context) {
		this.context = context;

	},
	destroy : function() {

	},
	strokeStart : function(x, y, color) {
		this.context.globalCompositeOperation = "source-over";
		this.context.globalAlpha = 1.0;
		this.context.lineWidth = 10;
		this.context.lineJoin = 'butt';
		this.context.lineCap = 'butt';

		this.context.strokeStyle = color;
		//this.context.fillStyle = color;
		this.context.shadowBlur = 0;
		// this.context.shadowColor = color;

		this.lastPoint = {
			x : x,
			y : y
		};
	},
	stroke : function(x, y) {
		this.context.beginPath();
		this.context.moveTo(this.lastPoint.x, this.lastPoint.y);
		this.context.lineTo(x, y);
		this.context.stroke();

		this.context.moveTo(this.lastPoint.x - 5, this.lastPoint.y - 5);
		this.context.lineTo(x - 5, y - 5);
		this.context.stroke();

		this.lastPoint = {
			x : x,
			y : y
		};
	},
	strokeEnd : function() {

	}
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Crayon(context) {
	this.init(context);
}

Crayon.prototype = {
	context : null,
	density : 30,
	init : function(context) {
		this.context = context;

	},
	destroy : function() {

	},
	strokeStart : function(x, y, color) {
		this.context.globalCompositeOperation = "source-over";
		this.context.globalAlpha = 1.0;
		this.context.lineWidth = 5;
		this.context.lineJoin = 'round';
		this.context.lineCap = 'round';

		this.context.strokeStyle = color;
		this.context.fillStyle = color;
		this.context.shadowBlur = 0;
		// this.context.shadowColor = color;

		this.context.beginPath();
		this.context.moveTo(x, y);

	},
	stroke : function(x, y) {

		for (var i = this.density; i--;) {
			var radius = 5;
			var offsetX = getRandomInt(-radius, radius);
			var offsetY = getRandomInt(-radius, radius);
			this.context.fillRect(x + offsetX, y + offsetY, 1, 1);
		}
	},
	strokeEnd : function() {

	}
};
