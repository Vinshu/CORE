var WB = require('./webservice_call')


// WB.userLoginCheck("user_type1_0ce8948f87", "7cb751d3a1", function(res){
//     //console.log("res---->>>", res);
// });


// WB.getNetWorkInfo(function(res){
//     console.log("res---->>>", "https://"+res+"-api.blockchain.ibm.com:443/chaincode");
//     WB.chainCodeDeploy("https://"+res+"-api.blockchain.ibm.com:443/chaincode", "user_type1_0ce8948f87", function(res){
//         console.log("chain code response--->>>", res) ;
//     });
// });



// WB.getBlocksInfo("42",function(res){
// 	console.log("res",res);
// });

/*
WB.getNetWorkInfo(function(res){
     console.log("res---->>>", "https://"+res+"-api.blockchain.ibm.com:443/chaincode");
     var message = "703e7021f688b76ac848e6099f9a8d0002ff306d11648a5c6cc0c64922f6ea454847281f62aa5eb0e258901bb389c794681a1ca8553770d2406b239f2c013347";
     WB.createMarble("https://"+res+"-api.blockchain.ibm.com:443/chaincode", message, "user_type1_0ce8948f87", function(res){
         console.log("chain code response--->>>", res) ;
     });
});


WB.getNetWorkInfo(function(res){
     console.log("trade away res---->>>", "https://"+res+"-api.blockchain.ibm.com:443/chaincode");
     var message = "703e7021f688b76ac848e6099f9a8d0002ff306d11648a5c6cc0c64922f6ea454847281f62aa5eb0e258901bb389c794681a1ca8553770d2406b239f2c013347";
     WB.tradeAwayMarble("https://"+res+"-api.blockchain.ibm.com:443/chaincode", message, "user_type1_0ce8948f87", function(res){
         console.log("chain code response--->>>", res) ;
     });
});


WB.getNetWorkInfo(function(res){
     console.log("trade away res---->>>", "https://"+res+"-api.blockchain.ibm.com:443/chaincode");
     var message = "703e7021f688b76ac848e6099f9a8d0002ff306d11648a5c6cc0c64922f6ea454847281f62aa5eb0e258901bb389c794681a1ca8553770d2406b239f2c013347";
     WB.deleteMarble("https://"+res+"-api.blockchain.ibm.com:443/chaincode", message, "user_type1_0ce8948f87", function(res){
         console.log("chain code response--->>>", res) ;
     });
});
*/


WB.gettCert("user_type1_0ce8948f87",function(res){
	console.log("t cert--->>",res);
});


WB.geteCert("user_type1_0ce8948f87",function(res){
	console.log("g cert--->>>>",res);
});
