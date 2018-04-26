var express = require('express');
var router = express.Router();
var fs=require('fs');
var readline = require('readline');
//var Testjiglist=require('../config/TestJigList.json');
//var testjigListConfigFileNm=process.argv[2];

//var TestJigData=require('../TestJigData.json');
//var TestCaseData=require('../TestCaseData.json');

var TestJigType;
var TestJigList;
var Manufacturer;
//var testCaseConfigFileNm='./TestCaseData.json';
var testJigConfigFileNm = './config/TestJigData.json';
var manufacturerfilenm = './config/manufacturer.json';

var testjiglistConfigFile='./config/TestJigList.json';
//var testjiglist=JSON.parse(fs.readFileSync(testjiglistConfigFile));
//var testjiglist='./config/TestJigList.json';
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
    console.log(testjiglistConfigFile);

    if(fs.existsSync(testjiglistConfigFile)){
        TestJigList=JSON.parse(fs.readFileSync(testjiglistConfigFile));
        console.log(TestJigList);
    }
    if(fs.existsSync(manufacturerfilenm)){
        Manufacturer=JSON.parse(fs.readFileSync(manufacturerfilenm));
        console.log(Manufacturer);
    }
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
                TestCaseData: TestCaseData,
                Manufacturer:Manufacturer
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
    //TestJigList= jsonrequest.TestJigList;
    console.log(TestJigType);
    //console.log(TestJigList);
    for (var i = 0; i < TestJigList.TestJigList.length; i++) {
        console.log('Looping through' + i);
        if (TestJigType == TestJigList.TestJigList[i].DUT_ID) {
            newTestJigConfigFileNm = TestJigList.TestJigList[i].DESC_FILE;
            console.log(newTestJigConfigFileNm);
            console.log(TestJigList);
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
    var sleepTimeOut = setTimeout(function () {
        var response={"success":"success"};
        console.log(response);
        res.send(response);
    },1500);

    //var response={"success":"success",TestJigData:TestJigData};

});
router.all('/ReloadProductType_BE', function(req, res, next) {
    console.log('Enter: Route /ReloadProductType_BE');
    var request = req.body.inputJsonStr;
    console.log(request);
    var jsonrequest = JSON.parse(request);
    console.log(jsonrequest);
    var ProductType = jsonrequest.ProductType;
    var response;
    console.log(ProductType);
    var newProductTestJigListFileNm="./config/"+ProductType+"_TestJigList.json";
    console.log(newProductTestJigListFileNm);
    if(fs.existsSync(newProductTestJigListFileNm)){
        fs.createReadStream(newProductTestJigListFileNm).pipe(fs.createWriteStream(testjiglistConfigFile));

    }
    else {
        console.log("New Product TestJig List File Not Found");
        response={"result":"fail"};
    }
    var sleepTimeOut = setTimeout(function () {
           var testjiglist=JSON.parse(fs.readFileSync(testjiglistConfigFile));
           console.log(testjiglist);
           var TestJigDataConfigFileNM=testjiglist.TestJigList[0].DESC_FILE;
           console.log(TestJigDataConfigFileNM);
           var newCfgFile = './config/' + TestJigDataConfigFileNM;
           //var currenttestjigdata=JSON.parse(fs.readFileSync(newCfgFile));
           console.log(newCfgFile);
           fs.createReadStream(newCfgFile).pipe(fs.createWriteStream(testJigConfigFileNm));
           var response={"result":"success"};
           console.log(response);
           res.send(response);
       },2000);

});
router.all('/Manufacturer_BE', function(req, res, next) {
    var request = req.body.inputJsonStr;
    //var manufacturer=JSON.parse(request);
    var reponse={"status":"success"};
    fs.writeFile(manufacturerfilenm, request, function (err) {
        if (err) throw err;
        else
            console.log("manufacturer saved into file");
    });
    res.send(reponse);
});
module.exports = router;
