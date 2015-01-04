/**
 * sina weibo service
 */

var express = require('express');
//social network integration
var weibo = require('../../lib/weibo/index.js');
var inherits = require('util').inherits;
var formidable=require('formidable');
var util = require('util');

var WEIBO_APP_KEY=process.env.WEIBO_APP_KEY;
var WEIBO_APP_SECRET=process.env.WEIBO_APP_SECRET;



weibo.init('weibo', WEIBO_APP_KEY, WEIBO_APP_SECRET);


// add more functionality to weibo


module.exports = (function() {
	'use strict';
	var weiboHandler = express.Router();
	
	
	// check weibo authentication
	
	weiboHandler.all('*',function(req,res,next){
		var isWeiboAuthorized=function(session){
			if(session.oauthUser== undefined){
				return false;
			}
			
			if(session.oauthUser.access_token == undefined){
				return false;
			}
			
			return true;
		}
		
		if(isWeiboAuthorized(req.session)){
			next();
		}else{
			res.status(401);
			res.json({errorCode:401,errorMsg:'Unauthorized'});
		}
	});

	weiboHandler.get('/friendship/follower',function(req,res,next){
		var user = req.session.oauthUser;
		var start = req.query.start || 0;
		var limit = req.query.limit || 20;
		var cursor={cursor:start,count:limit,uid:user.id};
		console.log(cursor);
		weibo.friendship_follower(user,cursor,function(err,data){
			if(err){
				res.status(500);
				res.send(err);
			}else{
				console.log(data);
				res.json(data);
			}
		});
	});
	
	
	weiboHandler.post('/statuses/upload',function(req,res,next){
		var user = req.session.oauthUser;
		// read uploaded image
		var image = {
				name:req.files.image.originalname || req.files.image.fieldname,
				content_type:req.files.image.mimetype,
				data:req.files.image.buffer
		};
		var status =req.param('status','');
		
		console.log(image);
		console.log(status);
		
		weibo.upload(user,status,image,function(err,data){
			if(err){
				res.status(500);
				res.send(err);
			}else{
				console.log(data);
				res.json(data);
			}
		});
		
	});

	return weiboHandler;
})();
