/**
 * recordable canvas, which will record all manipulation.
 */

// operation code
var Operations = {
	CHOOSE_TOOL : 'CHOOSE_TOOL',
	CHOOSE_COLOR : 'CHOOSE_COLOR',
	START_STROKE : 'START_STROKE',
	STROKE : 'STROKE',
	END_STROKE : 'END_STROKE',
	MANIPULATION : 'M'
};

// step
function Step(operation, script) {
	//this.op = operation;
	if (script !== undefined) {
		this.s = script;
	}

	// generate timestamp
	this.ts = new Date().getTime();
}

/*
 * paint @param canvasSize {width:int,height:int} @param creatorId string
 */
function Paint(canvasSize, creatorId) {
	this.canvas = {
		size : canvasSize
	};
	if (creatorId !== undefined) {
		this.creatorId = creatorId;
	}
	this.timestamp = new Date();
	this.steps = [];
}

function RecordableCanvas(concreteCanvas) {
	this.concreteCanvas = concreteCanvas;
	this.concreteContext = this.concreteCanvas.getContext("2d");
	this.paint = new Paint({
		width : this.concreteCanvas.width,
		height : this.concreteCanvas.height
	});
}

// override method
RecordableCanvas.prototype = {
	beginPath : function() {
		var step = new Step(Operations.MANIPULATION, 'c.beginPath();');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.beginPath();
	},
	closePath : function() {
		var step = new Step(Operations.MANIPULATION, 'c.closePath();');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.closePath();
	},
	moveTo : function(x, y) {
		var step = new Step(Operations.MANIPULATION, 'c.moveTo(' + x + ',' + y
				+ ');');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.moveTo(x, y);
	},
	lineTo : function(x, y) {
		var step = new Step(Operations.MANIPULATION, 'c.lineTo(' + x + ',' + y
				+ ');');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.lineTo(x, y);
	},
	stroke : function() {
		var step = new Step(Operations.MANIPULATION, 'c.stroke();');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.stroke();
	},
	fillRect : function(x, y, width, height) {
		var step = new Step(Operations.MANIPULATION, 'c.fillRect(' + x + ','
				+ y + ',' + width + ',' + height + ');');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.fillRect(x, y, width, height);
	},
	clearRect : function(x, y, width, height) {
		var step = new Step(Operations.MANIPULATION, 'c.clearRect(' + x + ','
				+ y + ',' + width + ',' + height + ');');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.clearRect(x, y, width, height);
	},
	toBlob:function(a,b,c){
		this.concreteCanvas.toBlob(a,b,c);
	}
}

