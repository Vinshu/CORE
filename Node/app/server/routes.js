
var CT = require('./modules/country-list');
var PL = require('./modules/peer-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var WBS = require('./modules/webservice_call');

/***
All Static Declarations.
*/
var node = '84f5bce89e1846788d831b497838d4ec-vp0.us.blockchain.ibm.com';
var port = '5004';

var roles = ['admin', 'user'];
var status = ['enabled', 'user'];
var accessList = ['Permitted','Denied']

module.exports = function(app) {
    
    // main login page //
	app.get('/', function(req, res){
	   // check if the user's credentials are saved in a cookie //
	   console.log("Came in to the autolLogin");
		if (req.cookies.user == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
			var url = "https://"+node+":"+port;
			AM.autoLogin(url,req.cookies.user, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/loginDetails');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
    
    app.post('/', function(req, res){
		AM.getAccountByUserID(req.body['user'],function(ou){
            if (!ou){
				res.status(400).send("Not Found");
			}else{
                url = "https://"+node+":"+port+"/registrar";
                if(req.body['user'] == ou.username && AM.getHashPassword(req.body['pass']) == ou.password){
                    console.log("inside if");
                    AM.manualLogin(url, req.body['user'], function(e, o){
                        if (!o){
                            res.status(400).send(e);		//Thiru
                        }	else{
                            req.session.user = o;
                            res.cookie('node', o.node, { maxAge: 900000 });
                            res.cookie('user', o.username, { maxAge: 900000 });
                            res.status(200).send(o);
                        }
                    });
                }else{
                    res.status(400).send("Not matched");
                }
            }            
        });
	});
	
    /*----------- Users Related Service Start --------------*/
    app.get('/users', function(req,res){
        console.log("Came in to the users");
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
           AM.getAllRecords(function(o){
                res.render('users', {  title: 'Users Info Page', users : o , userType: req.session.user.role});	    
           }); 
        }
    });
    
     app.get('/user/:userId', function(req,res){
        console.log("Came in to the user",req.params.userId);
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
           AM.getAccountById(req.params.userId, function(o){
               res.render('editUser', {
                            title : 'User Settings',
                            roles : roles,
                            udata : o,
                            userType: req.session.user.role
                });
                //res.render('users', {  title: 'Users Info Page', users : o });	    
           }); 
        }
    });
    
    app.get('/delete/:userId', function(req,res){
        console.log("Came in to the user",req.params.userId);
       AM.deleteAccount(req.params.userId, function(e,o){
            res.redirect('/users');        
       }); 
    });
    
    app.post('/usernameCheck', function(req,res){
        res.status(200).send({ "valid": true });
    });
    
    app.post('/createUser', function(req, res){
        delete req.body.confirmPassword;
        AM.getBCAccount(function(BCAccount){
            req.body.blockChainId = BCAccount.enrollId;
            req.body.enrollSecret = BCAccount.enrollSecret;
            url = "https://"+node+":"+port+"/registrar";
			WBS.userLoginCheck(url, BCAccount.enrollId , BCAccount.enrollSecret , function(loginOp){
                console.log("loginOp---->>>",loginOp);
            });
				WBS.userLoginCheck(url, BCAccount.enrollId , BCAccount.enrollSecret , function(loginOp1){
				console.log("loginOp1---->>>",loginOp1);
				url1 = "https://"+node+":"+port+"/registrar/";
				WBS.geteCert(url1, BCAccount.enrollId , function(eCert){
            	req.body.enrollCertificate = eCert.response;
				req.body.truncatedEcert = eCert.response.substr(34,17);
				//console.log("truncatedEcert :",req.body.truncatedEcert);
				//console.log("geteCert---->>>",eCert.response);
					AM.addNewAccount(req.body, function(e,o){
                	if(e){
                        	console.log("e",e) ;
                        }else{
                        	res.redirect('/users');
                        }
                  });
            });
	    });
			
        });
    });
    
    app.post('/save', function(req, res){
        delete req.body.confirmPassword;
        console.log("Came in to the save");
        AM.updateAccount(req.body, function(e,o){
            if(e){
               console.log("e",e) ;
            }else{
                res.redirect('/users');        
            }
        });
    });
    
    app.get('/addUser', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            res.render('createUser', {  title: 'Create user page', roles : roles, userType: req.session.user.role});	    
        }
    });
    
    
     app.get('/allUsers', function(req,res){
        console.log("Came in to All users");
         //AM.delAllRecords(function(e,o){
           AM.getAllRecords(function(o){
                res.status(200).send(o);
           });       
         //});
    });
    
    
    /*----------- Device Related Service Start --------------*/
    
    app.get('/devices', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
           AM.getAllDevices(function(o){
                res.render('devices', {  title: 'Device Info Page', devices : o , userType: req.session.user.role});	    
           });
        } 
    });
    
     app.get('/device/:deviceId', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
           AM.getDeviceById(req.params.deviceId, function(o){
               res.render('editDevice', {
                            title : 'Device Settings',
                            deviceData : o,
                            userType: req.session.user.role
                });
           });
        } 
    });
    
    app.get('/deleteDevice/:deviceId', function(req,res){
       AM.deleteDevice(req.params.deviceId, function(e,o){
            res.redirect('/devices');        
       }); 
    });
	
	app.post('/createDevice', function(req, res){
        AM.getBCAccount(function(BCAccount){
            req.body.blockChainId = BCAccount.enrollId;
            req.body.enrollSecret = BCAccount.enrollSecret;
			
			url = "https://"+node+":"+port+"/registrar";
			WBS.userLoginCheck(url, BCAccount.enrollId , BCAccount.enrollSecret , function(loginOp){
                console.log("loginOp---->>>",loginOp);
            });
			
			WBS.userLoginCheck(url, BCAccount.enrollId , BCAccount.enrollSecret , function(loginOp1){
			console.log("loginOp1---->>>",loginOp1);
			url1 = "https://"+node+":"+port+"/registrar/";
				WBS.geteCert(url1, BCAccount.enrollId , function(eCert){
				req.body.enrollCertificate = eCert.response;
				//console.log("geteCert---->>>",eCert.response);						  
						AM.addNewDevice(req.body, function(e,o){
							if(e){
							   console.log("e",e) ;
							}else{
								res.redirect('/devices');        
							}
						});
					});
            });
        });
    });
    
    app.post('/deviceSave', function(req, res){
        AM.updateDevice(req.body, function(e,o){
            if(e){
               console.log("e",e) ;
            }else{
                res.redirect('/devices');        
            }
        })
    });
    
    app.get('/addDevice', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            res.render('createDevice', {  title: 'Create Device Page', userType: req.session.user.role});	    
        }
    });
    
    app.get('/allDevices', function(req,res){
        console.log("Came in to All users");
         //AM.delAllRecords(function(e,o){
           AM.getAllDevices(function(o){
                res.status(200).send(o);
           });       
         //});
    });
    
    /*----------- Device Related Service End --------------*/
    
    /*----------- Resource Related Service Start --------------*/
    
    app.get('/resources', function(req,res){
        console.log("Came in to the resources");
       AM.getAllResources(function(o){
            if(req.session.userResourceAccessError && req.session.userResourceAccessError != null){
                var errorMessage = req.session.userResourceAccessError;
                req.session.userResourceAccessError = null;
                res.render('resources', {  title: 'Resource Info Page', resources : o, userType: req.session.user.role, errorMessage: errorMessage});      
            }else{
                res.render('resources', {  title: 'Resource Info Page', resources : o, userType: req.session.user.role });      
            }
       }); 
    });
    
     app.get('/resource/:resourceId', function(req,res){
       AM.getResourceByResourceId(req.params.resourceId, function(o){
            if(req.session.user.role == 'admin'){
                res.render('editResource', {
                    title : 'Resource Settings',
                    resourceData : o,
                    userType: req.session.user.role
                });   
            }else{
                var args = []
                var mappedId 
                AM.getCCMessage(node, function(obj){ 
                    if(obj && obj != null){
                        var url = "https://"+node+":"+port+"/chaincode";
                        AM.getRuleMappingByUserNameAndResourceIp(req.session.user.username, o.resourceIp, function(ruleMappingObj){
                            console.log(ruleMappingObj);
                            if(ruleMappingObj){
                                args.push(ruleMappingObj.demoMarble);
                                mappedId = ruleMappingObj.mappedId;
                            }

                            WBS.chainCodeQuery(url, obj.message ,req.session.user.blockChainId, args, function(ccQueryOP){
                                console.log("ccQueryOP---->>>",ccQueryOP);
								//console.log("Result: ",ccQueryOP.response.result.message.includes("denied"));
                               //if(ccQueryOP.response.result && ccQueryOP.response.result != undefined){									
								if(ccQueryOP.response.result.message.includes("denied") != true && ccQueryOP.response.result != undefined){
                                    accessLogCreation(o.resourceIp, mappedId, req.session.user.username, "Accept");
                                    res.render('editResource', {
                                        title : 'Resource Settings',
                                        resourceData : o,
                                        userType: req.session.user.role
                                    });                            
                                }else{
                                    accessLogCreation(o.resourceIp, mappedId, req.session.user.username, "Reject");
                                    req.session.userResourceAccessError = null;
                                    req.session.userResourceAccessError = req.session.user.username+" don't have permisson to access the resource ("+o.resourceIp+")";
                                    res.redirect('/resources');
                                }

                            });
                        });    
                    }      
                }) 
            } 
          
       }); 
    });
	
    var accessLogCreation = function(resourceIp, mappedId, username, auth){
        var newData = {};
        console.log("Came on to the accessLogCreation:",auth);
        if(mappedId && mappedId != null){
            newData.resourceIp = resourceIp;                
            newData.mappedId = mappedId;
            newData.username = username;
            newData.auth = auth;
            AM.addNewAccessLog(newData);
        }else{
            AM.getRuleMappingByResourceIp(resourceIp, function(ruleMappingObj){
                if(ruleMappingObj){
                    mappedId = ruleMappingObj.mappedId;
                }
                newData.resourceIp = resourceIp;                
                newData.mappedId = mappedId;
                newData.username = username;
                newData.auth = auth;
                AM.addNewAccessLog(newData);
            });
        }
    }

    app.get('/logs', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
           AM.getAllAccessLogs(function(o){
                res.render('logs', {  title: 'Logs Info Page', logs : o, userType: req.session.user.role });      
           });
        } 
    });

    app.get('/deleteResource/:resourceId', function(req,res){
       AM.deleteResource(req.params.resourceId, function(e,o){
            res.redirect('/resources');        
       }); 
    });
    
    app.post('/createResource', function(req, res){
        AM.addNewResource(req.body, function(e,o){
            if(e){
               console.log("e",e) ;
            }else{
                res.redirect('/resources');        
            }
        })
    });
    
    app.post('/resourceSave', function(req, res){
        AM.updateResource(req.body, function(e,o){
            if(e){
               console.log("e",e) ;
            }else{
                res.redirect('/resources');        
            }
        })
    });
    
    app.get('/addResource', function(req,res){
        res.render('createResource', {  title: 'Create Resource Page', userType: req.session.user.role});	    
    });
    
    app.get('/allResources', function(req,res){
        console.log("Came in to All Resources");
         //AM.delAllResources(function(e,o){
           AM.getAllResources(function(o){
                res.status(200).send(o);
           });       
         //});
    });


    app.get('/allAccessLogs', function(req,res){
        console.log("Came in to All Access Logs");
        //AM.delAllAccessLogs(function(e,o){

        AM.getAllAccessLogs(function(o){
            res.status(200).send(o);
        }); 
       //});      
    });
    
    /*----------- Resource Related Service End --------------*/
    
    
    
    /*----------- Rule Related Service Start --------------*/
    
    app.get('/rules', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
           AM.getAllRules(function(o){
                res.render('rules', {  title: 'Resource Info Page', rules : o, userType: req.session.user.role });	    
           });
        } 
    });
    
     app.get('/rule/:ruleId', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            var mapIds = [];
            var resourceIps = [];
            AM.getRuleByRuleId(req.params.ruleId, function(o){
                AM.getAllRecords(function(users){
                    users.forEach(function(user) {
                        mapIds.push(user.username);
                    });
                    AM.getAllDevices(function(devices){
                        devices.forEach(function(device) {
                            mapIds.push(device.deviceHostName);
                        });
                        AM.getAllResources(function(resources){
                            resources.forEach(function(resource) {
                                resourceIps.push(resource.resourceIp);
                            });
                            res.render('editRule', 
                                {  title: 'Edit Rule', 
                                   mapIds : mapIds, 
                                   resourceIps:resourceIps, 
                                   accessList : accessList, 
                                   ruleData : o,
                                   userType: req.session.user.role
                               });
                        });
                    });
                });
           }); 
        }
    });
    
    app.get('/deleteRule/:ruleId', function(req,res){
       AM.deleteRule(req.params.ruleId, function(e,o){
            res.redirect('/rules');        
       }); 
    });
    
    app.post('/ruleNumberCheck', function(req,res){
        AM.getRuleByRuleNumber(req.body.ruleNumber, function(e,o){
            if(o){
                res.status(200).send({ "valid": false });
            }else{
                res.status(200).send({ "valid": true });
            }
        }); 
    });

    /*app.post('/createRule', function(req, res){
        //doing chain code deploy
        var args = [];
		console.log("request body : ",req.body);
        var url = "https://"+node+":"+port+"/chaincode";
        //console.log("URL:",url);
        //console.log("blockChainId:",req.session.user.blockChainId);
        WBS.chainCodeDeploy(url, req.session.user.blockChainId, function(ccDeploy){                
            var obj = {};
            obj.name = node;
            if(ccDeploy.response.result && ccDeploy.response.result != undefined){
                obj.message = ccDeploy.response.result.message;
                AM.insertOrUpdateCCMessage(obj);
                var demoMarble 
                AM.getRuleMappingByMappedId(req.body.mappedId, function(count){
                    demoMarble = req.body.mappedId+count
                    //console.log("demoMarble--->>>",demoMarble);
                    AM.getAccountByblockChainId(req.body.mappedId, function(userObj){
                        var newData = {}
                        newData.ruleNumber = req.body.ruleNumber;
                        newData.username = userObj.username;
                        newData.mappedId = req.body.mappedId;
                        newData.demoMarble = demoMarble;
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            newData.resourceIp = req.body.resourceIp;
                        }
                        //doing code invoke
                        args.push(demoMarble);
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            args.push(req.body.resourceIp);
                        }else{
                            args.push('127.0.0.1');
                        }
                        args.push('1');
                        args.push(req.body.access);

                        //console.log("args----->>>>",args);
                        //console.log("obj.message",obj.message)
                        WBS.chainCodeInvoke(url, obj.message ,req.session.user.blockChainId, args, function(o){
                            //console.log("chain Invoke---->>>>",o)
                            if(o.response.result && o.response.result != undefined){
                                    AM.addNewRuleMapping(newData);
                                    AM.addNewRule(req.body, function(e,o){
                                    if(e){
                                       console.log("e",e) ;
                                    }else{
                                        res.redirect('/rules');        
                                    }
                                });
                            }
                            
                        });
                    });
                });
            }
        });
        
    });*/
	
	app.post('/createRule', function(req, res){
        //doing chain code deploy
        var args = [];
        var url = "https://"+node+":"+port+"/chaincode";
        //console.log("URL:",url);
        //console.log("blockChainId:",req.session.user.blockChainId);
        WBS.chainCodeDeploy(url, req.body.blockChainId, function(ccDeploy){                
            var obj = {};
            obj.name = node;
            if(ccDeploy.response.result && ccDeploy.response.result != undefined){
                obj.message = ccDeploy.response.result.message;
                AM.insertOrUpdateCCMessage(obj);
                var demoMarble 
                AM.getRuleMappingByMappedId(req.body.blockChainId, function(count){
                    demoMarble = req.body.blockChainId+count
                    var newData = {}
                    AM.getAccountByblockChainId(req.body.blockChainId, function(userObj){
                        if(userObj){
                            newData.username = userObj.username;
                        }else{
                            AM.getDeviceByBlockChainId(req.body.blockChainId, function(deviceObj){
                                newData.username = deviceObj.deviceHostName;
                            });
                        }
                        newData.ruleNumber = req.body.ruleNumber;
                        newData.mappedId = req.body.blockChainId;
                        newData.demoMarble = demoMarble;
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            newData.resourceIp = req.body.resourceIp;
                        }
                        //doing code invoke
                        args.push(demoMarble);
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            args.push(req.body.resourceIp);
                        }else{
                            args.push('127.0.0.1');
                        }
                        args.push('1');
                        args.push(req.body.access);

                        //console.log("args----->>>>",args);
                        //console.log("obj.message",obj.message)
                        WBS.chainCodeInvoke(url, obj.message ,req.body.blockChainId, args, function(o){
                            //console.log("chain Invoke---->>>>",o)
                            if(o.response.result && o.response.result != undefined){
                                    AM.addNewRuleMapping(newData);
                                    AM.addNewRule(req.body, function(e,o){
                                    if(e){
                                       console.log("e",e) ;
                                    }else{
                                        res.redirect('/rules');        
                                    }
                                });
                            }                            
                        });
                    });
                });

            }
        });
        
    });
    
    app.post('/ruleSave', function(req, res){
        var args = []
		console.log("Request : ",req.body);
        var url = "https://"+node+":"+port+"/chaincode";
        AM.getCCMessage(node, function(obj){ 
            if(obj && obj != null){
                var demoMarble 
                AM.getRuleMappingByMappedId(req.body.blockChainId, function(count){
                    demoMarble = req.body.blockChainId+count
                    console.log("demoMarble--->>>",demoMarble);
                    var newData = {}
                    AM.getAccountByblockChainId(req.body.blockChainId, function(userObj){
                        if(userObj){
                            newData.username = userObj.username;
                        }else{
                            AM.getDeviceByBlockChainId(req.body.blockChainId, function(deviceObj){
                                newData.username = deviceObj.deviceHostName;
                            });
                        }
                        newData.ruleNumber = req.body.ruleNumber;
                        newData.mappedId = req.body.blockChainId;
                        newData.demoMarble = demoMarble;
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            newData.resourceIp = req.body.resourceIp;
                        }

                        args.push(demoMarble);
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            args.push(req.body.resourceIp);
                        }else{
                            args.push('127.0.0.1');
                        }
                        args.push('1');
                        args.push(req.body.access);
                        console.log("update args----->>>>",args);
                        console.log("update obj.message",obj.message)
                        WBS.chainCodeInvoke(url, obj.message ,req.body.blockChainId, args, function(o){
                            console.log("update chain Invoke---->>>>",o)
                            if(o.response.result && o.response.result != undefined){
                                AM.updateRuleMapping(newData);
                                AM.updateRule(req.body, function(e,o){
                                    if(e){
                                       console.log("e",e) ;
                                    }else{
                                        res.redirect('/rules');        
                                    }
                                })
                            }
                        });
                    });
                });
            }  
        })  
    });
	
	/*app.post('/ruleSave', function(req, res){
        var args = []
        var url = "https://"+node+":"+port+"/chaincode";
        AM.getCCMessage(node, function(obj){ 
            if(obj && obj != null){
                var demoMarble 
                AM.getRuleMappingByMappedId(req.body.mappedId, function(count){
                    demoMarble = req.body.mappedId+count
                    console.log("demoMarble--->>>",demoMarble);
                    AM.getAccountByblockChainId(req.body.mappedId, function(userObj){
                        var newData = {}
                        newData.ruleNumber = req.body.ruleNumber;
                        newData.username = userObj.username;
                        newData.mappedId = req.body.mappedId;
                        newData.demoMarble = demoMarble;
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            newData.resourceIp = req.body.resourceIp;
                        }

                        args.push(demoMarble);
                        if(req.body.resourceIp && req.body.resourceIp != null){
                            args.push(req.body.resourceIp);
                        }else{
                            args.push('127.0.0.1');
                        }
                        args.push('1');
                        args.push(req.body.access);


                        console.log("update args----->>>>",args);
                        console.log("update obj.message",obj.message)
                        WBS.chainCodeInvoke(url, obj.message ,req.session.user.blockChainId, args, function(o){
                            console.log("update chain Invoke---->>>>",o)
                            if(o.response.result && o.response.result != undefined){
                                AM.updateRuleMapping(newData);
                                AM.updateRule(req.body, function(e,o){
                                    if(e){
                                       console.log("e",e) ;
                                    }else{
                                        res.redirect('/rules');        
                                    }
                                })
                            }
                        });
                    });
                });
            }  
        })  
    });*/
    
    app.get('/allRules', function(req,res){
        console.log("Came in to All Rule");
         //AM.delAllRules(function(e,o){
           AM.getAllRules(function(o){
                 res.status(200).send(o);
            });       
         //});
    });


    app.get('/allRulesMappings', function(req,res){
        console.log("Came in to All Rule");
         //AM.delAllRules(function(e,o){
           AM.getAllRulesMappings(function(o){
                 res.status(200).send(o);
            });       
         //});
    });
    
    /*----------- Rule Related Service End --------------*/
    
    

    
    
    /*----------- Users Related Service End --------------*/

    
    /*Dash Board related info*/
    app.get('/dashBoard', function(req, res) {
		console.log("Came in to the dashBoard Page");
		if (req.session.user == null){
			res.redirect('/');
		}else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            var usersCount 
            var devicesCount
            var resourcesCount
            var rulesCount
            var networkNodes =[];

            AM.getAllRecords(function(users){
                usersCount = users.length;
                AM.getAllDevices(function(devices){
                    devicesCount = devices.length;
                    AM.getAllResources(function(resources){
                        resourcesCount = resources.length;
                        AM.getAllRules(function(rules){
                            rulesCount = rules.length;
                            var networkUrl = "https://"+node+":"+port+"/network/peers";
                            WBS.getNetWorkInfo(networkUrl,function(output){
                                for (var i=0; i<output.peers.length;i++){
                                    var peer = output.peers[i].address.toString().split(":");
                                    networkNodes.push(peer[0]);    
                                }
                                var blockChainUrl = "https://"+node+":"+port+"/chain";
                                WBS.getBlockChainInfo(blockChainUrl,function(o){
                                //res.render('blockchain', {  title: 'BlockChain Info Page', status: o.status, resp : o.response, url:o.url});        				
								var Height = o.height;
								var Current= o.currentBlockHash.toString();
								var Previous=o.previousBlockHash.toString();
                                    res.render('dashBoard', {
                                        title : 'DashBoard Info Page',
                                        networkNodes: networkNodes,
                                        bcStatus: o.status, 
                                        //bcResp : o.response, 
                                        bcHeight : Height, 
                                        bcCurrent : Current,
                                        bcPrevious : Previous, 
                                        bcUrl : blockChainUrl.toString(),
                                        usersCount : usersCount,
                                        devicesCount : devicesCount,
                                        resourcesCount : resourcesCount,
                                        rulesCount : rulesCount,
                                        userType: req.session.user.role
                                    });
                                })               
                            })  
                        });
                    });
                });
            });
        }
	});
    
   app.get('/certs/:blockChainId', function(req, res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            var url = "https://"+node+":"+port+"/registrar/";
            WBS.gettCert(url,req.params.blockChainId, function(tCert){
                WBS.geteCert(url,req.params.blockChainId, function(eCert){
                    res.render('certs', {  
                        title: 'Certs Info Page', 
                        turl:tCert.url, 
                        topRes:tCert.response, 
                        tstatus:tCert.status,  
                        eurl:eCert.url, 
                        eopRes:eCert.response, 
                        estatus:eCert.status,
                        userType: req.session.user.role
                    });    
                });
            });
        }
    });

