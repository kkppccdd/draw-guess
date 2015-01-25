/**
 * Module dependencies.
 */
var assert = require("assert");

var express = require('express');
var ejs = require("ejs");
var http = require('http');
var path = require('path');
var aws = require('aws-sdk');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoskin = require('mongoskin');
var mongo = require("mongodb");

var session = require('cookie-session')

// social network integration
var weibo = require('./lib/weibo/index.js');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET

var WEIBO_APP_KEY = process.env.WEIBO_APP_KEY;
var WEIBO_APP_SECRET = process.env.WEIBO_APP_SECRET;

// load mongodb url
var mongodbUrl = process.env.MONGOHQ_URL;

var db = mongoskin.db(mongodbUrl, {
	native_parser : true
});

var app = express();

// all environments
app.use(session({
	keys : [ 'key1', 'key2' ]
}));
app.use(logger('dev'));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({
	limit : '5mb'
}));
app.use(bodyParser.urlencoded({
	extended : true,
	limit : '5mb'
}));
app.use(multer({
	dest : './tmp',
	inMemory : true
}));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
	// only use in development
	var errorhandler = require('errorhandler')
	app.use(errorhandler())
}

// authentication
weibo.init('weibo', WEIBO_APP_KEY, WEIBO_APP_SECRET);

// save referrer on session when be redirected to authentication
app.get('/authentication/login', function(req, res, next) {
	req.session.last_request = req.header('Referer', '/page/draw.html');
	next();
});
app.get('/authentication/me', function(req, res, next) {
	if(req.session.user){
		res.json(req.session.user);
	}else{
		res.status(401);
		res.send('unauthorized');
	}
});
app.use(weibo.oauth({
	loginPath : '/authentication/login',
	logoutPath : '/authentication/logout',
	blogtypeField : 'type',
	callbackPath : '/authentication/sinaweibo/callback',
	afterLogin : function(req, res, callback) {
		req.session.oauthUser.authenticatedAt=Date.now();
		var weiboUser = req.session.oauthUser;
		console.log(req.session.oauthUser.screen_name, 'login success');
		console.log(req.session.oauthUser);

		// mapping social network user to internal user
		// load mongodb url
		var mongodbUrl = process.env.MONGOHQ_URL;

		var db = mongoskin.db(mongodbUrl, {
			native_parser : true
		});

		db.collection('user').find({
			'providers.type' : 'weibo',
			'providers.accountId' : weiboUser.id
		}).toArray(function(err, items){
			assert.ok(err == null);
			if(items.length>0){
				req.session.user=items[0];
				res.redirect(req.session.last_request || '/page/draw.html');
			}else{
				// insert one
				var newUser = {
					avatar:weiboUser.profile_image_url,
					name:weiboUser.screen_name,
					providers : [ {
						type : 'weibo',
						accountId : weiboUser.id,
						name:weiboUser.screen_name
					} ]
				};
				
				db.collection('user').insert(newUser,function(err,result){
					if(err){
			    		res.status(500);
			    		res.send(err.message);
			    	}else{
			    		req.session.user=result;
			    		res.redirect(req.session.last_request || '/page/draw.html');
			    	}
				});
			}
		});

		
	},
	beforeLogout : function(req, res, callback) {
		console.log(req.session.oauthUser.screen_name, 'loging out');
		process.nextTick(callback);
	}
}));

var dataServiceRouter = require("./data/service.js");
app.use('/data', dataServiceRouter);

var questionRouter = require("./routes/question.js");
app.use("/page/question", questionRouter);

var weiboRouter = require("./routes/socialnetwork/weibo.js");
app.use('/socialnetwork', weiboRouter);

/*
 * app.post("/data/question",function(req,res,next){ req.body['correct']=0;
 * req.body['wrong']=0; db.collection("question").insert(req.body, function(err,
 * result){ if(err){ res.status(500); res.send(err.message); }else{
 * res.send(result[0]); } }); });
 * 
 */

app.get('/util/signS3put', function(req, res) {
	aws.config.update({
		accessKeyId : AWS_ACCESS_KEY,
		secretAccessKey : AWS_SECRET_KEY
	});
	var s3 = new aws.S3();
	var s3_params = {
		Bucket : S3_BUCKET,
		Key : req.query.s3_object_name,
		Expires : 60,
		ContentType : req.query.s3_object_type,
		ACL : 'public-read'
	};
	s3.getSignedUrl('putObject', s3_params, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var return_data = {
				signed_request : data,
				url : 'https://' + S3_BUCKET
						+ '.s3-ap-southeast-1.amazonaws.com/'
						+ req.query.s3_object_name
			};
			res.write(JSON.stringify(return_data));
			res.end();
		}
	});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
