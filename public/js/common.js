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
