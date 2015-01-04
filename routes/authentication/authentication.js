/**
 * authentication route
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

	

	// add sina weibo authentication handler

	return authenticationHandler;
})();