// logged-in user homepage //
	
	app.get('/profile', function(req, res) {
		console.log("Came in to the home GET");
		if (req.session.user == null){
			res.redirect('/');
		}else{
            res.render('home', {
				title : 'Control Panel',
				roles : roles,
				udata : req.session.user,
                userType: req.session.user.role
			});
		}
	});

	
    app.get('/credentials', function(req, res) {
        console.log("Came in to the home credentials");
        if (req.session.user == null){
            res.redirect('/');
        }else{
            res.render('credentials', {
                title : 'Credentials Info Page',
                password : req.session.user.password,
                userType: req.session.user.role
            });
        }
    });

   
	
	app.post('/profile', function(req, res){
		console.log("Came in to the profile POST");
		if (req.session.user == null){
			res.redirect('/');
		}else{
            AM.updateAccount(req.body, function(e,o){
				if (o && o != null){
                    req.session.user = o;
					if (req.cookies.user != undefined ){
						res.cookie('user', o.username, { maxAge: 900000 });
					}
					res.render('home', {
                        title : 'Account Settings',
                        nodes : PL,
                        udata : req.session.user,
                        userType: req.session.user.role
                    });
				}	else{
				    console.log("Error");
					res.status(400).send('error-updating-account');
				}
			});
		}
	});

	app.post('/logout', function(req, res){
		res.redirect('/');
	});
    
    
    app.get('/logout', function(req, res){		
		res.clearCookie('user');
		req.session.user = null;
        res.redirect('/');
	});
	

    app.get('/loginDetails', function(req, res){
        var url = "https://"+node+":"+port+"/registrar";
        WBS.userValidate(url, req.session.user.blockChainId, req.session.user.enrollSecret, function(reg){
            res.render('register', {  
                title: 'Login Details Page',
                iurl:url, ipReq:JSON.stringify(reg.request), 
                opRes:JSON.stringify(reg.response), 
                status:reg.status,
                userType: req.session.user.role
            });
        });
    });

