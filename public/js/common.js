/**
 * New node file
 */
var me ={
	firecloud:{
		common:{
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
			getUserId:function(){
				// check cookie
				if($.cookie("userId")!=undefined && $.cookie("userId")!=null){
					return $.cookie("userId");
				}
				// check local storage
				// Check browser support
				if (typeof(Storage) != "undefined") {
				    // retrieve
				    var temporaryUserId= localStorage.getItem("temporaryUserId");
				    if(temporaryUserId!=undefined && temporaryUserId!=null){
				    	return temporaryUserId;
				    }else{
				    	// generate temporary userId
				    	temporaryUserId=me.firecloud.common.generateUUID();
				    	localStorage.setItem("temporaryUserId",temporaryUserId);
				    	
				    	return temporaryUserId;
				    }
				}else{
					throw "unsupport local storage.";
				}
			}
		}
	}	
};
