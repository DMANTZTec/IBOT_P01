var express = require('express');
var router = express.Router();
var fs=require('fs');

var readline = require('readline');
var TestJigList=require('../config/TestJigList.json');
//var TestJigData=require('../TestJigData.json');
//var TestCaseData=require('../TestCaseData.json');
var TestJigType;
//var testCaseConfigFileNm='./TestCaseData.json';
var testJigConfigFileNm = './config/TestJigData.json';
console.log("Before createInterface");
var rl=readline.createInterface({
		               input:process.stdin,
		               output:process.stdout,
		               terminal:false});
console.log("Before rl.on");
	    rl.on('line',function(line){
                     console.log("Got Line");
		     console.log(line);
});
router.all('/', function(req, res, next)
{
    /*
    fs.stat('TestJigData.json', function(err, stat) {
        if(err == null) {
    */
    console.log(testJigConfigFileNm);
    //console.log(testCaseConfigFileNm);
    if (fs.existsSync(testJigConfigFileNm))
    {
        var TestJigData = JSON.parse(fs.readFileSync(testJigConfigFileNm));
        var TestCaseDataFileNm=TestJigData.TestCaseFile;
        console.log(TestCaseDataFileNm);
        if(fs.existsSync(TestCaseDataFileNm))
        {
            var TestCaseData=JSON.parse(fs.readFileSync(TestCaseDataFileNm));
            console.log(TestCaseData);
        }
        console.log("Test jig exists load");
        console.log(TestJigData);
        var response =
            {
                status: "success",
                TestJigList: TestJigList,
                TestJigData: TestJigData,
                TestCaseData: TestCaseData
            };
        res.send(response);
    }
    else
        {
        console.log( testJigConfigFileNm + "does not exist");
        response = {"status": "error", "error": "test jig file not exists"};
        res.send(response);
    }
});
//This route is used when user selects a different Test Jig type from Settings in UI
router.all('/Reload_BE', function(req, res, next) {
    console.log('Enter: Route /Reload_BE');
    //var testJigConfigFileNm = 'TestJigData.json';
    var newTestJigConfigFileNm;
    var request = req.body.inputJsonStr;
    var jsonrequest = JSON.parse(request);
    TestJigType = jsonrequest.TestJigType;
    console.log(TestJigType);
    for (var i = 0; i < TestJigList.TestJigList.length; i++) {
        console.log('Looping through' + i);
        if (TestJigType == TestJigList.TestJigList[i].DUT_ID) {
            newTestJigConfigFileNm = TestJigList.TestJigList[i].DESC_FILE;
            console.log(newTestJigConfigFileNm);
            break;
        }
    }
    //Take Backup of Current TestJigData file
    if (fs.existsSync(testJigConfigFileNm)) {
        console.log("TestJigData.json exists");
        fs.renameSync(testJigConfigFileNm, testJigConfigFileNm + '.bkup');
    }
    else {
        console.log('There is no current TestJigData.json file');
    }

    var newCfgFile = './config/' + newTestJigConfigFileNm;
    if (fs.existsSync(newCfgFile)) {
        fs.createReadStream(newCfgFile).pipe(fs.createWriteStream(testJigConfigFileNm));
    } else {
        console.log("New Config File Does Not Exist");
    }
});
module.exports = router;