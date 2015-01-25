/**
 * New node file
 */
var me ={
	firecloud:{
		common:{
			// members 
			me:null,
			
			generateUUID:function(){
			    var d = new Date().getTime();
			    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			        var r = (d + Math.random()*16)%16 | 0;
			        d = Math.floor(d/16);
			        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
			    });
			    uuid=uuid.replace("[-]","");
			    
			    return uuid;
			},
			getUserId:function(callback){
				var err=null;
				// check me 
				if(this.me != null){
					callback(err,this.me._id);
					return;
				}
				
				
				
				// get me from server
				$.ajax({
					url:'/authentication/me',
					type:'GET',
					dataType:'json',
					success:function(response){
						me.firecloud.common.me= response;
						
						callback(null,me.firecloud.common.me._id);
					},
					statusCode: {
					    401: function() {
					      callback(401);
					    }
					  }
				});
			}
		}
	}	
};

function RestStore(modelName){
	this._baseUrl="/data";
	this._modelName=modelName;
	this._cursor={
			skip:0,
			limit:10
	};
}

RestStore.prototype.constructor=RestStore;

RestStore.prototype.query=function(criteria,callback){
	var theStore = this;
	$.ajax({
		url:theStore._baseUrl+'/'+theStore._modelName,
		type:'GET',
		data:{criteria:JSON.stringify(criteria)},
		dataType:'json',
		success:function(response){
			console.log(response);
			if(callback !=undefined){
				callback(response);
			}
		}
	});
};

RestStore.prototype.fetch=function(batchSize,criteria,callback){
	if(criteria!=undefined){
		this._cursor.criteria=criteria;
	}
	var theStore = this;
	$.ajax({
		url:theStore._baseUrl+'/'+theStore._modelName,
		type:'GET',
		data:{criteria:JSON.stringify(theStore._cursor.criteria),skip:theStore._cursor.skip||0,limit:batchSize},
		dataType:'json',
		success:function(items){
			console.log(items);
			theStore._cursor.skip=theStore._cursor.skip+batchSize;
			if(callback !=undefined){
				callback(items);
			}
		}
	});
}

RestStore.prototype.get=function(id,callback){
	var theStore = this;
	$.ajax({
		url:theStore._baseUrl+'/'+theStore._modelName+'/'+id,
		type:'GET',
		dataType:'json',
		success:function(response){
			console.log(response);
			if(callback !=undefined){
				callback(response);
			}
		}
	});
}

RestStore.prototype.insert=function(object,callback){
	var theStore = this;
	$.ajax({
		url:theStore._baseUrl+'/'+theStore._modelName,
		type:'POST',
		data:object,
		dataType:'json',
		success:function(response){
			console.log(response);
			if(callback !=undefined){
				callback(response);
			}
		}
	});
}