/**
 * New node file
 */

function Weibo(){
	this._baseURL='/socialnetwork';
	
	this._cursors=new Array();
}

Weibo.prototype.constructor=Weibo;

Weibo.prototype.fetchFriend=function(batchSize,callback){
	var cursor=0;
	if(this._cursors['friend']===undefined){
		this._cursors['friend']=cursor;
	}else{
		cursor=this._cursors['friend'];
	}
	var theWeibo =this;
	$.ajax({
		url:this._baseURL+'/friendship/follower',
		method:'GET',
		dataType:'json',
		data:{start:cursor,limit:batchSize},
		success:function(response){
			theWeibo._cursors['friend']=response.next_cursor;
			callback(response.users);
		}
	});
}
