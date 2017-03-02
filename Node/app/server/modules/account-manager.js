var crypto 	= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 	= require('mongodb').Server;
var moment 	= require('moment');
var momentTz    = require('moment-timezone');

var BCAccounts  = require('./bc_accounts');
var WBS         = require('./webservice_call');

/*
	ESTABLISH DATABASE CONNECTION
*/
//var dbName = process.env.DB_NAME || 'node-login';
//var dbHost = process.env.DB_HOST || '54.245.18.38'
//var dbPort = process.env.DB_PORT || 3306;

var dbName = 'node-login';
var dbHost = '52.90.187.163';
var dbPort = 3306;

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		console.log(e);
	} else {
		if (process.env.NODE_ENV == 'live') {
			db.authenticate(process.env.DB_USER, process.env.DB_PASS, function(e, res) {
				if (e) {
					console.log('mongo :: error: not authenticated', e);
				}
				else {
					console.log('mongo :: authenticated and connected to database :: "'+dbName+'"');
				}
			});
		}	else{
			console.log('mongo :: connected to database :: "'+dbName+'"');
            insertBCAccounts();
		}
	}
});

var accounts = db.collection('accounts');
var blueChainAccounts = db.collection('bc_accounts');
var chainCodeMessage = db.collection('cc_message');
var devices = db.collection('devices');
var resources = db.collection('resources');
var rules = db.collection('rules');
var ruleMapping = db.collection('rule_mapping');
var accessLog = db.collection('access_log');


/* Inserting the block chain accounts to mongo db bc_accounts collection*/
function insertBCAccounts(){
    blueChainAccounts.find().toArray(function(e, res) {
        if(res.length == 0){
          	blueChainAccounts.insertMany(BCAccounts, function(err, r){
          });
        }
  });
}

exports.getBCAccount = function(callback){
    blueChainAccounts.find().toArray(function(e, res) {
        if(res.length > 0){
            callback(res[0]);
        }else{
            callback(null);
        }
    });
}

exports.getBCAccountByEnrollId = function(enrollmentId, callback){
    blueChainAccounts.findOne({enrollId:enrollmentId}, function(e, o) {
		if (o){
			callback(o);
		}	else{
			callback(null);
		}
	});
}

exports.getAccountById = function(id, callback){
    accounts.findOne({_id:getObjectId(id)}, function(e, o) {
		if (o){
			callback(o);
		}else{
			callback(null);
		}
	});
}


var deleteBCAccount = function(enrollmentId){
    blueChainAccounts.findOneAndDelete({enrollId:enrollmentId}).then(function(r) {
            console.log("BC Account Moved")
    });
}


exports.insertBCAccount = function(enrollmentId){
    //Need to be implemented
}

/*Chain Code Related Information*/
exports.insertOrUpdateCCMessage =  function(obj){
	chainCodeMessage.findOne({name:obj.name}, function(e, o){
		if(o){
			o.message = obj.message;
			chainCodeMessage.save(o, {safe: true});
		
		}else{
			chainCodeMessage.insert(obj, {safe: true});
		}
	})
} 


exports.getCCMessage =  function(name, callback){
	chainCodeMessage.findOne({name:name}, function(e, o){
		if(o){
			callback(o);
		}else{
			callback(null);
		}
	})
} 

