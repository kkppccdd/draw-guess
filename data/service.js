/**
 * data service restful api
 */

//load required modules

var express = require("express");
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var mongo=require("mongodb");

//load mongodb url
var mongodbUrl=process.env.MONGODB_URL;

var db = mongoskin.db(mongodbUrl, {native_parser:true});


var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser());

// set db for each request
router.use(function(req,res,next){
    req.db = db;
    next();
});

router.listen=function(parentPath){
	
	
	//get model

	router.get(parentPath+"/:modelName/:id?",function(req,res){
		if(req.params.id === undefined){
			// get list
			//res.send("get list"+JSON.stringify(req.query));
			var db = req.db;
			var modelName=req.params.modelName;
			var query=req.query;
			db.collection(modelName).findItems(query,function (err, models) {
		        res.json(models);
		    });
		}else{
			
			//get specific model

			var db = req.db;
			var modelName=req.params.modelName;
			var id=req.params.id;
			db.collection(modelName).findById(id,function (err, model) {
		        res.json(model);
		    });
		}
		
	});
	
	router.post(parentPath+"/:modelName/:id?",function(req,res){
		if(req.params.id === undefined){
			// create
			var db = req.db;
			var modelName=req.params.modelName;
		    db.collection(modelName).insert(req.body, function(err, result){
		    	if(err){
		    		res.status(500);
		    		res.send(err.message);
		    	}else{
		    		res.send(result[0]);
		    	}
		    });
		}else{
			//update
			var db = req.db;
			var modelName=req.params.modelName;
			var id=req.params.id;
			req.body["_id"]=new mongo.ObjectID(id);
		    db.collection(modelName).updateById(id,req.body, function(err, result){
		    	if(err){
		    		res.status(500);
		    		res.send(err.message);
		    	}else{
		    		res.send(result);
		    	}
		    });
		}
		
	});
	
	router.delete(parentPath+'/:modelName/:id',function(req,res){
		var db = req.db;
		var modelName=req.params.modelName;
		var id=req.params.id;
	    db.collection(modelName).removeById(id,function(err, result){
	        res.send(
	            (err === null) ? { msg: result }: { msg: err }
	        );
	    });
	});
	
	
	
	return this;
};



module.exports=router;