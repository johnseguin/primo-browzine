var https = require('https');
 
exports.JournalLookup = function (event, context, callback) {
    // parse URL query from Primo
    var query = require('querystring').parse(event.querystring);
    // initialize options values
    var ISSN = (query.ISSN === undefined ? 'noISSN' : query.ISSN);
    var cb = (query.callback === undefined ? '' : query.callback);
    
    // API key from Browzine
    var stoKey = process.env['stoKey'];
    // Customer ID from Browzine
    var stoID = process.env['stoID'];
    var options = {
        host :  'api.thirdiron.com',
        port : 443,
        path : '/public/v1/libraries/' + stoID + '/search?issns=' + ISSN + '&access_token=' + stoKey,
        method : 'GET'
    };
    
    // make the https get call to Browzine and pass the callback data to Primo
    var getReq = https.request(options, function(res) {
        var data = '';
        res.on('data', function(chunk) {
            data += chunk.toString();
        });
        
        res.on('end', function(){
            if (res.statusCode == 200) {
               callback(null,  
                cb + '(' + data + ')'
                );
            } else {
               // Browzine's API returns a 404 if data isn't found, so send an empty response if call is unsuccessful
               callback(null,
                cb + '({"data":[]})'
               ); 
            }
        });
    });   
 
    // end the request
    getReq.end();
    getReq.on('error', function(err){
        console.log("Error: ", err);
    }); 
};
