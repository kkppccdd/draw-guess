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
		
	};

	var initQuestionPagePlayControlEventHandler = function() {
		// play control button

		$('#control-restart').click(function() {
			questionView.playCanvas.restart();
		});
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
	
	var initAnswerPanel=function(){
		// init guess form
		var answerLength = questionView.question.answer.length;
		var placeHolder ='正确答案是'+answerLength+'个字';
		
		$('#guessForm-answer').attr("placeholder",placeHolder);
		$('#guessForm-answer').attr('size',answerLength);
		
		// construct charPosts
		/*
		var answerLength = questionView.question.answer.length;
		var output = "";
		for(var i=0;i<answerLength;i++){
			var charPotHtml='<div class="charPotHolder"><div class="charPot">&nbsp;</div></div>';
			
			output+=charPotHtml;
		}
		
		$('#charPotList').html(output);
		*/
		// load random chars
		/*
		questionView.getRandomChars(20, function(chars){
			var output="";
			var answer=questionView.question.answer;
			for(var i =0;i<answer.length;i++){
				chars.push(answer[i]);
			}
			
			for(var i=0;i<chars.length;i++){
				var candidatePotHtml='<div class="candidateCharHolder" ><div class="candidateChar">'+chars[i]+'</div></div>';
				output+=candidatePotHtml;
			}
			
			$('#candidateCharList').html(output);
		});
		*/
		
		// init event handler
		
		
		
	// overwrite submit of guessForm, post guess by ajax
		
		$('#guessForm').submit(function(event){
			event.preventDefault();
			try {
				
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
				    	  $('#charPotList').css('background','#7FFF00');
				    	  $('#guessForm-answerLabel').html(answer+'  正确!')
				    	  $('#guessForm').unbind('submit');
				    	  $('#guessForm-submit').attr('disabled','disabled');
				    	  $('#guessForm-answer').attr('disabled','disabled');
				      }else{
				    	  //incorrect
				    	  $('#charPotList').css('background','#FF4500');
				    	  $('#guessForm-answerLabel').html(answer+'  错误!');
				    	  $('#guessForm-answer').attr("placeholder",guess.assessment);
				    	  document.guessForm.reset();
				      }
				});
				
			} catch (ex) {
				console.error(ex);

			} finally {
				return false;
			}
		});
		
		
		
	}
	
	questionView.getRandomChars=function(size,callback){
			var charStore = new RestStore('char');
			var criteria={};
			var count=3000;
			charStore.fetch(count,criteria, function(items){
				var charCount=items.length;
				
				var chars=new Array();
				
				for(var i=0;i<size;i++){
					var index = Math.floor(Math.random()*charCount);
					
					chars.push(items[index].char);
				}
				
				callback(chars);
			});
		
		
	}

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
		
		
		// init answer panel
		initAnswerPanel();
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