/*
  Purpose: This Java Script runs at Node commandline.
 */
var {exec} = require('child_process');
var SerialPort = require('serialport');
var wrport = new SerialPort('/dev/ttyO1');
//var rdport = new SerialPort('/dev/ttyO1');
var rdport=wrport;
function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
        var hex = Number(str.charCodeAt(i)).toString(16);
        arr.push(hex);
    }
    return arr.join('');
}
function hex2a(hexx) {
//          console.log('In hex2a',hexx);
//    var hex = hexx.toString();//force conversion
//          console.log('Hello:',hex);
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

//opening port for writing
/* Looks like no need to open port
wrport.open(function(err) {
    console.log('Error: Opening Write Port P9.24', err.message);
})
*/
var result;
var prevstr;
var currstr;
var firstTimer;
//this function gets called when data is available
rdport.on('data', function (data) {
    console.log('Data:', data);
    console.log('ASCII:', data.toString());
    var testcasename=data.toString();
    currstr=data.toString();

    if(currstr===prevstr){
        console.log("currstr and prevstr are same")
    }
    else{
        prevstr=currstr;
    }

//write switch cases here
    switch(testcasename){
        case "HDM01":
        {
            HDM01();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "PMIC":
        {
            PMIC();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "RTCS":
        {
            RTCS();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "GPIO":{
            GPIO();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "UART":{
            UART();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "HDMI":{
            HDMI();
            break;
        }
        case "USBT":{
            USBT();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "WIFI":{
            WIFI();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "CELL":
        {
            CELL();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "CCHDM01":
        {
            CCHDM01();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
        case "CCPMIC":{
            CCPMIC();
            firstTimer=setTimeout(function () {
                console.log("firsttimer had set");
            },2000);
            break;
        }
    }
    wrport.write(result, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('message written\n');
    });
    //var adata = hex2a(data);
    //console.log('H2A:',adata);
});


function HDM01(){
    result="success";
    clearTimeout(firstTimer);
}
function PMIC(){
    result="failed";
    clearTimeout(firstTimer);
}
function RTCS(){
    result="success";
    clearTimeout(firstTimer);
}
function GPIO(){
    result="success";
    clearTimeout(firstTimer);
}
function UART(){
    result="success";
    clearTimeout(firstTimer);
}
function HDMI(){
    result="success";
    clearTimeout(firstTimer);
}
function USBT(){
    result="success";
    clearTimeout(firstTimer);
}
function WIFI(){
    //result="success";
    exec('connmanctl services|grep Vandana.|cut --complement -d " " -f 1-15', function(err, stdout, stderr) {
        if (err) {
            console.error("exec error: "+err);
            return;
        }
        console.log(stdout);
        var connectcommand='connmanctl connect '+stdout;
        var disconnectcommand='connmanctl disconnect '+stdout;
	    console.log(connectcommand);
	    console.log(disconnectcommand);
        exec(connectcommand,function (err,stdout,stderr) {
            if (err) {
                console.error("exec error: "+err);
                //return;
                result="failed";
            }
            result="success";
            console.log("connected "+stdout);
        });
        exec(disconnectcommand,function (err,stdout,stderr) {
            if (err) {
                console.error("exec error: "+err);
                //return;
                result="failed";
            }
            result="success";
            console.log("disconnected "+stdout);
        });
});
    clearTimeout(firstTimer);
}
function CELL(){
    result="success";
    clearTimeout(firstTimer);
}
function CCHDM01(){
    result="success";
    clearTimeout(firstTimer);
}
function CCPMIC(){
    result="success";
    clearTimeout(firstTimer);
}


function pmic_voltage_test(){
    return true;
}
function gpio_toggle_test(){
    return true;
}
function hdmi_test(){
    return true;
}
function uart_test(){
    return true;
}
function wifi_test(){
    return true;
}
function cellular_test(){
    return true;
}
function rtc_set_test(){
    return true;
}
