var express = require('express');
var dateFormat=require('dateformat');
var router = express.Router();
var fs=require('fs');
//var TestResultDetails=require('../TestResultDetails..json');
/* GET home page. */
var hiveMappingDataSummary =
    {   TEST_RUN_ID: 'F01',
        DUT_NUMBER: 'F02',
        DUT_HW_VER: 'F03',
        DUT_SW_VER: 'F04',
        DUT_NM: 'F05',
        FIXTURE_TYPE_ID: 'F06',
        SN: 'F07',
        HW_VER: 'F08',
        SW_VER: 'F09',
        MFGDT: 'F10',
        TEST_START_TS: 'F11',
        TEST_END_TS: 'F12',
        TEST_RESULT: 'F13',
        TOTAL_CNT: 'F14',
        TESTED_CNT: 'F15',
        TS_SUCCESS_CNT: 'F16',
        TS_FAIL_CNT: 'F17',
        MANUFACTURER: 'F18',
        PCB_NM: 'F19' };

var hiveMappingDataDetail =
    { TEST_RUN_ID: 'F01',
        TCID: 'F02',
        LAST_STATUS: 'F03',
        TRY_CNT: 'F04',
        TD_FAIL_CNT: 'F05',
        TD_SUCCESS_CNT: 'F06',
        DESC: 'F07' };

router.post('/', function(req, res, next)
{
    var resultsFileName;
    var curDate = new Date();
    var curTimeStamp = curDate.getTime();
    var resultStr = '';
    var hiveresultStr = '';
    var testResultsToHive;
    resultsFileName="./Results/TestResultDetails"+curTimeStamp+".json";
    var TestResultDetails = req.body.inputJsonStr;
    testResultsToHive = TestResultDetails;
    resultStr=TestResultDetails;
    hiveresultStr=TestResultDetails;
    // var TestResultDetails=JSON.parse(response);
    // res.send(TestResultDetails);
    console.log(TestResultDetails);
    //res.render('index', { title: 'Express' });

    for (var key in hiveMappingDataSummary)
    {
        //console.log(key + ' : ' + data[key]);
        console.log(key + ' --> ' + hiveMappingDataSummary[key]);
        testResultsToHive = testResultsToHive.replace(RegExp(key,'g'),hiveMappingDataSummary[key]);
    }

    for (var key in hiveMappingDataDetail)
    {
        //console.log(key + ' : ' + data[key]);
        console.log(key + ' --> ' + hiveMappingDataDetail[key]);
        testResultsToHive = testResultsToHive.replace(RegExp(key,'g'),hiveMappingDataDetail[key]);
    }

    console.log("DataToHive : " + testResultsToHive);
    var testResultsToHiveJsonObj = JSON.parse(testResultsToHive);
    console.log(testResultsToHiveJsonObj.F10);
    console.log(testResultsToHiveJsonObj.F11);
    //var startDateTime = new Date(testResultsToHiveJsonObj.F11);
    testResultsToHiveJsonObj.F11 = dateFormat(new Date(testResultsToHiveJsonObj.F11),'HHMMss,ddmmyy');
    console.log(testResultsToHiveJsonObj.F11);
    testResultsToHiveJsonObj.F12 = dateFormat(new Date(testResultsToHiveJsonObj.F12),'HHMMss,ddmmyy');
    console.log(testResultsToHiveJsonObj.F12);
    console.log(testResultsToHiveJsonObj);
    var request = require('request');
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
        body: testResultsToHiveJsonObj,
        json: true
    };

    //ibotapp.azure-api.net
    //'postman-token': '3b692d3a-8c80-3cd5-96cc-c5d91b45b281',
    //'cache-control': 'no-cache',
    request(options, function (error, response, body) {
        //if (error) throw new Error(error);
        if(error){
            console.log("Error occured while uploading to Hive")
        }
        else if(response.statusCode === 200){
            console.log(body);
        }else{
            console.log(response.statusCode);
           console.log("Some issue: ", response.statusCode);
        }
    });

    fs.writeFile(resultsFileName, TestResultDetails, function (err) {
        if (err) throw err;
        var response={"status":"Uploaded Succesfully"};
        console.log(response);
        res.send(response);
    });

});
module.exports = router;