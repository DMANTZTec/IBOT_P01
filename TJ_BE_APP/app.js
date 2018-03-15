var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs=require('fs');
var cors=require('cors');
var index = require('./routes/index');
var users = require('./routes/users');
var RunTestCase_BE=require('./routes/RunTestCase_BE');
var RunTestCase_BE_stub=require('./routes/RunTestCase_BE_stub');
var LoadTestJigData_BE=require('./routes/LoadTestJigData_BE');
var ViewResults_BE=require('./routes/ViewResults_BE');
var testResultsFileNM = './hive/testResults.json';
var testResults_FailedFileNM='./hive/testResults_Failed';
var testResults_P_FailedFileNM;
var testResults_P_FileNM;

var app = express();
var hiveResponse;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//process.argv[2]='./hive/testResults_P.json';
for (var j = 0; j < process.argv.length; j++) {
    console.log(j + ' -> ' + (process.argv[j]));
}
function checkForTestResultsFile() {
    if(fs.existsSync(testResults_FailedFileNM)){
        var justfilename=testResults_FailedFileNM.slice(0,-5);
        testResults_P_FailedFileNM=justfilename+'_P.json';
        fs.renameSync(testResults_FailedFileNM,testResults_P_FailedFileNM);
        var TestResultsData = JSON.parse(fs.readFileSync(testResults_P_FailedFileNM));
        console.log(TestResultsData);
        savetohive(TestResultsData);
    }
    if(fs.existsSync(testResultsFileNM))
    {
        var justfilename=testResultsFileNM.slice(0,-5);
        testResults_P_FileNM=justfilename+'_P.json';
        console.log(justfilename);
        fs.renameSync(testResultsFileNM,testResults_P_FileNM);
        var TestResultsData = JSON.parse(fs.readFileSync(testResults_P_FileNM));
        console.log(TestResultsData);
        savetohive(TestResultsData);
    }
    else console.log(testResultsFileNM+" not exists that means everything updated");
}
function savetohive(TestResultsData){
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
        body: TestResultsData,
        json: true
    };
    //ibotapp.azure-api.net
    //'postman-token': '3b692d3a-8c80-3cd5-96cc-c5d91b45b281',
    //'cache-control': 'no-cache',
    request(options, function (error, response, body) {
        //if (error) throw new Error(error);
        if(error){
            console.log("Error occured while uploading to Hive");
            fs.writeFile(testResults_P_FailedFileNM, JSON.stringify(TestResultsData), function (err) {
                if (err) throw err;
                console.log("added failed testcases to failure file");
            });
        }
        else if(response.statusCode === 200){
            console.log(body);
            //fs.unlinkSync(testResults_P_FileNM);
        }
        else if(response.statusCode===500){
            console.log(response.statusCode);
            console.log("Some issue: ", response.statusCode);
            fs.writeFile(testResults_P_FailedFileNM, JSON.stringify(TestResultsData), function (err) {
                if (err) throw err;
                console.log("added failed testcases to failure file");
            });
        }
        else if(response.statusCode===404){
            console.log(response.statusCode);
            console.log("Some issue: ", response.statusCode);
            fs.writeFile(testResults_P_FailedFileNM, JSON.stringify(TestResultsData), function (err) {
                if (err) throw err;
                console.log("added failed testcases to failure file");
            });
        }
    });
}
checkForTestResultsFile();
setInterval(checkForTestResultsFile, 5000);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'config')));

app.use('/', index);
app.use('/users', users);
app.use('/RunTestCase_BE',RunTestCase_BE);
app.use('/RunTestCase_BE_stub',RunTestCase_BE_stub);
app.use('/LoadTestJigData_BE',LoadTestJigData_BE);
app.use('/ViewResults_BE',ViewResults_BE);

/*var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};
app.set(function() {
    app.use(allowCrossDomain);
    //some other code
});*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(cors());
app.options('*', cors());
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
