/*
  Purpose: This Java Script runs at Node commandline.
 */

var SerialPort = require('serialport');
var wrport = new SerialPort('/dev/ttyO1');
var rdport = new SerialPort('/dev/ttyO1');

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
//
//

//opening port for writing
/* Looks like no need to open port
wrport.open(function(err) {
    console.log('Error: Opening Write Port P9.24', err.message);
})
*/

//this function gets called when data is available
rdport.on('data', function (data) {
    console.log('Data:', data);
    console.log('ASCII:', data.toString());

    wrport.write('on Got Message', function(err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('message written\n');
    });
    //var adata = hex2a(data);
    //console.log('H2A:',adata);
});

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



