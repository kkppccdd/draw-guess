/**
 * New node file
 */

(function(draw, $, undefined) {
	draw.word = null;

	draw.ctx = null;
	draw.color = "#000";
	draw.brush = null;
	draw.brushes = [];
	draw.COLOR = [ 0, 0, 0 ];

	draw.store = {
		userStore : new RestStore('user'),
		wordStore : new RestStore('word')
	}

	draw.service = {
		weibo : new Weibo()
	};

	/**
	 * private functions
	 */
	var postPaint = function(paint, callback) {

		var compressedSteps = LZMA.compress(JSON.stringify(paint.steps), 1,
				function(result) {
					console.log(result.length);
					paint.stepsLZMA = Base64Binary.base64ArrayBuffer(result);
					delete paint['steps'];

					$.ajax({
						url : '/data/paint',
						type : 'POST',
						data : JSON.stringify(paint),
						contentType : 'application/json',
						dataType : 'json',
						success : function(response) {
							callback(response);
						}
					});
				});

	};

	var postQuestion = function(question) {
		$.ajax({
			url : "/data/question",
			type : "POST",
			data : JSON.stringify(question),
			contentType : 'application/json',
			dataType : 'json',
			success : function(msg) {
				console.debug(msg);
				$.mobile.loading("hide");
				
				draw.question=msg;
				window.location="/page/question/" + msg._id + ".html";
				
			}
		});
	};

	/***************************************************************************
	 * public functions
	 */

	// function to setup a new canvas for drawing
	draw.newCanvas = function() {
		// define and resize canvas
		var width=$(window).width();
		var height=width;
		$("#content").height(height);
		var canvas = '<canvas id="canvas" width="' + width
				+ '" height="' + height + '"></canvas>';
		$("#content").html(canvas);

		// $('#content').draggable('disable');

		// setup canvas
		this.ctx = new RecordableCanvas(document.getElementById("canvas"));
		// ctx.translate(0.5, 0.5);
		// set init value

		// constructor brushes
		this.brushes['eraser'] = new Eraser(this.ctx);
		this.brushes['pen'] = new Pen(this.ctx);
		this.brushes['feltPen'] = new FeltPen(this.ctx);

		this.brushes['crayon'] = new Crayon(this.ctx);
		this.brushes['hardBrush'] = new HardBrush(this.ctx);

		// choose smal pen by default
		$(".pen").trigger("click");
		// choose color black by default
		$(".black").trigger("click");

		// setup to trigger drawing on mouse or touch
		$('#canvas').on(
				"touchstart",
				function(e) {
					e.preventDefault();
					draw.brush.strokeStart(
							e.originalEvent.changedTouches[0].pageX,
							e.originalEvent.changedTouches[0].pageY - 44,
							draw.color);
				});
		$('#canvas').on(
				"touchmove",
				function(e) {
					e.preventDefault();
					draw.brush.stroke(e.originalEvent.changedTouches[0].pageX,
							e.originalEvent.changedTouches[0].pageY - 44);
				});

		$('#canvas').on("touchend", function(e) {
			e.preventDefault();
			draw.brush.strokeEnd();
		});

	};

	draw.submitQuestion = function(canvas, answer) {

		var paint = canvas.paint;
		require(['/js/authentication/index.js'],function(authentication){
			authentication.checkLogin(function(user){
				var userId=user._id;
				$.mobile.loading("show");
				paint.creatorId = userId;
				postPaint(paint, function(response) {
					var question = {
						userId : paint.creatorId,
						paintId : response._id,
						answer : answer,
						correct : 0,
						wrong : 0
					};

					postQuestion(question);
				});
			});
		});
		/*
		me.firecloud.common.getUserId(function(err, userId) {
			if (err != null) {
				$('#loginGuide').popup('open');
			} else {
				$.mobile.loading("show");
				paint.creatorId = userId;
				postPaint(paint, function(response) {
					var question = {
						userId : paint.creatorId,
						paintId : response._id,
						answer : answer,
						correct : 0,
						wrong : 0,
						toUserId:draw.counterpart._id,
						completed:false
					};

					postQuestion(question);
				});
			}
		});*/

	};

	draw.displayMoreFriend = function(page, listViewSelector) {
		this.service.weibo
				.fetchFriend(
						20,
						function(items) {
							// remove load more item
							$(listViewSelector + " .load-more-item").remove();
							$(listViewSelector + " .ui-body-inherit").remove();
							var output = '';
							for (var i = 0; i < items.length; i++) {
								var item = items[i];
								output += '<li class="user" data-social-user-id="'
										+ item.id
										+ '" data-social-name="'
										+ item.screen_name
										+ '" data-social-avatar="'
										+ item.avatar_hd + '">';
								// avatar
								output += '<a href="#"><img src="'
										+ item.avatar_large + '" />';
								// screen name
								output += '<h1>' + item.screen_name
										+ '</h1></a>';
								output += '</li>';
							}

							if (items.length > 0) {
								// append load more item
								output += '<li class="load-more-item"><a href="#"><h1>Load more</h1></a><li>';
							} else {
								// no more
								output += '<li class="no-more-item"><a href="#"><h1>No more</h1></a><li>';
							}

							$(listViewSelector, page).append(output).listview(
									'refresh');

							// bind load more item click event handler
							$(listViewSelector + " .load-more-item").on(
									'click',
									function(event, ui) {
										// 
										console.log('clicked load more item.');
										draw.displayMoreFriend(page,
												listViewSelector);
									});
						});
	};

	/**
	 * paging display word list
	 */
	draw.displayMoreWord = function(page, listViewSelector, tagLabel) {
		$.mobile.loading("show");
		this.store.wordStore
				.fetch(
						10,
						{
							tag : tagLabel
						},
						function(items) {
							// remove load more item
							$(listViewSelector + " .load-more-item").remove();
							$(listViewSelector + " .ui-body-inherit").remove();
							var output = '';
							for (var i = 0; i < items.length; i++) {
								var item = items[i];
								output += '<li class="word" data-word-content="'
										+ item.content + '">';
								// word content
								output += '<a href="#">' + item.content
										+ '</a>';
								output += '</li>';
							}

							if (items.length > 0) {
								// append load more item
								output += '<li class="load-more-item"><a href="#"><h1>Load more</h1></a><li>';
							} else {
								// no more
								output += '<li class="no-more-item"><a href="#"><h1>No more</h1></a><li>';
							}

							$(listViewSelector, page).append(output).listview(
									'refresh');

							// bind load more item click event handler
							$(listViewSelector + " .load-more-item").on(
									'click',
									function(event, ui) {
										// 
										console.log('clicked load more item.');
										draw.displayMoreWord(page,
												listViewSelector);
									});
							
							$.mobile.loading("hide");
						});
	}
	
	draw.displayOtherWord=function(page,listViewSelector){
		var showOtherWord=function(wordNum){
			// randomly pick three word
			
			var count = draw.wordCache.length;
			
			var pickedWords = new Array();
			
			for(var i=0;i<wordNum;i++){
				var index = Math.floor(Math.random()*count);
				pickedWords.push(draw.wordCache[index]);
			}
			
			// remove load more item
			$(listViewSelector + " .load-other-item").remove();
			$(listViewSelector + " .ui-body-inherit").remove();
			var output = '';
			for (var i = 0; i < pickedWords.length; i++) {
				var item = pickedWords[i];
				output += '<li class="word" data-word-content="'
						+ item.content + '">';
				// word content
				output += '<a href="#">' + item.content
						+ '</a>';
				output += '</li>';
			}


			output += '<li class="load-other-item"><a href="#"><h1>换一批</h1></a><li>';

			$(listViewSelector, page).html(output).listview(
					'refresh');

			// bind load more item click event handler
			$(listViewSelector + " .load-other-item").on(
					'click',
					function(event, ui) {
						event.preventDefault();
						// 
						console.log('clicked load other item.');
						draw.displayOtherWord(page,
								listViewSelector);
					});
		};
		$.mobile.loading("show");
		if(this.loadedEnoughWord==true){
			showOtherWord(3);
			$.mobile.loading("hide");
		}else{
		this.store.wordStore.fetch(50,{},function(items){
			if(draw.wordCache==undefined || draw.wordCache==null){
				draw.wordCache=new Array();
			}
			
			draw.wordCache=draw.wordCache.concat(items);
			
			if(items.length<50){
				draw.loadedEnoughWord=true;
			}
			
			showOtherWord(3);
			$.mobile.loading("hide");
		});
		}
		
		
	}

	draw.checkAuthentication = function(next) {
		require(['/js/authentication/index.js'],function(authentication){
			authentication.checkLogin(function(user){
				// do nothing
				console.log('authenticated, userId:' + user._id);
				next();
			},function(){
				// lead user login
				$('#loginGuide').popup('open');
			});
		});
	}

	draw.checkWord = function() {
		// check property
		if (draw.word == null) {
			// navigate to choose word page
			$.mobile.navigate('#chooseWordPage');
			return false;
		} else {
			// display word on #drawHome-title
			$('#drawHome-title').html(this.getTitle());
			return true;
		}
	};
	
	draw.getTitle=function(){
		var title ='';
		if(this.word){
			title+='正在画 '+ this.word;
			
		}else{
			title+='正在画 ';
		}
		
		return title;
	}

	/**
	 * init functions
	 */
	var drawPageOnShow = function() {
		console.log('draw home is showing.');
		// display word on #drawHome-title
		$('#drawHome-title').html(draw.getTitle());
		
		draw.checkAuthentication(function() {
				draw.checkWord();
		});
	}

	var initPopupMenuEventHandler = function() {
		$('#clearCanvas').on('click', function(event, ui) {
			console.log('clicked clearCanvas');
			draw.ctx.clearRect(0, 0, draw.ctx.width, draw.ctx.height);
			$('#drawHome-menu').popup('close');
		});

		$('#chooseCounterpart').on('click', function(event, ui) {
			console.log('clicked chooseCounterpart');
			//$('#drawHome-menu').popup('close');
			$.mobile.navigate('#chooseCounterpartPage');

		});

		$('#chooseWord').on('click', function(event, ui) {
			console.log('clicked chooseWord');
			//$('#drawHome-menu').popup('close');
			$.mobile.navigate('#chooseWordPage');
		});
	};

	var initDrawTool = function() {
		// reset palette selection (css) and select the clicked color for canvas
		// strokeStyle
		$(".tool").click(function() {
			$(".tool").css("border-color", "#777");
			$(".tool").css("border-style", "solid");
			$(this).css("border-color", "#fff");
			$(this).css("border-style", "dashed");

		});

		$(".pen").click(function() {
			/*
			 * $.fn.draw = $.fn.smallPenDraw; console.info("set tool small
			 * pen"); ctx.beginPath();
			 */

			draw.brush = draw.brushes['pen'];
		});

		$(".feltPen").click(function() {
			draw.brush = draw.brushes['feltPen'];
		});

		$(".crayon").click(function() {
			draw.brush = draw.brushes['crayon'];
		});

		$(".hardBrush").click(function() {
			draw.brush = draw.brushes['hardBrush'];
		});
		$(".eraser").click(function() {
			draw.brush = draw.brushes['eraser'];
		});

		/***********************************************************************
		 * choose color
		 */
		$(".color-card").click(function() {
			draw.color = $(this).css("background-color");
			console.info("choose color:" + draw.color);
			$(".color-card").css('border', 'none');
			$(this).css('border', '1px dashed #fff');
			$(".color-choice").css("background-color", draw.color);

			$("#colorPalette").popup("close");
		});
	};
	
	var initSendMessageToCounterpartEventhandler=function(){
		$('#drawHome-sendMessageToCounterpart-ok').on('click',function(event,ui){
			// send message through weibo
			// get status text
			var status = $('#drawHome-sendMessageToCounterpart-status').val();
			// get image
			draw.ctx.toBlob(function(imageBlob){
				var formData = new FormData();

				formData.append('status',status);
				formData.append('pic',imageBlob);
				formData.append('access_token',WB2.oauthData.access_token);

				$.mobile.loading("show");
				

				$.ajax({
				    type: 'POST',
				    url: 'https://api.weibo.com/2/statuses/upload.json',
				    data: formData,
				    processData: false,
				    contentType: false
				}).done(function(data) {
				       console.log(data);
				       $.mobile.loading("hide");
				       window.location='/page/question/'+draw.question._id+'.html';
				}).fail(function(err){
					console.log(err);
				       $.mobile.loading("hide");
				       window.location='/page/question/'+draw.question._id+'.html';
				});
				
			});
		});
		
		$('#drawHome-sendMessageToCounterpart-cancel').on('click',function(event,ui){
			// 
			window.location='/page/question/'+draw.question._id+'.html';
		});
	}

	var initDrawPage = function() {

		// $(document).on( "pagecreate",'[id="draw-home"]',function(){
		setTimeout(drawPageOnShow, 1200);

		setTimeout(function() {
			draw.newCanvas();
		}, 1000);
		$('#draw-home').on('pageshow', function() {
			drawPageOnShow();
		});

		// init popup menu event handler
		initPopupMenuEventHandler();
		initDrawTool();
		initSendMessageToCounterpartEventhandler();

		// link the new button with newCanvas() function

		// link the complete button with completeDraw() function
		$("#complete").click(function() {

			var answer = draw.word;
			
			var canvas = draw.ctx;
			

			draw.submitQuestion(canvas, answer);

		});


		// bind login guide event handlers
		$('#loginGuide').on('click', 'li', function() {
			var loginMethod = $(this).attr('id');
			if (loginMethod === 'weibo') {
				window.location = '/authentication/login?type=weibo';
			}
		});

		// });
	};


	var initChooseWordPage = function() {
		// bind page show event
		$('#chooseWordPage').on(
				'pageshow',
				function(event, ui) {
					var tagLabel = sessionStorage.wordTagLabel;
					console.log('sessionStorage.wordTagLabel:' + tagLabel);

					/*
					draw.displayMoreWord($('#chooseWordPage'),
							'#chooseWordPage-wordList', tagLabel);
							*/
					
					draw.displayOtherWord($('#chooseWordPage'),
							'#chooseWordPage-wordList');
				});

		// bind choose word event
		$('#chooseWordPage-wordList').on('click', 'li.word', function(event, ui) {
			//
			var word = $(this).attr('data-word-content');
			console.log('choose word:' + word);

			draw.word = word;
			$.mobile.navigate('#draw-home');
		});
	};

	draw.init = function() {
		// init event handlers
		initDrawPage();
		initChooseWordPage();
	}

}(window.draw = window.draw || {}, jQuery));
