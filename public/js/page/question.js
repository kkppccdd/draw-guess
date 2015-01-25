/**
 * New node file
 */
(function(questionView, $, undefined) {
	/***************************************************************************
	 * variables
	 */
	questionView.question = {};

	questionView.store = {
		questionStore : new RestStore('question'),
		guessStore : new RestStore('guess')
	};

	questionView.playCanvas = null;

	/***************************************************************************
	 * private functions
	 */

	var initQuestionPageHeaderButtonEventHandler = function() {
		$("#draw").click(function() {
			window.location = "/page/draw.html";
		});

		$("#guess").click(function() {
			// show dialog ask answer
			me.firecloud.common.getUserId(function(err, userId) {
				if (err != null) {
					// 
					$('#loginGuide').popup('open');
				} else {
					document.guessForm.reset();
					document.guessForm.userId.value = userId;
					$("#guessForm").popup("open");
				}
			});

		});
		
		// overwrite submit of guessForm, post guess by ajax
		
		$('#guessForm').submit(function(event){
			try {
				$("#guessForm").popup("close");
				var answer = $('#guessForm-answer').val();

				console.debug("get answer:" + answer);
				if (answer === "") {
					console.debug("get empty answer.");
					return false;
				}

				var formData = new FormData();
				formData.append('questionId',questionView.question._id);
				formData.append('answer',answer);
				
				$.ajax({
				    type: 'POST',
				    url: '/page/question/'+questionView.question._id+'.html',
				    data: formData,
				    processData: false,
				    contentType: false
				}).done(function(guess) {
				       console.log(guess);
				      if(guess.similarity===1.0){
				    	  // correct
				    	  // populate ttle and content o popup guessResultInfo
				    	  $('#guessResultInfo-title').html('猜对了!');
				    	  $('#guessResultInfo-content').html('正确答案：'+guess.answer);
				    	  $('#guessResultInfo-ok').closest('.ui-btn').hide();
				    	  $('#guessResultInfo-beatBack').closest('.ui-btn').show();
				    	  $('#guessResultInfo').popup('open');
				      }else{
				    	  //incorrect
				    	// populate ttle and content o popup guessResultInfo
				    	  $('#guessResultInfo-title').html('猜错了!');
				    	  $('#guessResultInfo-content').html(guess.assessment);
				    	  $('#guessResultInfo-ok').closest('.ui-btn').show();
				    	  $('#guessResultInfo-beatBack').closest('.ui-btn').hide();
				    	  $('#guessResultInfo').popup('open');
				      }
				});
				
			} catch (ex) {
				console.error(ex);

			} finally {
				return false;
			}
		});
		
		$('#guessResultInfo-beatBack').click(function(event,ui){
			var url ='/page/draw.html?toUserId='+questionView.question.userId;
			window.location=url;
		});

		$("#share").click(function() {
			// check authentication
			me.firecloud.common.getUserId(function(err, userId) {
				if (err != null) {
					// guide user login
					$('#loginGuide').popup('open');
				} else {
					$('#shareMenu').popup('open');
				}
			});

		});
	};

	var initQuestionPagePlayControlEventHandler = function() {
		// play control button

		$('#control-restart').click(function() {
			questionView.playCanvas.restart();

			$('#control-play').closest('.ui-btn').hide();
			$('#control-pause').closest('.ui-btn').show();
		});

		$('#control-play').click(function() {
			questionView.playCanvas.play();

			$('#control-play').closest('.ui-btn').hide();
			$('#control-pause').closest('.ui-btn').show();
		});

		$('#control-pause').click(function() {
			questionView.playCanvas.pause();

			$('#control-play').closest('.ui-btn').show();
			$('#control-pause').closest('.ui-btn').hide();
		});

		// init play control button
		$('#control-play').closest('.ui-btn').hide();
	}

	var initQuestionPage = function() {
		// init header button event handler
		initQuestionPageHeaderButtonEventHandler();

		// init play control event handler
		initQuestionPagePlayControlEventHandler();

		// bind login guide event handlers
		$('#loginGuide').on('click', 'li', function() {
			var loginMethod = $(this).attr('id');
			if (loginMethod === 'weibo') {
				window.location = '/authentication/login?type=weibo';
			}
		});

		questionPageOnShow();
	};

	var questionPageOnShow = function() {
		// load paint

		$.ajax({
			url : '/data/paint/' + questionView.question.paintId,
			type : 'GET',
			dataType : 'json',
			success : function(response) {
				var paint = response;
				var stepsLZMABytes = Base64Binary
						.decodeArrayBuffer(paint.stepsLZMA);
				LZMA.decompress(stepsLZMABytes, function(result) {
					paint.steps = JSON.parse(result);
					var canvas = '<canvas id="playCanvas" width="'
							+ paint.canvas.size.width + '" height="'
							+ paint.canvas.size.height + '"></canvas>';
					$("#paint").html(canvas);

					questionView.playCanvas = new PlayCanvas(document
							.getElementById('playCanvas'), paint);
					questionView.playCanvas.play();
				}, function(progress) {
					console.log('progress:' + progress);
				});

			}
		});
	}

	/***************************************************************************
	 * public functions
	 */

	questionView.displayMoreGuess = function(page, listViewSelector) {
		this.store.guessStore
				.fetch(
						10,
						{
							questionId : this.question._id,
							similarity : {
								$lt : 1.0
							}
						},
						function(items) {
							// remove load more item
							$(listViewSelector + " .load-more-item").remove();
							$(listViewSelector + " .ui-body-inherit").remove();

							var output = "";
							for (var i = 0; i < items.length; i++) {
								var guess = items[i];
								output += '<li class="guess">';
								output += '<img src="/image/anonymous_avatar.png"/>';
								output += '<h1>猜：' + guess.answer + '</h1>';
								output += '<span>准确度：'
										+ (guess.similarity * 100) + '%</span>';
								output += '<p>' + guess.assessment + '</p>';
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
									"refresh");

							// bind load more item click event handler
							$(listViewSelector + " .load-more-item").on(
									'click',
									function(event, ui) {
										// 
										console.log('clicked load more item.');
										questionView.displayMoreGuess(page,
												listViewSelector);
									});
						});
	}

	questionView.init = function() {
		initQuestionPage();
	}
}(window.questionView = window.questionView || {}, jQuery));