// creating new accounts //
	
	app.get('/signup', function(req, res) {
        res.render('signup', {  title: 'Signup', roles:roles, userType: req.session.user.role});    
	});
	
	app.post('/signup', function(req, res){
	    console.log("Came in to the signup");
	    var loginId;
            var password;
            AM.getBCAccount(function(BCAccount){
            loginId = BCAccount.enrollId;
            password = BCAccount.enrollSecret;
            AM.addNewAccount({
		    node	: req.body['peer'],
                    name 	: req.body['name'],
	            email 	: req.body['email'],
	            country : req.body['country'],
                    enrollId : BCAccount.enrollId,
                    enrollSecret :BCAccount.enrollSecret
		        }, function(e){
                if (e){
                    res.status(400).send(e);
                }	else{
                	var json = {}
                	json.status = 'ok';
                	json.loginId = loginId;
                    json.password = password;
                    res.status(200).send(json);
                }
		    });
        });
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o){
			if (o){
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}	else{
				res.status(400).send('email-not-found');
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});

	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
    
    
    /*Used method to redirect the account settings*/
    app.get('/update', function(req, res){
        res.redirect('/profile');
    });
	
    
    app.get('/close', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			res.render('update');	
		}
	});

	
    app.get('/network', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
            var o =[];
			var url = "https://"+node+":"+port+"/network/peers";
            WBS.getNetWorkInfo(url,function(output){
				for (var i=0; i<output.peers.length;i++){
					var peer = output.peers[i].address.toString().split(":");
                    if(node != peer[0]){
                        o.push(peer[0]);    
                    }
				}				
                res.render('network', {  title: 'NetWork Info Page', address : o, assignedNode : node });	    
            })			
		}
	});
    
    
    app.get('/blockchain', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+node+":"+port+"/chain";
			WBS.getBlockChainInfo(url,function(o){
				res.render('blockchain', {  title: 'BlockChain Info Page', status: o.status, resp : o.response, url:o.url});	    
			})
		}
	});
    
    
    app.get('/chaincode', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
            var o =[];
			var url = "https://"+node+":"+port+"/network/peers";
            WBS.getNetWorkInfo(url,function(output){
				for (var i=0; i<output.peers.length;i++){
					var peer = output.peers[i].address.toString().split(":");
					o.push(peer[0]);
				}
                res.render('chaincode', {  title: 'Chaincode Info Page', address : o });	    
            });
		}
	});


    app.get('/chainDeploy/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			//var url = "https://"+req.params.name+"-api.blockchain.ibm.com:"+port+"/chaincode";
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			console.log("URL:",url);
			console.log("EnrollID:",req.session.user.enrollId);
			WBS.chainCodeDeploy(url, req.session.user.enrollId, function(o){				
				var obj = {};
				obj.name = req.params.name;
				if(o.response.result && o.response.result != undefined){
					obj.message = o.response.result.message;
					AM.insertOrUpdateCCMessage(obj);
				}
                res.render('chainCodeDeploy', {title: "Chaincode Deployment", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
			});
		}
	});
    
	
    app.get('/chainInvoke/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){		
                if(obj && obj != null){
                    WBS.chainCodeInvoke(url, obj.message ,req.session.user.enrollId, function(o){
                        if(o.response.result && o.response.result != undefined){
                            obj.message = o.response.result.message;
                            AM.insertOrUpdateCCMessage(obj);
                        }
                        res.render('chainCodeInvoke', {title: "Chaincode Invoke", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});					
				    });
                }else{
                    res.render('messageError', {title: "Message Error Page"});
                }
			})			
		}
	});

	
    app.get('/chainQuery/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){	
                if(obj && obj != null){
                    WBS.chainCodeQuery(url, obj.message ,req.session.user.enrollId, function(o){
                        if(o.response.result && o.response.result != undefined){
                            obj.message = o.response.result.message;
                            AM.insertOrUpdateCCMessage(obj);
                        }
                        res.render('chainCodeQuery', {title: "Chaincode Query page", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
				    });
                }else{
                    res.render('messageError', {title: "Message Error Page"});
                }
				
			})			
		}
	});


	
    app.get('/block/:code', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+node+":"+port+"/chain/blocks/"+req.params.code;
			WBS.getBlocksInfo(url, function(o){
				res.status(200).send(JSON.stringify(o));
			});
		}
	});


    
    app.get('/createMarble/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){		
				WBS.createMarble(url, obj.message ,req.session.user.enrollId, function(o){
       			 	res.render('codeMarble', {title: "Chaincode Create Marble", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
    			});
			})

			
		}
	});

	app.get('/tradeAwayMarble/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){		
				WBS.tradeAwayMarble(url, obj.message ,req.session.user.enrollId, function(o){
       			 	res.render('tradeAwayMarble', {title: "Chaincode Tradeaway Marble", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
    			});
			})
		}
	});


	app.get('/tradeAwayMarble/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){		
				WBS.tradeAwayMarble(url, obj.message ,req.session.user.enrollId, function(o){
       			 	res.render('tradeAwayMarble', {title: "Chaincode Tradeaway Marble", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
    			});
			})
		}
	});

	app.get('/deleteMarble/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){		
				WBS.deleteMarble(url, obj.message ,req.session.user.enrollId, function(o){
       			 	res.render('deleteMarble', {title: "Chaincode Delete Marble", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
    			});
			})
		}
	});

	app.get('/queryMarble/:name', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
			var url = "https://"+req.params.name+":"+port+"/chaincode";
			AM.getCCMessage(req.params.name, function(obj){		
				WBS.chainCodeQuery(url, obj.message ,req.session.user.enrollId, function(o){
       			 	res.render('queryMarble', {title: "Chaincode QueryMarble", name : req.params.name, url: url, ipReq : JSON.stringify(o.request), opRes: JSON.stringify(o.response), status: o.status});
    			});
			})
		}
	});	

	app.get('/validation', function(req, res) {
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
		  res.render('validate', {  title: 'User Verification Page',udata : req.session.user, userType: req.session.user.role});
        }
    });

    app.get('/validation/:code', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}else{
            var url = "https://"+node+":"+port+"/registrar";
			AM.getAccountByBlockChainId(req.params.code, function(ou){
				if(!ou)
				{					
					WBS.userValidate(url, req.params.code, 'secret',function(o){
					o.response = "User "+req.params.code+" not found on Blockchain network";
					res.status(200).send(JSON.stringify(o));
					});
				}
				else{
					if(req.session.user.blockChainId == req.params.code)
					{
						WBS.userValidate(url, req.params.code, ou.enrollSecret,function(o){
						o.response = 'Identity or token matched';
						res.status(200).send(JSON.stringify(o))});						
					}
					else
					{							
						WBS.userValidate(url, req.params.code, 'secret',function(o){
						if(o.result == "OK")
						{
							o.response = 'Identity or token does not match';
							o.status = "You are not "+req.params.code;
						}
						else{
							o.response = 'Identity or token does not match';
							o.status = 'You are not '+req.params.code;
						}
						res.status(200).send(JSON.stringify(o))});
					}
				}
					
			});
		}
	});
	
	app.get('/getBCId/:name', function(req,res){
        var name = req.params.name;
        AM.getDeviceByDeviceHostName(name, function(deviceObj){
           if(deviceObj){
               res.send(deviceObj.blockChainId);
               return;
           }else{
               AM.getAccountByUserName(name, function(userObj){
                   res.send(userObj.blockChainId);
                   return;
               });
           }
        });
    });
	
	/*app.get('/addRule', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            var mapIds = []
            var resourceIps = []
            AM.getAllRecords(function(users){
                users.forEach(function(user) {
                    mapIds.push(user.blockChainId);
                });
                AM.getAllDevices(function(devices){
                    devices.forEach(function(device) {
                        mapIds.push(device.deviceId);
                    });
                    AM.getAllResources(function(resources){
                        resources.forEach(function(resource) {
                            resourceIps.push(resource.resourceIp);
                        });
                        AM.getAllRules(function(rules){
                            res.render('createRule', {  
                                title: 'Create Rule Page', 
                                ruleId : rules.length +1,
                                mapIds : mapIds, 
                                resourceIps:resourceIps, 
                                accessList : accessList,
                                userType: req.session.user.role
                            });
                        });
                    });
                });
            });
        }
    });*/
	
	app.get('/addRule', function(req,res){
        if (req.session.user == null){
            res.redirect('/');
        }else if(req.session.user.role == 'user'){
            res.redirect('/resources');
        }else{
            var mapIds = [];
            var resourceIps = [];
            AM.getAllRecords(function(users){
                users.forEach(function(user) {
                    mapIds.push(user.username);
                });
                AM.getAllDevices(function(devices){
                    devices.forEach(function(device) {
                        mapIds.push(device.deviceHostName);
                    });
                    AM.getAllResources(function(resources){
                        resources.forEach(function(resource) {
                            resourceIps.push(resource.resourceIp);
                        });
						AM.getAllRules(function(rules){
							res.render('createRule', {  
								title: 'Create Rule Page', 
								ruleId : rules.length +1,
								mapIds : mapIds, 
								resourceIps:resourceIps, 
								accessList : accessList,
								userType: req.session.user.role
							});
						});
                    });
                });
            });
        }
    });
    
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });   
    
};
