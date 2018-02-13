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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
