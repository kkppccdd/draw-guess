/**
 * question route
 */

var express = require('express');
var mongoskin = require('mongoskin');
var mongo = require("mongodb");

module.exports = (function() {
	'use strict';
	var questionHandler = express.Router();

	// load mongodb url
	var mongodbUrl = process.env.MONGOHQ_URL;

	var db = mongoskin.db(mongodbUrl, {
		native_parser : true
	});

	questionHandler.get("/:id.html", function(req, res, next) {
		var id = req.params.id;
		db.collection("question").findById(id, function(err, model) {
			res.render("question", {
				question : model
			});
		});
	});

	// guess
	questionHandler.post("/:id.html", function(req, res, next) {
		var id = req.param("questionId", null);
		var guessAnswer = req.param("answer", null);
		// load
		db.collection("question").findById(
				id,
				function(err, model) {
					var result = compareAnswer(model.answer, guessAnswer);
					var guess = {
						questionId : id,
						answer : guessAnswer,
						assessment : result.message,
						similarity : result.similarity,
						timestamp:new Date()
					};
					// save guess
					db.collection("guess").insert(guess, function(err, result) {
						if (err) {
							console.error(err);
						} else {
							console.log(result);
						}
					});

					if (result.similarity == 1.0) {
						//

						model.correct = (model.correct == undefined ? 0
								: model.correct) + 1;
						db.collection("question").updateById(model._id, model,
								function(err, result) {
									if (err) {
										console.error(err);
									} else {
										console.log(result);
									}
								});
					} else {
						model.wrong = (model.wrong == undefined ? 0
								: model.wrong) + 1;
						db.collection("question").updateById(model._id, model,
								function(err, result) {
									if (err) {
										console.error(err);
									} else {
										console.log(result);
									}
								});
					}
					
					res.render("question", {
						question : model,
						guess:guess
					});
				});
	});

	return questionHandler;
})();

var compareAnswer = function(correctAnswer, guessAnswer) {
	// check if completed match
	if (correctAnswer === guessAnswer) {
		return {
			message : "完全正确！",
			similarity : 1.00
		};
	}

	// match char one by one
	// split string into array
	var correctArray = correctAnswer.split('');
	var guessArray = guessAnswer.split('');

	var matchedCharNum = 0;

	var guessIndex = 0;
	var correctIndex = 0;

	for (guessIndex = 0; guessIndex < guessArray.length; guessIndex++) {
		var element = guessArray[guessIndex];

		for (correctIndex = 0; correctIndex < correctArray.length; correctIndex++) {
			var correctElement = correctArray[correctIndex];
			if (element === correctElement) {
				matchedCharNum = matchedCharNum + 1;
				delete correctArray[correctIndex];
				break;
			}
		}
	}
	if(matchedCharNum===0){
		return {
			message : "总共" + correctAnswer.length + "个字，你一个都没猜对。",
			similarity : 0.0
		};
	}else  if (matchedCharNum === correctAnswer.length) {
		return {
			message : "总共" + correctAnswer.length + "个字，你全猜对了，但顺序不对。",
			similarity : (matchedCharNum / correctAnswer.length) * 0.5
		};
	} else {

		return {
			message : "总共" + correctAnswer.length + "个字，你只猜对了" + matchedCharNum
					+ "个。",
			similarity : (matchedCharNum / correctAnswer.length) * 0.5
		};
	}
}

if (process.env.NODE_ENV === "test") {
	module.exports.compareAnswer = compareAnswer;
}