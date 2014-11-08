
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , ejs=require("ejs")
  , http = require('http')
  , path = require('path')
  , aws = require('aws-sdk')
  , logger = require('morgan')
, cookieParser = require('cookie-parser')
, bodyParser = require('body-parser')
, mongoskin = require('mongoskin')
, mongo=require("mongodb");

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET

//load mongodb url
var mongodbUrl=process.env.MONGOHQ_URL;

var db = mongoskin.db(mongodbUrl, {native_parser:true});

var app = express();

// all environments


//app.use(express.compress());
app.use(logger('dev'));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

//app.all('/data/*',dataService.listen('/data'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.post("/data/question",function(req,res,next){
	req.body['correct']=0;
	req.body['wrong']=0;
	db.collection("question").insert(req.body, function(err, result){
    	if(err){
    		res.status(500);
    		res.send(err.message);
    	}else{
    		res.send(result[0]);
    	}
    });
});

app.get("/page/question/:id.html",function(req,res,next){
	var id=req.params.id;
	db.collection("question").findById(id,function (err, model) {
        res.render("question",{question:model});
    });
});

// guess
app.post("/page/question/:id.html",function(req,res,next){
	var id = req.param("questionId",null);
	var guessAnswer=req.param("answer",null);
	// load 
	db.collection("question").findById(id,function (err, model) {
        if(model.answer === guessAnswer){
        	//
        	
        	model.correct=(model.correct==undefined?0:model.correct)+1;
        	db.collection("question").updateById(model._id,model,function(err,result){
        		if(err){
        			console.error(err);
        		}else{
        			console.log(result);
        		}
        	});
        	
        	res.render("guess-correct",{question:model});
        }else{
        	model.wrong=(model.wrong==undefined?0:model.wrong)+1;
        	db.collection("question").updateById(model._id,model,function(err,result){
        		if(err){
        			console.error(err);
        		}else{
        			console.log(result);
        		}
        	});
        	
        	res.render("guess-wrong",{question:model});
        }
    });
});



app.get('/util/signS3put', function(req, res){
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3-ap-southeast-1.amazonaws.com/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
