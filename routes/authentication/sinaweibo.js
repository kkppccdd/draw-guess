/**
 * sina weibo authentication handler
 */

var express = require('express');
var mongoskin = require('mongoskin');
var mongo = require("mongodb");

module.exports = (function() {
	'use strict';
	var authenticationHandler = express.Router();

	// load mongodb url
	var mongodbUrl = process.env.MONGOHQ_URL;

	var db = mongoskin.db(mongodbUrl, {
		native_parser : true
	});


	// when user login sina weibo by OAuth, sina weibo server will redirect user browser to /authentication/sinaweibo/callback
	
	authenticationHandler.get('/callback',function(req,res,next){
		
		// extract code
		var code = req.param('code',null);
		
		// update or create user profile
	});

	return authenticationHandler;
})();
