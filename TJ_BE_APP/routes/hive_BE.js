var express = require('express');
var router = express.Router();


/* GET home page. */
router.all('/', function(req, res, next) {
    var request = require('request');
    function Success()
    {
        var response={"status":"success"};
        res.send(response);
    }
    function Failed()
    {
        var response={"status":"Failed"};
        res.send(response);
    }
    var a={'a':"a"};
    //'https://ibotapp.azure-api.net/deviceconnectinfo/ConnectInfo4',
    var options = {
        method: 'POST',
                url: 'https://ibotapp.azure-api.net/ProjectPCBsTestResult/shivaraya9;SRP0000001',
	    headers:
            {
                'content-type': 'application/json',
                'ocp-apim-trace': 'true',
                'ocp-apim-subscription-key': '2bb0cf6fe5c44dedac555cc8432b4c14'
            },
        body: a,
        json: true
    };
    request(options, function (error, response, body) {
        //if (error) throw new Error(error);
        if (error) {
            console.log("Error occured while uploading to Hive");
            Failed();
        }
        else if (response.statusCode === 200) {
            console.log(body);
            Success();
        }
        else if (response.statusCode === 500) {
            console.log(response.statusCode);
            console.log("Some issue: ", response.statusCode);
            Failed();
        }
        else if (response.statusCode === 404) {
            console.log(response.statusCode);
            console.log("Some issue: ", response.statusCode);
            Failed();
        }
    });
});

module.exports = router;
