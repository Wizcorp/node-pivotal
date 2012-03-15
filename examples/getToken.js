/**
    To run:

    node getToken.js username password
*/
var pivotal  = require("../index.js"),
    colors   = require("colors"),
    username = process.argv[2],
    password = process.argv[3];

pivotal.getToken(username, password, function(err, token){

    if(err){
        console.error("Could not retrieve token".red.bold);
    }

    console.log("Token: ".grey, token.guid.green.bold);
});
