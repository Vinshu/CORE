var request = require('request');
var settings = require('./../conf/settings')

//Login webservice reqiest
exports.userLoginCheck = function (url, enrollmentId, enrollmentSecret, callback) {
	console.log("User login  check URL:",url);
    var ipJson =  {
            enrollId: enrollmentId,
            enrollSecret: enrollmentSecret
        }
    request({
        url: url,
        method: 'POST', 
        json: ipJson
    }, function (error, response, body) {
        if (error) {
		callback(false); 
        }else {
            if(response.statusCode == 200 && body.OK.indexOf(enrollmentId) !== -1){
		console.log(response.body);
                callback(true);    
            }else{
		console.log(response.body);
                callback(false);  
            }
        }
    });
}

exports.userValidate = function (url, enrollmentId, enrollmentSecret, callback) {
    var o = {};
    
    var ipJson = {
            enrollId: enrollmentId,
            enrollSecret: enrollmentSecret
    }
    
    o.url = url;
    o.request = ipJson;
    
    request({
        url: url,
        method: 'POST',
        json: ipJson
    }, function (error, response, body) {
        if (error) {
			o.result = "ERROR";
			o.status = o.status = "You are not "+enrollmentId;	//"ERROR";
            o.response = response.body;
            callback(o);
        }else {
            if(response.statusCode == 200 && body.OK.indexOf(enrollmentId) !== -1){
				o.result = "OK";
		        o.status = "You are "+enrollmentId;		//"OK";
                o.response = response.body;
                callback(o);
            }else{
				o.result = "NOTOK";
		        o.status = "You are not "+enrollmentId;		//"NOTOK";
				console.log(response.body);
                o.response = response.body;
                callback(o);
            }
        }
    });
}

//Network webservice reqiest
exports.getNetWorkInfo = function (url,callback) {
    request({
        url: url,
        method: 'GET', 
    }, function (error, response, body) {
        if (error) {
			callback(false);
        }else {
            if(response.statusCode == 200){
				callback(JSON.parse(body));
            }else{
                callback(false);    
            }
        }
    });
}

//Black Chain webservice reqiest
exports.getBlockChainInfo = function (url, callback) {
    var o = {};
    o.url = url;
    request({
        url: url,
        method: 'GET', 
    }, function (error, response, body) {
        if (error) {
             o.status = "ERROR";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "OK";
                o.response = body;
                callback(JSON.parse(body));    
            }else{
                o.status = "NOTOK";
                o.response = response.body;
                callback(o);            }
        }
    });
}

//Blacks webservice reqiest
exports.getBlocksInfo = function (url, callback) {
    var o = {};
    o.url = url
    request({
        url: url,
        method: 'GET', 
    }, function (error, response, body) {
        if (error) {
             o.status = "ERROR";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "OK";
                o.response = body;
                callback(o);    
            }else{
                o.status = "NOTOK";
                o.response = response.body;
                callback(o);            
            }
        }
    });
}

//eCert webservice reqiest
exports.geteCert = function (url,enrollmentId , callback) {
    var o = {};
    o.url = url+enrollmentId+"/ecert";
    request({
        url: o.url,
        method: 'GET', 
    }, function (error, response, body) {
        if (error) {
             o.status = "ERROR";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "OK";
                o.response = body;
	//	console.log("oooo: ",o);
	//	console.log("Booody: ",body);
                callback(o);    
            }else{
                o.status = "NOTOK";
                o.response = response.body;
                callback(o);            
            }
        }
    });
}


//eCert webservice reqiest
exports.gettCert = function (url,enrollmentId , callback) {
    var o = {};
    o.url = url+enrollmentId+"/tcert?count=1";
    request({
        url: o.url,
        method: 'GET', 
    }, function (error, response, body) {
        if (error) {
             o.status = "ERROR";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "OK";
                o.response = body;
                callback(o);    
            }else{
                o.status = "NOTOK";
                o.response = response.body;
                callback(o);            
            }
        }
    });
}

exports.BCLogout = function (url,enrollmentId , callback) {
	var o = {};
    o.url = url+enrollmentId;
    request({
        url: o.url,
        method: 'DELETE', 
    }, function (error, response, body) {
        if (error) {
             o.status = "ERROR";
             o.response = body;
			 console.log("BCLogout Error:",error);
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "OK";
                o.response = body;
				console.log("BCLogout OK:",body);
                callback(o);    
            }else{
                o.status = "NOTOK";
                o.response = response.body;
				console.log("BCLogout NOTOK:",body);
                callback(o);            
            }
        }
    });	
}

//Chain code deploy webservice reqiest
exports.chainCodeDeploy = function (url, blockChainId, callback) {
     var o = {};
    var jsonRequest = {
            "jsonrpc": "2.0",
            "method": "deploy",
            "params": {
                "type": 1,
            "chaincodeID": {
                "path": "http://gopkg.in/ibm-blockchain/marbles.v2/chaincode"
            },
            "ctorMsg": {
                "function": "init",
                "args": [
                            "12345"
                        ]
            },
            "secureContext": blockChainId //user.blockChainId
            },
            "id": 1
        } ;
    request({
        url: url,
        method: 'POST', 
        json: jsonRequest
    }, function (error, response, body) {
        console.log("chainCodeDeploy body----->>>>>",body);
        o.request = jsonRequest;
        if (error) {
             o.status = "unable to process the request";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "Request excecuted successfully";
                o.response = body;
                callback(o);    
            }else{
                o.status = "Request excecuted successfully. But have some errors";
                o.response = response.body;
                callback(o);    
            }
        }
    });
}
	
//Chain code invoke webservice reqiest
exports.chainCodeInvoke = function (url, message, blockChainId, args, callback) {
     var o = {};
    var jsonRequest = {
        "jsonrpc": "2.0",
        "method": "invoke",
        "params": {
            "type": 1,
            "chaincodeID": {
                "name": message
            },
            "ctorMsg": {
                "function": "init_marble",
                "args": args
            },
            "secureContext": blockChainId
        },
        "id": 1
    } ;
    
    request({
        url: url,
        method: 'POST', 
        json: jsonRequest
    }, function (error, response, body) {
        o.request = jsonRequest;
        if (error) {
             o.status = "unable to process the request";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "Request excecuted successfully";
                o.response = body;
                callback(o);    
            }else{
                o.status = "Request excecuted successfully. But have some errors";
                o.response = response.body;
                callback(o);    
            }
        }
    });
}



//Chain code query webservice reqiest
exports.chainCodeQuery = function (url, message, blockChainId, args, callback) {
    var o = {};
    var jsonRequest = {
        "jsonrpc": "2.0",
        "method": "query",
        "params": {
            "type": 1,
            "chaincodeID": {
                "name": message
            },
            "ctorMsg": {
                "function": "read",
                "args": args
            },
            "secureContext": blockChainId
        },
        "id": 1
    } 
    
    request({
        url: url,
        method: 'POST', 
        json: jsonRequest
    }, function (error, response, body) {
        o.request = jsonRequest;
        if (error) {
             o.status = "unable to process the request";
             o.response = body;
             callback(o);  
        }else {
            if(response.statusCode == 200){
                o.status = "Request excecuted successfully";
                o.response = body;
                callback(o);    
            }else{
                o.status = "Request excecuted successfully. But have some errors";
                o.response = response.body;
                callback(o);    
            }
        }
    });
}