// override property setters and getters
Object.defineProperty(RecordableCanvas.prototype, 'lineWidth', {
	get : function() {
		return this.concreteContext.lineWidth;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.lineWidth=' + value
				+ ';');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.lineWidth = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'globalCompositeOperation', {
	get : function() {
		return this.concreteContext.globalCompositeOperation;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION,
				'c.globalCompositeOperation="' + value + '";');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.globalCompositeOperation = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'globalAlpha', {
	get : function() {
		return this.concreteContext.globalAlpha;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.globalAlpha=' + value
				+ ';');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.globalAlpha = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'lineJoin', {
	get : function() {
		return this.concreteContext.lineJoin;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.lineJoin="' + value
				+ '";');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.lineJoin = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'lineCap', {
	get : function() {
		return this.concreteContext.lineCap;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.lineCap="' + value
				+ '";');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.lineCap = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'strokeStyle', {
	get : function() {
		return this.concreteContext.strokeStyle;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.strokeStyle="' + value
				+ '";');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.strokeStyle = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'fillStyle', {
	get : function() {
		return this.concreteContext.fillStyle;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.fillStyle="' + value
				+ '";');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.fillStyle = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'shadowBlur', {
	get : function() {
		return this.concreteContext.shadowBlur;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.shadowBlur=' + value
				+ ';');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.shadowBlur = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'shadowColor', {
	get : function() {
		return this.concreteContext.shadowColor;
	},
	set : function(value) {
		// record
		var step = new Step(Operations.MANIPULATION, 'c.shadowColor="' + value
				+ '";');
		this.paint.steps.push(step);

		// perform on concrete context
		this.concreteContext.shadowColor = value;
	}
});

Object.defineProperty(RecordableCanvas.prototype, 'width', {
	get : function() {
		return this.concreteCanvas.width;
	},
	set : function(value) {
		// perform on concrete context
		this.concreteCanvas.width = value;
	}
});
Object.defineProperty(RecordableCanvas.prototype, 'height', {
	get : function() {
		return this.concreteCanvas.height;
	},
	set : function(value) {
		// perform on concrete context
		this.concreteCanvas.height = value;
	}
});

// PlayCanvas which purpose to play paint

function PlayCanvas(concreteCanvas, paint) {
	RecordableCanvas.call(this, concreteCanvas);
	this.paint = paint;
	this.stepCounter = 0;

	this.isPaused = true;
}

// PlayCanvas is inheriting from RecordableCanvas. It supports drawing and
// recording too.

PlayCanvas.prototype = Object.create(RecordableCanvas.prototype);

PlayCanvas.prototype.constructor = PlayCanvas;

// control method
PlayCanvas.prototype.play = function() {
	var playCanvas = this;
	if (this.isPaused == false) {
		// do nothing, avoiding multiple execution thread
	} else {
		this.isPaused = false;
		this.lastPerformStepTimestamp = new Date();
		this.playIntervalId = setInterval(function() {
			playCanvas._doPlay();
		}, 10);
	}
};

PlayCanvas.prototype.pause = function() {
	if (this.playIntervalId !== undefined) {
		clearInterval(this.playIntervalId);
	}

	this.isPaused = true;
}

PlayCanvas.prototype.restart=function(){
	this.pause();
	
	this.stepCounter=0;
	this.concreteContext.clearRect ( 0 , 0 , this.concreteCanvas.width, this.concreteCanvas.height );
	
	this.play();
}

/**
 * draw paint on canvas
 * 
 */
PlayCanvas.prototype._doPlay = function() {
	var c = this.concreteContext;
	var playCanvas = this;
	if (this.isPaused) {
		// paused, do nothing
	} else {
		// check if no more steps
		if (this.stepCounter >= this.paint.steps.length) {
			// no more step, play completed
			if (this.playIntervalId !== undefined) {
				clearInterval(this.playIntervalId);
			}
		} else {
			var getDefinitionTimePeriod = function(stepTs, previousTs) {
				var definitionTimePeriod = 1000;
				definitionTimePeriod = stepTs - previousTs;

				// reduce long wait
				if (definitionTimePeriod > 1000) {
					definitionTimePeriod = 1000;
				}

				return definitionTimePeriod;
			};
			var previousStepTs;
			if (this.stepCounter <= 0) {
				previousStepTs = this.paint.steps[this.stepCounter].ts;
			} else {
				previousStepTs = this.paint.steps[this.stepCounter - 1].ts;
			}
			// check if is time to execute this step
			var elapsedTimeOfReality = new Date()
					- this.lastPerformStepTimestamp;

			var step = this.paint.steps[this.stepCounter];
			if (getDefinitionTimePeriod(step.ts, previousStepTs) <= elapsedTimeOfReality) {
				eval(step.s);
				this.lastPerformStepTimestamp = new Date();
				this.stepCounter++;
			}

			// draw near step, for cayon, which massive points will be drawn in very close time
			while (this.stepCounter < this.paint.steps.length) {
				var nearStep = this.paint.steps[this.stepCounter];
				if (nearStep.ts - step.ts < 10) {
					eval(nearStep.s);
					//console.log('draw near step:' + this.stepCounter);
					this.lastPerformStepTimestamp = new Date();
					this.stepCounter++;

				} else {
					break;
				}

			}

		}
	}
};