/* login validation methods */
exports.autoLogin = function(url,user, callback)
{	
	accounts.findOne({username:user}, function(e, o) {
		if (o){
               WBS.userLoginCheck(url, o.blockChainId, o.enrollSecret , function(res){
                    if(res){
                        callback(o)
                    }else{
                        callback(null);
                    }
                })
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(url, user, callback)
{
	accounts.findOne({username:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
				if (o){
                    WBS.userLoginCheck(url, o.blockChainId , o.enrollSecret , function(res){
                        if(res){
					       callback(null, o);
                        }else{
					       callback('invalid-password');
                        }
                    });
				}	else{
					callback('invalid-password');
				}
		}
	});
}

/* record insertion, update & deletion methods */

/*exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({enrollId:newData.enrollId}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
                        deleteBCAccount(newData.enrollId);
				}
			});
		}
	});
}*/

/* account lookup methods  Start*/

exports.addNewAccount = function(newData, callback)
{
    console.log("Came in to the new account")
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    newData.password = md5(newData.password);
    accounts.insert(newData, {safe: true}, callback);
    deleteBCAccount(newData.blockChainId);
}

exports.updateAccount = function(newData, callback)
{
	console.log("Came in to the updateAccount", newData);
	accounts.findOne({username:newData.username}, function(e, o){
	    if(e){
            callback(null);
        }else{
            o.firstName     = newData.firstName;
            o.lastName  	= newData.lastName;
            o.username 	    = newData.username;
            o.password 	    = md5(newData.password);
            o.biometricId 	= newData.biometricId;
            o.role 	        = newData.role;
            o.email  	    = newData.email;
            o.department  	= newData.department;
            o.description  	= newData.description;
            o.blockChainId  = o.blockChainId;
            o.enrollSecret  = o.enrollSecret;
			o.enrollCertificate	    	= o.enrollCertificate;
			o.truncatedEcert = o.enrollCertificate.substr(34,17);
			//console.log("truncatedEcert :",o.truncatedEcert);
            o.date = moment().format('MMMM Do YYYY, h:mm:ss a');
            accounts.save(o, {safe: true}, callback);
        }
	});
}

exports.getAccountByUserID = function(userId,callback)
{
	accounts.findOne({username:userId},function(e,o){ 
        callback(o);
    });
}

exports.getAccountByblockChainId = function(blockChainId, callback){
    accounts.findOne({blockChainId:blockChainId}, function(e, o) {
		if (o){
			callback(o);
		}else{
			callback(null);
		}
	});
}


exports.getAllRecords = function(callback)
{
	accounts.find().toArray(function(e, res) {
		if (e){
          callback(e)   
        }else {
            callback(res)
        }
	});
}

exports.deleteAccount = function(id, callback)
{
    console.log("Came in to the delete account");
	accounts.remove({_id: getObjectId(id)}, callback);
}

/* account lookup methods  End*/


/* Device lookup methods  Start*/

exports.addNewDevice = function(newData, callback)
{
    console.log("Came in to the new Device")
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    devices.insert(newData, {safe: true}, callback);
}

exports.updateDevice = function(newData, callback)
{
	devices.findOne({deviceId:newData.deviceId}, function(e, o){
	    if(e){
            callback(null);
        }else{
            o.deviceHostName     = newData.deviceHostName;
            o.deviceIp  	     = newData.deviceIp;
            o.deviceType 	     = newData.deviceType;
            o.deviceId 	         = newData.deviceId;
            o.deviceDescription  = newData.deviceDescription;
            o.deviceOwner        = newData.deviceOwner;
            o.date = moment().format('MMMM Do YYYY, h:mm:ss a');
            devices.save(o, {safe: true}, callback);
        }
	});
}

exports.getDeviceById = function(id, callback)
{
	devices.findOne({_id:getObjectId(id)},function(e,o){
        callback(o);
    });
}

exports.getDeviceByDeviceId = function(deviceId, callback)
{
	devices.findOne({deviceId:deviceId},function(e,o){
		if(o){
			callback(o);
		}else{
			callback(null);
		}
    });
}

exports.getAllDevices = function(callback)
{
	devices.find().toArray(function(e, res) {
		if (e){
          callback(e)   
        }else {
            callback(res)
        }
	});
}

exports.deleteDevice = function(id, callback)
{
    devices.remove({_id: getObjectId(id)}, callback);
}

/* Device lookup methods  End*/

/* 
accessLog
	1. Timestamp
	2. Resource Id
	3. UserId/ DeviceId
	4. Username
	5. Auth (Accept/ Reject) 

*/
exports.addNewAccessLog = function(newData)
{
    console.log("Came in to the new Access Log")
    newData.createdDate = new Date();
	newData.date = momentTz().tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a');
    accessLog.insert(newData, {safe: true}, function(e , o){
    	console.log("Access Log Created")
    });
}

exports.getAllAccessLogs = function(callback)
{
	accessLog.find().limit(20).sort({createdDate: -1}).toArray(function(e, res) {
		if (e){
          callback(e)   
        }else {
            callback(res)
        }
	});
}

exports.delAllAccessLogs  = function(callback)
{
	accessLog.remove({}, callback); 
}

/* Resource lookup methods  Start*/

exports.addNewResource = function(newData, callback)
{
    console.log("Came in to the new Device")
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    resources.insert(newData, {safe: true}, callback);
}

exports.updateResource = function(newData, callback)
{
	resources.findOne({resourceHostName:newData.resourceHostName}, function(e, o){
	    if(e){
            callback(null);
        }else{
            o.resourceHostName     = newData.resourceHostName;
            o.resourceIp  	     = newData.resourceIp;
            o.resourceType 	     = newData.resourceType;
            o.resourceDescription   = newData.resourceDescription;
            o.resourceOwner  = newData.resourceOwner;
            o.date = moment().format('MMMM Do YYYY, h:mm:ss a');
            resources.save(o, {safe: true}, callback);
        }
	});
}

exports.getResourceByResourceId = function(resourceId,callback)
{
	resources.findOne({_id:getObjectId(resourceId)},function(e,o){
        callback(o);
    });
}

exports.getAllResources = function(callback)
{
	resources.find().toArray(function(e, res) {
		if (e){
          callback(e)   
        }else {
            callback(res)
        }
	});
}

exports.deleteResource = function(id, callback)
{
    console.log("Came in to the delete account");
	resources.remove({_id: getObjectId(id)}, callback);
}


exports.delAllResources = function(callback)
{
	resources.remove({}, callback); 
}

/* Resource lookup methods  End*/


/* Rule lookup methods  Start*/

exports.addNewRule = function(newData, callback)
{
    console.log("Came in to the new Device")
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    rules.insert(newData, {safe: true}, callback);
}

exports.updateRule = function(newData, callback)
{
	rules.findOne({ruleNumber:newData.ruleNumber}, function(e, o){
	    if(e){
            callback(null);
        }else{
            o.ruleNumber     = newData.ruleNumber;
            o.ruleName  	 = newData.ruleName;
            o.mappedId 	     = newData.mappedId;
            o.resourceIp     = newData.resourceIp;
            o.access  		 = newData.access;
            o.comments  	 = newData.comments;
            o.date = moment().format('MMMM Do YYYY, h:mm:ss a');
            rules.save(o, {safe: true}, callback);
        }
	});
}

exports.getRuleByRuleId = function(ruleId,callback)
{
	rules.findOne({_id:getObjectId(ruleId)},function(e,o){
        callback(o);
    });
}

exports.getRuleByRuleNumber = function(ruleNumber,callback)
{
	rules.findOne({ruleNumber:ruleNumber},function(e,o){
        callback(o);
    });
}

exports.getAllRules = function(callback)
{
	rules.find().toArray(function(e, res) {
		if (e){
          callback(e)   
        }else {
            callback(res)
        }
	});
}

exports.deleteRule = function(id, callback)
{
    console.log("Came in to the delete account");
	rules.remove({_id: getObjectId(id)}, callback);
}


exports.delAllRules = function(callback)
{
	rules.remove({}, callback);
	ruleMapping.remove({}, callback);
}

/* Rule lookup methods  End*/

/* Rule Mapping methods start*/


exports.addNewRuleMapping = function(newData, callback)
{
    console.log("Came in to the new rule mapping");
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    ruleMapping.insert(newData, {safe: true}, callback);
}

exports.updateRuleMapping = function(newData, callback)
{
	ruleMapping.findOne({ruleNumber:newData.ruleNumber}, function(e, o){
	    if(e){
            callback(null);
        }else{
            o.ruleNumber     = newData.ruleNumber;
            o.username  	 = newData.username;
            o.mappedId 	     = newData.mappedId;
            o.resourceIp     = newData.resourceIp;
            o.demoMarble  	 = newData.demoMarble;
            o.date = moment().format('MMMM Do YYYY, h:mm:ss a');
            ruleMapping.save(o, {safe: true}, callback);
        }
	});
}

exports.getRuleMappingByUserNameAndResourceIp = function(username, resourceIp, callback)
{
    console.log("Came in to the getRuleMappingByUserNameAndResourceIp");
	ruleMapping.findOne({username:username , resourceIp:resourceIp},function(e,o){
		if(o){
			callback(o);
		}else{
			callback(null);
		}
    });
}

exports.getRuleMappingByResourceIp = function(resourceIp, callback)
{
    console.log("Came in to the getRuleMappingByResourceIp");
	ruleMapping.findOne({resourceIp:resourceIp},function(e,o){
		if(o){
			callback(o);
		}else{
			callback(null);
		}
    });
}

exports.getRuleMappingByMappedId = function(mappedId, callback)
{
    console.log("Came in to the getRuleMappingByMappedId");
	ruleMapping.find({mappedId:mappedId}).toArray(function(e,o){
		if(o){
			callback(o.length);
		}else{
			callback(null);
		}
    });
}

exports.getAllRulesMappings = function(callback)
{
	ruleMapping.find().toArray(function(e, res) {
		if (e){
          callback(e)   
        }else {
            callback(res)
        }
	});
}


/* Rule Mapping methods End*/


exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
		}
	});
}


exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}


exports.getAccountByBlockChainId = function(blockChainId,callback)
{
	accounts.findOne({blockChainId:blockChainId},function(e,o){ 
        callback(o);
    });
}

exports.getNodeURLByEnrollID = function(enrollID,callback)
{
	accounts.findOne({enrollId:enrollID},function(e,o){ 
        callback(o);
    });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getHashPassword = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

exports.getAccountByUserName = function(userName, callback){
    accounts.findOne({username:userName}, function(e, o) {
  if (o){
   callback(o);
  }else{
   callback(null);
  }
 });
}

exports.getDeviceByDeviceHostName = function(deviceHostName,callback)
{
 devices.findOne({deviceHostName:deviceHostName},function(e,o){
        callback(o);
    });
}

exports.getDeviceByBlockChainId = function(blockChainId, callback)
{
 devices.findOne({blockChainId:blockChainId},function(e,o){
  if(o){
   callback(o);
  }else{
   callback(null);
  }
    });
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, o) {
		if (e){
            callback(null);
        }else {
            callback(o);
        }
	});
}

var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
