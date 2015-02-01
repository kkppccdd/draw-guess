/**
 * New node file
 */

function Weibo(){
	this._baseURL='/socialnetwork';
	
	this._cursors=new Array();
}

Weibo.prototype.constructor=Weibo;

Weibo.prototype.fetchFriend=function(batchSize,success){
	var cursor=0;
	if(this._cursors['friend']===undefined){
		this._cursors['friend']=cursor;
	}else{
		cursor=this._cursors['friend'];
	}
	var theThis =this;
	
	var parameters={
			cursor:cursor,
			count:batchSize,
			uid:WB2.oauthData.uid
	};
	
	var options={
			method:'GET'
	};
	
	WB2.anyWhere(function(W){
		W.parseCMD('/friendships/followers.json',function(result,status){
			if(status==true){
				theThis._cursors['friend']=result.next_cursor;
				
				success(result.users);
			}
		},parameters,options);
	});
}
