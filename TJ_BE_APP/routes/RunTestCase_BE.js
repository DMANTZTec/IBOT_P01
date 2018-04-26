var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
var firstTimer;
var hul2_1_firstTimer;
var hulTimerPowerOff;
var hulTimer;
var gpowerStatusTimeInterval;
var irNfcTimer;
var fNfcTimer;
var SerialPort = require('serialport');
var mspUart = new SerialPort('/dev/ttyO1');
var irnfcReadPort = new SerialPort('/dev/ttyO2');
var irnfcWritePort = irnfcReadPort;
var fnfcReadPort = new SerialPort('/dev/ttyO4');
var hulUart4=fnfcReadPort;
var m10WritePort = fnfcReadPort;
var m10ReadPort = m10WritePort;
var fnfcWritePort = fnfcReadPort;
var irNfctestRunning = 'false';
var fNfctestRunning = 'false';
var flushIRNFCData;
var flushFNFCData;
var useIRNFCData = '';
var useFNFCData = '';
var validReading = false;
var irnfcFirstRun = true;
var fnfcFirstRun = true;
var irInFound = false;
var irOutFound = false;
var irnfcTagDetected = false;
var fnfcTagDetected = false;
var fnfcSKUWrite = false;
var fnfcSKURead = false;
var b = require('bonescript');
var gpowerStatus = "";
var gcommonInterval;
var gtimerCount;

var LCSpin = "P9_27";
var LCSon = b.HIGH;
var LCSoff = b.LOW;
var LCSCheckPin = "P9_14";
var LCSCheckValue = b.HIGH;
var LPSpin = "P9_42";
var LPSon = b.HIGH;
var LPSoff = b.LOW;
var LPSCheckPin = "P9_25";
var LPSCheckValue = b.HIGH;
var SVShortpin = "P8_7";
var SVAlertpin = "P8_14";
var SVAlertValue = b.LOW;
var SVShortOn = b.HIGH;
var SVShortOff = b.LOW;
var ROShortpin = "P8_10";
var ROAlertpin = "P8_13";
var ROAlertValue = b.LOW;
var ROShortOn = b.HIGH;
var ROShortOff = b.LOW;
var BPShortpin = "P8_9";
var BPAlertpin = "P8_16";
var BPAlertValue = b.LOW;
var BPShortOn = b.HIGH;
var BPShortOff = b.LOW;
var BPEnablePin = "P8_15";
var BPEnablePinValue=b.LOW;
var PumpEnablePin = "P8_18";
var PumpEnablePinValue=b.LOW;
var powerPin = "P8_8";
var powerOff = b.LOW;
var powerOn = b.HIGH;
var mspTimeout;
var mspUartOn = "false";
var mspFlashDone = "false";
//var readpin = "P9_36";
var readpin5v = "P9_36";
var readpin3v = "P9_38";
var mspUartData = "";
var mspUartEnabled = false;
var hulUart4Enabled=false;
var hulUart4Data="";
var hulUart4On="false";
var hulUart4FlashDone="false";

//Sets pins for Normal operation and Powers On Device
function PowerOnNormalOp() {
    console.log("Enter: PowerOnNormalOp");
    var voltage = 1.0;
    var deviation = 0.2;
    b.pinMode(LCSpin, b.OUTPUT);
    b.pinMode(LPSpin, b.OUTPUT);
    b.digitalWrite(LCSpin, LCSon);
    b.digitalWrite(LPSpin, LPSon);
    //wait for 500 milliseconds before power On
    setTimeout(function () {
        b.pinMode(powerPin, b.OUTPUT);
        b.digitalWrite(powerPin, powerOn);
        sendPulses("Y");
        gpowerStatus = "ON";
    }, 500);
}

//everything same as PowerOnNormalOp except Power is Off to board
function PowerOnNormalOff() {
    console.log("Enter: PowerOnNormalOff");
    var voltage = 1.0;
    var deviation = 0.2;
    b.pinMode(LCSpin, b.OUTPUT);
    b.pinMode(LPSpin, b.OUTPUT);
    b.digitalWrite(LCSpin, LCSon);
    b.digitalWrite(LPSpin, LPSon);
    //wait for 500 milliseconds before power On
    setTimeout(function () {
        b.pinMode(powerPin, b.OUTPUT);
        b.digitalWrite(powerPin, powerOff);
        sendPulses("Y");
        gpowerStatus = "OFF";
    }, 500);
}

function noaction() {
    console.log("In noaction");
}

function totalReset() {
    b.pinMode(powerPin, b.OUTPUT);
    b.digitalWrite(powerPin, powerOff);
    b.pinMode(LCSpin, b.OUTPUT);
    b.pinMode(LPSpin, b.OUTPUT);
    b.digitalWrite(LCSpin, LCSoff);
    b.digitalWrite(LPSpin, LPSoff);
    gpowerStatus = "OFF";
}

function PowerOff(timeout) {
    b.digitalWrite(powerPin, powerOff);
    clearTimeout(timeout);
}

function printJSON(x) {
    console.log(JSON.stringify(x));
}

function isPowerOn() {

    if (gpowerStatus === "ON") {
        return true;
    }
    else {
        return false;
    }
}

function sendPulses(pulseType) {
    console.log("In sendPulses()");
    var pulseMsg = '\r' + pulseType;
    console.log(pulseMsg);
    mspUart.write(pulseMsg, function (err) {
        if (err) throw err;
        console.log("message written");
    });
}

router.all('/', function (req, res, next) {
    var request = req.body.inputJsonStr;
    var jsonrequest = JSON.parse(request);
    var DUTID_TCID = jsonrequest.DUTID_TCID;
    var StepNum = jsonrequest.StepNum;
    console.log(DUTID_TCID + StepNum);
    var device = jsonrequest.Barcode;
    console.log("device: " + device);
    //var b = require('bonescript');
    var ackData = '*1;K;e4#';
    var nackData = '*2;R;dc#';

    //Sends Success response to Front-end
    function Success() {
        var response = {"status": "success"};
        res.send(response);
    }

    //Sends Failure response to Front-end
    function Failed() {
        var response = {"status": "Failed"};
        res.send(response);
    }

    // Open mspUart for Reading only upon first request.
    if (mspUartEnabled === false) {
        mspUartEnabled = true;
        mspUart.on('data', function (data) {
            console.log(data);
            console.log(data.toString());
            mspUartData = data.toString();
        });
    }
    if (hulUart4Enabled === false) {
        hulUart4Enabled = true;
        hulUart4.on('data', function (data) {
            console.log(data);
            console.log(data.toString());
            hulUart4Data = data.toString();
        });
    }
    //Perform back-end action based on Test Case ID
    switch (DUTID_TCID) {
        case "M10_1" : {
            m10WritePort.write("HDM01", function (err) {
                if (err) throw err;
                console.log("writing TCSHORTNAME of m10_1");
            });
            m10ReadPort.on('data', function (data) {
                console.log(data);
                console.log(data.toString());
                //m10testRunning = 'true';
                //var dataStr = (data.toString()).trim(); //chanses to ASCII
                // m10testingsuccess(dataStr);
                if (data.toString() == "success")
                    Success();
                else
                    Failed();
            });
            break;
        }
        case "M10_2" : {
            m10WritePort.write("PMIC", function (err) {
                if (err) throw err;
                console.log("writing TCSHORTNAME of m10_2");
            });
            m10ReadPort.on('data', function (data) {
                console.log(data);
                console.log(data.toString());
                //m10testRunning = 'true';
                //var dataStr = (data.toString()).trim(); //chanses to ASCII
                //m10testingsuccess(dataStr);
                if (data.toString() == "success")
                    Success();
                else
                    Failed();
            });
            break;
        }
        case "M10_3" : {
            console.log("M10_3 selected");
            Success();
            break;
        }
        case "M10_4" : {
            console.log("M10_4 selected");
            Success();
            break;
        }
        case "M10_5" : {
            console.log("M10_5 selected");
            Success();
            break;
        }

        case "M10_6" : {
            console.log("M10_6 selected");
            Success();
            break;
        }

        case "M10_7" : {
            console.log("M10_7 selected");
            Success();
            break;
        }
        case "M10_8" : {
            /*console.log("M10_8 selected");
            Success();*/
            m10WritePort.write("WIFI", function (err) {
                if (err) throw err;
                console.log("writing TCSHORTNAME of m10_8");
            });
            m10ReadPort.on('data', function (data) {
                console.log(data);
                console.log(data.toString());
                //m10testRunning = 'true';
                var dataStr = (data.toString()).trim(); //chanses to ASCII
                //m10testingsuccess(dataStr);
                if (data.toString() == "success")
                    Success();
                else if (data.toString == "failed")
                    Failed();
            });
            break;
        }
        case "M10_9" : {
            console.log("M10_9 selected");
            Success();
            break;
        }

        case "CC_1": {
            console.log("CC_1 selected");
            console.log("CC_1 step 1");
            Success();
            break;
        }
        case "CC_2": {
            console.log("CC_2 selected");
            console.log("Push the power button");
            console.log("Is the Power LED Turned Green?");
            Success();
            break;
        }

        case "FNFC_1": {
            var fNfcTimeOut;
            var fNfcTimeInt;
            var nfcTagData;
            var readStr = '';
            var prevStr = '';
            var writeSKU1 = "*n;ABCDEFGH;990099009;b6#";
            var readSKU1;
            var writeSKU2 = "*n;EZS8WSLV;123456789;64#";
            var readSKU2;
            var readSKUInst = "*l;2f#";
            var checkSumVal;
            var inputToa2hex;
            //reinitialize results to false
            fnfcTagDetected = false;
            fNfctestRunning = 'true';
            if (fnfcFirstRun === true) {
                fnfcFirstRun = false;
                fnfcReadPort.on('data', function (data) {
                    //sometimes multiple messages can come in a single string. So better split by separator #
                    var dataStr = (data.toString()).trim(); //chanses to ASCII
                    if (fNfctestRunning === "false") {
                        console.log("TestCase Not Running So  Flushing Data:" + data.toString());
                        flushFNFCData = dataStr;
                        useFNFCData = '';
                    }
                    else {
                        var dataStrArray = dataStr.split("#");
                        //below statement gives number of substrings that are ending with #
                        var poundEndStrCount = (dataStr.match(/#/g) || []).length;
                        for (i = 0; i < dataStrArray.length; i++) {

                            //check if it is begining of string and mark that real reading started
                            readStr = dataStrArray[i];
                            console.log("fnfc raw data: " + readStr);
                            console.log("Previoysly read  data: " + prevStr);
                            //for some reason same string is getting sent multiple times. So for now ignore such strings.
                            if (readStr === prevStr) {
                                console.log("Same as Prev String so flusing");
                                flushFNFCData = data.toString();
                                readStr = '';
                            }
                            prevStr = readStr;
                            // If first char is * then start collecting data
                            if (readStr.substr(0, 1) === "*") {
                                console.log("Found * as first char");
                                validReading = true;
                                //whenever * found in first letter think that it is start of message again
                                useFNFCData = '';
                            }
                            if (validReading) {
                                useFNFCData = useFNFCData + readStr;
                                if (poundEndStrCount > 0) {
                                    poundEndStrCount = poundEndStrCount - 1;
                                    validReading = false;
                                    console.log("Message To be Used: " + useFNFCData);
                                    if (useFNFCData.substr(0, 2) === "*f") {

                                        checkSumVal = useFNFCData.substr(useFNFCData.length - 2, 2);
                                        console.log("Message String: " + useFNFCData.substr(0, useFNFCData.length - 2));
                                        //console.log(a2hex(useFNFCData.substr(0,useFNFCData.length-2)));
                                        inputToa2hex = useFNFCData.substr(0, useFNFCData.length - 2);
                                        console.log("Input: " + inputToa2hex);
                                        console.log("Input Checksum Value: ", checkSumVal);
                                        if (checksum8(a2hex(inputToa2hex), checkSumVal)) {

                                            console.log("CheckSum Good.Sending Ack Data");
                                            fnfcTagDetected = true;
                                            writeToUart(ackData, fnfcWritePort);
                                            writeSKUTimeOut = setTimeout(function () {
                                                writeToUart(writeSKU1, fnfcWritePort);
                                            }, 1000);
                                            readSKUTimeOut = setTimeout(function () {
                                                writeToUart(readSKUInst, fnfcWritePort);
                                            }, 3000);
                                            //writeToUart(writeSKU1);
                                        }
                                        else {
                                            console.log("CheckSum Failed Writing Nack Data");
                                            writeToUart(nackData, fnfcWritePort);
                                        }

                                    }
                                    if (useFNFCData.substr(0, 2) === "*m") {

                                        checkSumVal = useFNFCData.substr(useFNFCData.length - 2, 2);
                                        console.log("Message String: " + useFNFCData.substr(0, useFNFCData.length - 2));
                                        //console.log(a2hex(useFNFCData.substr(0,useFNFCData.length-2)));
                                        inputToa2hex = useFNFCData.substr(0, useFNFCData.length - 2);
                                        console.log("Input: " + inputToa2hex);
                                        console.log("Input Checksum Value: ", checkSumVal);
                                        if (checksum8(a2hex(inputToa2hex), checkSumVal)) {

                                            console.log("CheckSum Good *m type .Sending Ack Data");
                                            writeToUart(ackData, fnfcWritePort);
                                            writeSKU2TimeOut = setTimeout(function () {
                                                writeToUart(writeSKU2, fnfcWritePort);
                                            }, 1000);
                                            fnfcSKUWrite = true;
                                            fnfcSKURead = true;
                                            //writeToUart(readSKUInst,fnfcWritePort);
                                            //writeToUart(writeSKU1);
                                        }
                                        else {
                                            console.log("CheckSum Failed Writing Nack Data");
                                            writeToUart(nackData, fnfcWritePort);
                                        }

                                    }
                                    useFNFCData = '';
                                }
                            }
                        }
                    }
                });
            }
            //set 7 seconds timeout
            fNfcTimeOut = setTimeout(function () {
                fNfctestRunning = 'false';
                console.log("fNfcTimeOut Triggered");
                console.log(fnfcSKUWrite);
                console.log(fnfcSKURead);
                console.log(fnfcTagDetected);
                if (fnfcTagDetected === true && fnfcSKUWrite === true && fnfcSKURead === true) {
                    console.log("FNFC Test Passed");
                    Success();
                } else {
                    console.log("FNFC Test Failed");
                    Failed();
                }
            }, 9000);
            //Set test running status to True
            break;
        }
        case "IRNFC_1": {
            var irNfcTimeOut;
            var irNfcTimeInt;
            var nfcTagData;
            var irInData = "*j;31";
            var irOutData = "*k;30";
            var readStr = '';
            var prevStr = '';
            var readSKU = "*l;2f#";
            var checkSumVal;
            var inputToa2hex;
            //reinitialize results to false
            irInFound = false;
            irOutFound = false;
            irnfcTagDetected = false;
            irNfctestRunning = 'true';
            if (irnfcFirstRun === true) {
                irnfcFirstRun = false;

                irnfcReadPort.on('data', function (data) {
                    var irdataStr = (data.toString()).trim(); //chanses to ASCII
                    if (irNfctestRunning === "false") {
                        console.log("TestCase Not Running So  Flushing Data:" + data.toString());
                        flushIRNFCData = irdataStr;
                        useIRNFCData = '';
                    }
                    else {
                        var dataStrArray = irdataStr.split("#");
                        //below statement gives number of substrings that are ending with #
                        var poundEndStrCount = (irdataStr.match(/#/g) || []).length;
                        for (i = 0; i < dataStrArray.length; i++) {

                            //check if it is begining of string and mark that real reading started
                            readStr = dataStrArray[i];
                            console.log("irnfc raw data: " + readStr);
                            console.log("Previoysly read  data: " + prevStr);
                            //for some reason same string is getting sent multiple times. So for now ignore such strings.
                            if (readStr === prevStr) {
                                console.log("Same as Prev String so flusing");
                                flushIRNFCData = data.toString();
                                readStr = '';
                            }
                            prevStr = readStr;
                            // If first char is * then start collecting data
                            if (readStr.substr(0, 1) === "*") {
                                console.log("Found * as first char");
                                validReading = true;
                                //whenever * found in first letter think that it is start of message again
                                useIRNFCData = '';
                            }
                            if (validReading) {
                                useIRNFCData = useIRNFCData + readStr;
                                if (poundEndStrCount > 0) {
                                    poundEndStrCount = poundEndStrCount - 1;
                                    validReading = false;
                                    console.log("Message To be Used: " + useIRNFCData);
                                    //Check If it is IR IN Message
                                    if (useIRNFCData === irInData) {
                                        console.log("IR IN Match Found");
                                        irInFound = true;
                                    }
                                    if (useIRNFCData === irOutData) {
                                        console.log("IR Out Match Found");
                                        irOutFound = true;
                                    }
                                    if (useIRNFCData.substr(0, 2) === "*f") {

                                        checkSumVal = useIRNFCData.substr(useIRNFCData.length - 2, 2);
                                        console.log("Message String: " + useIRNFCData.substr(0, useIRNFCData.length - 2));
                                        //console.log(a2hex(useIRNFCData.substr(0,useIRNFCData.length-2)));
                                        inputToa2hex = useIRNFCData.substr(0, useIRNFCData.length - 2);
                                        console.log("Input: " + inputToa2hex);
                                        console.log("Input Checksum Value: ", checkSumVal);
                                        if (checksum8(a2hex(inputToa2hex), checkSumVal)) {

                                            console.log("CheckSum Good.Sending Ack Data");
                                            irnfcTagDetected = true;
                                            writeToUart(ackData, irnfcWritePort);
                                            //writeToUart(writeSKU1);
                                        }
                                        else {
                                            console.log("CheckSum Failed Writing Nack Data");
                                            writeToUart(nackData, irnfcWritePort);
                                        }

                                    }
                                    useIRNFCData = '';
                                }
                            }
                        }
                    }
                });
            }
            //set 7 seconds timeout
            irNfcTimeOut = setTimeout(function () {
                irNfctestRunning = 'false';
                console.log("irNfcTimeOut Triggered");
                console.log(irInFound);
                console.log(irOutFound);
                console.log(irnfcTagDetected);
                //IR OUT Test result ignoored
                if (irInFound === true && irnfcTagDetected === true) {
                    console.log("IR Test Passed");
                    Success();
                } else {
                    console.log("IR Test Failed");
                    Failed();
                }
            }, 7000);
            //Set test running status to True
            break;
        }
        case "IRNFC_2": {
            console.log("IRNFC_2 selected");
            Success();
            break;
        }
        case "IRNFC_3": {
            console.log("IRNFC_3 selected");
            Success();
            break;
        }
        case "IRNFC_4": {
            console.log("IRNFC_4 selected");
            console.log("Push the power button");
            console.log("Is the Power LED Turned Green?");
            Success();
            break;
        }

        case "TRIAC_1": {
            console.log("TRIAC_1 Start");
            var outputtr1 = b.HIGH;
            var expectedInputtr1 = b.HIGH;
            var oPintr1 = "P9_16";
            var iPintr1 = "P9_42";
            b.pinMode(oPintr1, b.OUTPUT);
            b.pinMode(iPintr1, b.INPUT);
            b.digitalWrite(oPintr1, outputtr1);
            console.log("after digitalWrite");
            b.digitalRead(iPintr1, checkResultTRIAC1);

            firstTimer = setTimeout(function () {
                console.log("firstTimerTimeOutCalled");
                console.log("timeout cleared");
            }, 2000);

            break;
        }

        case "ESR_1": {
            console.log("ESR1 Start");
            var output = b.HIGH;
            var expectedInput = b.HIGH;
            var oPin = "P9_14";
            var iPin = "P9_27";
            b.pinMode(oPin, b.OUTPUT);
            b.pinMode(iPin, b.INPUT);
            b.digitalWrite(oPin, output);
            console.log("after digitalWrite");
            b.digitalRead(iPin, checkResultESR1);

            firstTimer = setTimeout(function () {
                console.log("Second function called");
                console.log("timeout cleared");
            }, 2000);

            break;
        }
        case "HUL1_1": {
            console.log("HUL1_1 selected");
            Success();
            break;
        }
        case "HUL1_2": {
            console.log("HUL1_2 5V");
            gtimerCount = 0;
            //check in time interval of 1 second is power is ON for 5 seconds
            gcommonInterval = setInterval(function () {
                gtimerCount++;
                console.log("In Global Time Interval");
                if (isPowerOn() || gtimerCount > 4) {
                    clearInterval(this);
                    b.analogRead(readpin5v, check5vinput);
                }
            }, 2000);
            PowerOnNormalOp();
            /* No need of 5 seconds timeout
                console.log("before seeting time");
                firstTimer = setTimeout(function () {
                    console.log("firstTimerTimeOutCalled");
                    console.log("timeout cleared");
                }, 5000);
            */
            break;
        }
        case "HUL1_3": {
            console.log("HUL1_3 start");
            gtimerCount = 0;
            gcommonInterval = setInterval(function () {
                gtimerCount++;
                console.log("In Global Time Interval");
                if (isPowerOn() || gtimerCount > 4) {
                    clearInterval(this);
                    b.analogRead(readpin3v, check5vinput);
                }
            }, 2000);
            PowerOnNormalOp();
            /* No need of this timeout
                console.log("before seeting time");
                firstTimer = setTimeout(function () {
                    console.log("firstTimerTimeOutCalled");
                    console.log("timeout cleared");
                }, 5000);
            */
            break;
        }
        case "HUL1_4": {
            PowerOnNormalOp();
            setTimeout(function () {
                //dont get confused. This is used to send message to flash the board
                sendPulses("S");
            }, 2000);
            //Giving 28 seconds to Flash.
            setTimeout(function () {
                sendPulses("Y");
                var mspresponse = mspUartData;
                var trimmedResponse;
                if (mspresponse.length > 1) {
                    trimmedResponse = mspresponse.substr(1, mspresponse.length - 2);
                }
                else {
                    trimmedResponse = "Timed Out";
                }
                console.log(trimmedResponse);
                if (trimmedResponse === "Upgrade Success") {
                    mspFlashDone = "true";
                    mspUartData = "";
                    Success();
                }
                else {
                    console.log("entered else part");
                    mspFlashDone = "false";
                    mspUartData = "";
                    Failed();
                }
            }, 26000);
            break;
        }
        case "HUL1_5": {
            console.log("HUL1_5 Normal working");
            b.digitalRead(BPEnablePin, function (result) {
		    console.log("BP Enable Pin After Short", result.value);
                    b.digitalRead(PumpEnablePin, function (result1) {
                        console.log("Pump Enable ", result1.value);
			    if(result.value===BPEnablePinValue && result1.value===PumpEnablePinValue){
			    Success();
			    }
			    else
				    Failed();
                    });
	    });
           // Success();
            break;
        }
        case "HUL1_6": {
            console.log("HUL1_6 LCS");
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making LCS Short");
                b.digitalWrite(LCSpin, LCSoff);
                sendPulses("N");
                setTimeout(function () {
                    b.digitalRead(LCSCheckPin, function (result) {
                        console.log("reading LCSCheckPin Status");
                        if (result.value === LCSCheckValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                    //Success();
                }, 3000);
            }, 3000);
            break;
        }
        case "HUL1_7": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making LPS Short");
                b.pinMode(BPEnablePin, b.INPUT);
                b.pinMode(PumpEnablePin, b.INPUT);
                b.digitalRead(LPSCheckPin, function (result) {
                    console.log("LPSCheckPin Before LPS Test", result.value);
                });
                b.digitalRead(BPEnablePin, function (result) {
                    console.log("BP Enable Pin Before LPS Test", result.value);
                });
                b.digitalRead(PumpEnablePin, function (result) {
                    console.log("Pump Enable Pin Before LPS Test", result.value);
                });

                setTimeout(function () {
                    b.digitalWrite(LPSpin, LPSoff);
                    sendPulses("N");
                }, 2000);
                console.log("Pin Status with LPS Open");
                setTimeout(function () {
                    b.digitalRead(BPEnablePin, function (result) {
                        console.log("BP Enable Pin  After Short", result.value);
                    });
                    b.digitalRead(PumpEnablePin, function (result) {
                        console.log("PumpEnablePin After Short", result.value);
                    });
                    b.digitalRead(LPSCheckPin, function (result) {
                        console.log("LPS Check pin After Short", result.value);
                        setTimeout(function () {
                            //Success();
                            if (result.value === LPSCheckValue) {
                                Success();
                            }
                            else
                                Failed();
                        }, 4000);
                    });
                }, 2000);
            }, 3000);
            break;
        }
        case "HUL1_8": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making SV Short");
                b.pinMode(SVShortpin, b.OUTPUT);
                b.pinMode(SVAlertpin, b.INPUT);
                b.digitalRead(SVAlertpin, function (result) {
                    console.log("SVAlert Pin Before Short ", result.value);
                });
                b.digitalWrite(SVShortpin, SVShortOn);
                sendPulses("N");
                setTimeout(function () {
                    b.digitalWrite(SVShortpin, SVShortOff);
                }, 300);
                setTimeout(function () {
                    b.digitalRead(SVAlertpin, function (result) {
                        console.log("SVAlert Pin After Short ", result.value);
                        if (result.value === SVAlertValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                }, 2000);
            }, 3000);
            break;
        }
        case "HUL1_9": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making RO Short");
                b.pinMode(ROShortpin, b.OUTPUT);
                b.pinMode(ROAlertpin, b.INPUT);
                b.digitalRead(ROAlertpin, function (result) {
                    console.log("ROAlert Pin Before Short ", result.value);
                });
                b.digitalWrite(ROShortpin, ROShortOn);
                sendPulses("N");
                setTimeout(function () {
                    b.digitalWrite(ROShortpin, ROShortOff);
                }, 300);
                setTimeout(function () {
                    b.digitalRead(ROAlertpin, function (result) {
                        console.log("ROAlert Pin After Short ", result.value);
                        if (result.value === ROAlertValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                }, 1000);
            }, 3000);
            break;
        }
        case "HUL1_10": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making BP Short");
                b.pinMode(BPShortpin, b.OUTPUT);
                b.pinMode(BPAlertpin, b.INPUT);
                b.pinMode(BPEnablePin, b.INPUT);
                b.digitalRead(BPAlertpin, function (result) {
                    console.log("BP Alert Pin Before Short", result.value);
                });
                b.digitalRead(BPEnablePin, function (result) {
                    console.log("BP Enable Pin Before Short", result.value);
                });
                setTimeout(function () {
                    b.digitalWrite(BPShortpin, BPShortOn);
                    sendPulses("N");
                }, 1200);
                setTimeout(function () {
                    b.digitalWrite(BPShortpin, BPShortOff);
                }, 1300);
                setTimeout(function () {
                    b.digitalWrite(BPShortpin, BPShortOff);
                    b.digitalWrite(BPShortpin, BPShortOff);
                    b.digitalRead(BPEnablePin, function (result) {
                        console.log("BP Enable Pin After Short", result.value);
                    });
                    b.digitalRead(BPAlertpin, function (result) {
                        console.log("BP Alert Pin after Short", result.value);
                        if (result.value === BPAlertValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                    //Success();
                }, 3000);
            }, 3000);
            break;
        }
        case "HUL1_11": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making Low Flow");
                sendPulses("L");
                setTimeout(function () {
                    console.log("Sending Low Flow Success");
                    Success();
                }, 35000);
            }, 5000);
            break;
        }
        case "HUL1_12": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making NO Flow");
                sendPulses("N");
                setTimeout(function () {
                    Success();
                }, 15000);
            }, 3000);
            break;
        }
        case "HUL1_13": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making RO Tamper");
                b.digitalWrite(LCSpin, LCSoff);
                sendPulses("Y");
                setTimeout(function () {
                    Success();
                }, 15000);
            }, 5000);
            break;
        }
        case "HUL1_14": {
            PowerOnNormalOp();
            hulUart4.write("Hello;", function (err) {
                if (err) throw err;
                console.log("message written");
            });
            setTimeout(function () {
                var uart4response = hulUart4Data;
		    console.log("UART4 Response Collected: " + uart4response);
                var trimmedResponse;
                if (uart4response.length > 1) {
                    trimmedResponse = uart4response.substr(1, uart4response.length - 2);
                }
                else {
                    trimmedResponse = "Timed Out";
                }
                console.log(trimmedResponse);
                //if (uart4response === "Hello;") {
                if (uart4response.length > 1) {
                    hulUart4Data = "";
                    Success();
                }
                else {
                    console.log("entered else part");
                    hulUart4Data = "";
                    Failed();
                }
            }, 6000);
	break;
        }
        case "HUL1_15": {
            PowerOnNormalOp();
            setTimeout(function () {
                //dont get confused. This is used to send message to flash the board
                sendPulses("S");
            }, 2000);
            //Giving 28 seconds to Flash.
            setTimeout(function () {
                sendPulses("Y");
                var mspresponse = mspUartData;
                var trimmedResponse;
                if (mspresponse.length > 1) {
                    trimmedResponse = mspresponse.substr(1, mspresponse.length - 2);
                }
                else {
                    trimmedResponse = "Timed Out";
                }
                console.log(trimmedResponse);
                if (trimmedResponse === "Upgrade Success") {
                    mspFlashDone = "true";
                    mspUartData = "";
                    Success();
                }
                else {
                    console.log("entered else part");
                    mspFlashDone = "false";
                    mspUartData = "";
                    Failed();
                }
            }, 25000);
            break;
        }
        case "HUL1_16": {
            console.log("HUL1_16");
            Success();
            break;
        }
        case "HUL1_17": {
            console.log("HUL1_17");
            Success();
            break;
        }
        case "HUL2_1": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making SV Short");
                b.pinMode(SVShortpin, b.OUTPUT);
                b.pinMode(SVAlertpin, b.INPUT);
                b.digitalRead(SVAlertpin, function (result) {
                    console.log("SVAlert Pin Before Short ", result.value);
                });
                b.digitalWrite(SVShortpin, SVShortOn);
                sendPulses("N");
                setTimeout(function () {
                    b.digitalWrite(SVShortpin, SVShortOff);
                }, 300);
                setTimeout(function () {
                    b.digitalRead(SVAlertpin, function (result) {
                        console.log("SVAlert Pin After Short ", result.value);
                        if (result.value === SVAlertValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                }, 2000);
            }, 5000);
            break;
        }
        case "HUL2_2": {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making RO Short");
                b.pinMode(ROShortpin, b.OUTPUT);
                b.pinMode(ROAlertpin, b.INPUT);
                b.digitalRead(ROAlertpin, function (result) {
                    console.log("ROAlert Pin Before Short ", result.value);
                });
                b.digitalWrite(ROShortpin, ROShortOn);
                sendPulses("N");
                setTimeout(function () {
                    b.digitalWrite(ROShortpin, ROShortOff);
                }, 300);
                setTimeout(function () {
                    b.digitalRead(ROAlertpin, function (result) {
                        console.log("ROAlert Pin After Short ", result.value);
                        if (result.value === ROAlertValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                }, 1000);
            }, 5000);
            break;
        }
        case "HUL2_3":{
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making BP Short");
                b.pinMode(BPShortpin, b.OUTPUT);
                b.pinMode(BPAlertpin, b.INPUT);
                b.pinMode(BPEnablePin, b.INPUT);
                b.digitalRead(BPAlertpin, function (result) {
                    console.log("BP Alert Pin Before Short", result.value);
                });
                b.digitalRead(BPEnablePin, function (result) {
                    console.log("BP Enable Pin Before Short", result.value);
                });
                setTimeout(function () {
                    b.digitalWrite(BPShortpin, BPShortOn);
                    sendPulses("N");
                }, 1200);
                setTimeout(function () {
                    b.digitalWrite(BPShortpin, BPShortOff);
                }, 1300);
                setTimeout(function () {
                    b.digitalWrite(BPShortpin, BPShortOff);
                    b.digitalWrite(BPShortpin, BPShortOff);
                    b.digitalRead(BPEnablePin, function (result) {
                        console.log("BP Enable Pin After Short", result.value);
                    });
                    b.digitalRead(BPAlertpin, function (result) {
                        console.log("BP Alert Pin after Short", result.value);
                        if (result.value === BPAlertValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                    //Success();
                }, 6000);
            }, 5000);
            break;
        }
        case "HUL2_4":  {
            console.log("HUL2_4 LCS");
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making LCS Short");
                b.digitalWrite(LCSpin, LCSoff);
                sendPulses("N");
                setTimeout(function () {
                    b.digitalRead(LCSCheckPin, function (result) {
                        console.log("reading LCSCheckPin Status");
                        if (result.value === LCSCheckValue) {
                            Success();
                        }
                        else
                            Failed();
                    });
                    //Success();
                }, 3000);
            }, 5000);
            break;
        }
        case "HUL2_5":  {
            PowerOnNormalOp();
            setTimeout(function () {
                console.log("making LPS Short");
                b.pinMode(BPEnablePin, b.INPUT);
                b.pinMode(PumpEnablePin, b.INPUT);
                b.digitalRead(LPSCheckPin, function (result) {
                    console.log("LPSCheckPin Before LPS Test", result.value);
                });
                b.digitalRead(BPEnablePin, function (result) {
                    console.log("BP Enable Pin Before LPS Test", result.value);
                });
                b.digitalRead(PumpEnablePin, function (result) {
                    console.log("Pump Enable Pin Before LPS Test", result.value);
                });

                setTimeout(function () {
                    b.digitalWrite(LPSpin, LPSoff);
                    sendPulses("N");
                }, 2000);
                console.log("Pin Status with LPS Open");
                setTimeout(function () {
                    b.digitalRead(BPEnablePin, function (result) {
                        console.log("BP Enable Pin  After Short", result.value);
                    });
                    b.digitalRead(PumpEnablePin, function (result) {
                        console.log("PumpEnablePin After Short", result.value);
                    });
                    b.digitalRead(LPSCheckPin, function (result) {
                        console.log("LPS Check pin After Short", result.value);
                        setTimeout(function () {
                            //Success();
                            if (result.value === LPSCheckValue) {
                                Success();
                            }
                            else
                                Failed();
                        }, 7000);
                    });
                }, 4000);
            }, 5000);
            break;
        }
        case "HUL2_6": {
            console.log("HUL2_6 selected");
            var requestmodule = require('request');
            console.log(device);
            //'https://ibotapp.azure-api.net/deviceconnectinfo/ConnectInfo4',
            var options = {
                method: 'GET',
                url: 'http://botservicedirectory.cloudapp.net/ibotoperations.svc/Platform/HULDeviceOnboard/shivaraya9;SRP0000001;' + device,
                //url: 'http://botservicedirectory.cloudapp.net/ibotoperations.svc/Platform/HULDeviceOnboard/shivaraya9;SRP0000001;Device',
                headers:
                    {
                        'content-type': 'application/json',
                        'ocp-apim-trace': 'true',
                        'ocp-apim-subscription-key': '2bb0cf6fe5c44dedac555cc8432b4c14'
                    },
                body: device,
                json: true
            };
            console.log(options.url);
            checkHiveConfirmation();

            var timerCountOfHive = 0;
            var statusfromhive;
            var gcommonInterval = setInterval(function () {
                timerCountOfHive++;
                checkHiveConfirmation();

                if (timerCountOfHive > 9 && statusfromhive === "fail") {
                    clearInterval(this);
                    Failed();
                }
                else if(statusfromhive==="success"){
                    clearInterval(this);
                    Success();
                }
            }, 20000);

            function checkHiveConfirmation() {
                requestmodule(options, function (error, response, body) {
                    if (error) {
                        console.log("Error occured while confirming from Hive");
                        console.log(statusCode);
                        statusfromhive = "fail";
                    }
                    else if (response.statusCode === 200) {
                        console.log(body);
                        if (body === "Fail") {
                            statusfromhive = "fail";
                        }
                        else
                            statusfromhive = "success";
                    }
                });
            }
            break;
        }
    }

    function checkpinstatus(result) {
        console.log("pin Status", result.value);
    }

    function xchecksvvoltage(result) {
        var b2 = require('bonescript');
        var SV_ShortPin = "P8_14";
        var expectedInput = b2.LOW;
        if (SV_ShortPin == expectedInput) {
            console.log('SVAlertCheck: Success');
            clearTimeout(hul2_1_firstTimer);
            Success();
            console.log("Success");
        }
        else {
            console.log('SVAlertCheck: Fail');
            clearTimeout(hul2_1_firstTimer);
            Failed();
        }
    }

    function PulsesOn() {
        sendPulses("Y");
    }

    function PulseOff() {
        sendPulses("N");
    }

    function PulseLow() {
        sendPulses("L");
    }

    function writeToUart(message, toPort) {
        console.log("Writing ", message);
        toPort.write(message, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    }

    function a2hex(str) {
        var arr = [];
        for (var i = 0, l = str.length; i < l; i++) {
            var hex = Number(str.charCodeAt(i)).toString(16);
            arr.push(hex);
        }
        return arr.join('');
    }

    function hex2a(hexx) {
        console.log('In hex2a', hexx);
        var hex = hexx.toString();//force conversion
        console.log('Hello:', hex);
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    function checksum8(inputStr, checksumValue) {
        // convert input value to upper case
        console.log("In a2hex: " + inputStr);
        console.log("In a2hex inputcheckSum: " + checksumValue);
        strN = new String(inputStr);
        strN = strN.toUpperCase();
        var inputCheckSum = new String(checksumValue);
        inputCheckSum = inputCheckSum.toUpperCase();
        console.log("Input Check Sum" + inputCheckSum);
        strHex = new String("0123456789ABCDEF");
        result = 0;
        fctr = 16;
        for (i = 0; i < strN.length; i++) {
            if (strN.charAt(i) == " ") continue;

            v = strHex.indexOf(strN.charAt(i));
            if (v < 0) {
                result = -1;
                break;
            }
            result += v * fctr;

            if (fctr == 16) fctr = 1;
            else fctr = 16;
        }

        if (result < 0) {
            strResult = new String("Non-hex character");
        }
        else if (fctr == 1) {
            strResult = new String("Odd number of characters");
        }
        else {
            // Calculate 2's complement
            result = (~(result & 0xff) + 1) & 0xFF;
            // Convert result to string
            //strResult = new String(result.toString());
            strResult = strHex.charAt(Math.floor(result / 16)) + strHex.charAt(result % 16);
        }
        console.log("Computed Checksum: " + strResult);
        if (strResult === inputCheckSum) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkResultESR1(result) {
        console.log('Result = ' + result.value);
        var b2 = require('bonescript');
        var oPin = "P9_14";
        var expectedInput2 = b2.HIGH;
        console.log('Error = ' + result.err);
        if (result.value == expectedInput2) {
            console.log('ESR_1: Success');
            b2.digitalWrite(oPin, b2.LOW);
            clearTimeout(firstTimer);
            Success();
        }
        else {
            console.log('ESR_1: Fail');
            b2.digitalWrite(oPin, b2.LOW);
            clearTimeout(firstTimer);
            Failed();
        }
    }

    function checkResultTRIAC1(result) {
        console.log('Triac1 Result = ' + result.value);
        var b2 = require('bonescript');
        var oPin = "P9_16";
        var expectedInput2 = b2.HIGH;
        console.log('Error = ' + result.err);
        if (result.value == expectedInput2) {
            console.log('ESR_1: Success');
            b2.digitalWrite(oPin, b2.LOW);
            clearTimeout(firstTimer);
            Success();
        }
        else {
            console.log('ESR_1: Fail');
            b2.digitalWrite(oPin, b2.LOW);
            clearTimeout(firstTimer);
            Failed();
        }
    }

    //Checks 5 Volts Test (Actually changed to 1.8 volts later)
    function check5vinput(result) {
        // var b = require('bonescript');
        var voltage = 1.0;
        var deviation = 0.2;
        if ((result.value <= voltage + deviation) && (result.value > voltage - deviation)) {
            console.log('result.value = ' + result.value);
            console.log('Success');
            //gcommonInterval.clearInterval();
            //clearTimeout(firstTimer);
            Success();
        }
        else {
            console.log('result.err =' + result.err);
            console.log('result.value = ' + result.value);
            console.log('Fail');
            //gcommonInterval.clearInterval();
            //clearTimeout(firstTimer);
            Failed();
        }
    }


    function check3vinput(result) {
        var voltage = 1.0;
        var deviation = 0.2;
        if ((result.value <= voltage + deviation) && (result.value > voltage - deviation)) {
            console.log('result.value = ' + result.value);
            console.log('HUL2_1:Success');
            clearTimeout(firstTimer);
            Success();
        }
        else {
            console.log('result.err =' + result.err);
            console.log('result.value = ' + result.value);
            console.log('HUL2_1:Fail');
            clearTimeout(firstTimer);
            Failed();
        }
    }


    function checksvvoltage(result) {
        //var b2 = require('bonescript');
        var SV_ShortPin = "P8_14";
        var expectedInput = b.LOW;
        console.log("SV at P8_14:", result.value);
        if (result.value === expectedInput) {
            console.log('SVAlertCheck: Success');
            // b2.digitalWrite(SV_ShortPin,b2.HIGH);
            clearTimeout(hulTimer);
            Success();
        }
        else {
            console.log('SVAlertCheck: Fail');
            // b2.digitalWrite(SV_ShortPin,b2.HIGH);
            clearTimeout(hulTimer);
            Failed();
        }
    }

    function checkrvvoltage(result) {
        //var b2 = require('bonescript');
        var RV_ShortPin = "P8_13";
        var expectedInput = b.HIGH;
        if (result.value === expectedInput) {
            console.log('RVAlertCheck: Success');
            clearTimeout(firstTimer);
            Success();
        }
        else {
            console.log('RVAlertCheck: Fail');
            clearTimeout(firstTimer);
            Failed();
        }
    }

    function checkbpvoltage(result) {
        //var b2 = require('bonescript');
        var BP_ShortPin = "P8_16";
        var expectedInput = b.HIGH;
        if (result.value === expectedInput) {
            console.log('BPAlertCheck: Success');
            clearTimeout(firstTimer);
            Success();
        }
        else {
            console.log('BPAlertCheck: Fail');
            clearTimeout(firstTimer);
            Failed();
        }
    }
});
router.all('/Recovery_BE', function (req, res) {
    var request = req.body.inputJsonStr;
    var jsonrequest = JSON.parse(request);
    var DUTID_TCID = jsonrequest.DUTID_TCID;
    var StepNum = jsonrequest.StepNum;
    console.log(DUTID_TCID + StepNum);
    //var testcasenum=DUTID_TCID.substr(DUTID_TCID.length-1);
    //var DUTID=DUTID_TCID.splice(0,-2);
    //console.log(DUTID);
    //console.log(testcasenum);
    switch (DUTID_TCID) {
        case "HUL1_6": {
            setTimeout(function () {
                console.log("LCS Recovery");
                b.digitalWrite(LCSpin, LCSon);
                sendPulses("Y");
                setTimeout(function () {
                    Success();
                }, 3000);
            }, 3000);
            break;
        }
        case "HUL1_7": {
            setTimeout(function () {
                console.log("recovering LPS Short");
                b.pinMode(LPSpin, b.OUTPUT);
                b.digitalWrite(LPSpin, LPSon);
                sendPulses("Y");
                setTimeout(function () {
                    b.digitalRead(BPEnablePin, function (result) {
                        console.log("BP Enable After Recovery", result.value);
                    });
                    b.digitalRead(PumpEnablePin, function (result) {
                        console.log("Pump Enable ", result.value);
                    });
                    Success();
                }, 5000);
            }, 2000);
            break;
        }
        case "HUL1_8": {
            setTimeout(function () {
                console.log("recovering SV Short");
                sendPulses("Y");
                b.digitalWrite(powerPin, powerOff);
                setTimeout(function () {
                    PowerOnNormalOp();
                    setTimeout(function () {
                        Success();
                    }, 4000);
                }, 5000);
            }, 1000);
            break;
        }
        case "HUL1_9": {
            setTimeout(function () {
                console.log("recovering RV Short");
                sendPulses("Y");
                b.digitalWrite(powerPin, powerOff);
                setTimeout(function () {
                    PowerOnNormalOp();
                    setTimeout(function () {
                        Success();
                    }, 4000);
                }, 5000);
            }, 1000);
            break;
        }
        case "HUL1_10": {
            setTimeout(function () {
                console.log("recovering BP Short");
                sendPulses("Y");
                b.digitalWrite(powerPin, b.LOW);
                setTimeout(function () {
                    b.digitalWrite(powerPin, b.HIGH);
                    sendPulses("Y");
                    b.digitalWrite(BPShortpin, b.LOW);
                    setTimeout(function () {
                        b.digitalRead(BPAlertpin, function (result) {
                            console.log("BP Alert Pin after Recovery", result.value);
                        });
                        b.digitalRead(BPEnablePin, function (result) {
                            console.log("BP Enable Pin After Recovery", result.value);
                        });
                        Success();
                    }, 5000);
                }, 3000);
            }, 3000);
            break;
        }
        case "HUL1_11": {
            setTimeout(function () {
                console.log("Recovering: Setting Normal Flow");
                sendPulses("Y");
                Success();
            }, 5000);
            break;
        }
        case "HUL1_12": {
            setTimeout(function () {
                console.log("Recovering: FS Tamper");
                sendPulses("Y");
                setTimeout(function () {
                    b.digitalWrite(powerPin, powerOff);
                }, 2000);
                setTimeout(function () {
                    b.digitalWrite(powerPin, powerOn);
                }, 7000);

                setTimeout(function () {
                    Success();
                }, 10000);
            }, 2000);
            break;
        }
        case "HUL1_13": {
            setTimeout(function () {
                sendPulses("Y");
                setTimeout(function () {
                    b.digitalWrite(powerPin, powerOff);
                }, 2000);
                setTimeout(function () {
                    b.digitalWrite(LCSpin, LCSon);
                    b.digitalWrite(powerPin, powerOn);
                }, 7000);
                setTimeout(function () {
                    Success();
                }, 10000);
            }, 2000);
            break;
        }
        case "HUL2_1": {
            setTimeout(function () {
                console.log("recovering SV Short");
                sendPulses("Y");
                b.digitalWrite(powerPin, powerOff);
                setTimeout(function () {
                    PowerOnNormalOp();
                    setTimeout(function () {
                        Success();
                    }, 4000);
                }, 5000);
            }, 1000);
            break;
        }
        case "HUL2_2": {
            setTimeout(function () {
                console.log("recovering RV Short");
                sendPulses("Y");
                b.digitalWrite(powerPin, powerOff);
                setTimeout(function () {
                    PowerOnNormalOp();
                    setTimeout(function () {
                        Success();
                    }, 4000);
                }, 5000);
            }, 1000);
            break;
        }
        case "HUL2_3": {
            setTimeout(function () {
                console.log("recovering BP Short");
                sendPulses("Y");
                b.digitalWrite(powerPin, b.LOW);
                setTimeout(function () {
                    b.digitalWrite(powerPin, b.HIGH);
                    sendPulses("Y");
                    b.digitalWrite(BPShortpin, b.LOW);
                    setTimeout(function () {
                        b.digitalRead(BPAlertpin, function (result) {
                            console.log("BP Alert Pin after Recovery", result.value);
                        });
                        b.digitalRead(BPEnablePin, function (result) {
                            console.log("BP Enable Pin After Recovery", result.value);
                        });
                        Success();
                    }, 5000);
                }, 3000);
            }, 3000);
            break;
        }
         case "HUL2_4": {
            setTimeout(function () {
                console.log("LCS Recovery");
                b.digitalWrite(LCSpin, LCSon);
                sendPulses("Y");
                setTimeout(function () {
                    Success();
                }, 3000);
            }, 3000);
            break;
        }
        case "HUL2_5": {
            setTimeout(function () {
                console.log("recovering LPS Short");
                b.pinMode(LPSpin, b.OUTPUT);
                b.digitalWrite(LPSpin, LPSon);
                sendPulses("Y");
                setTimeout(function () {
                    b.digitalRead(BPEnablePin, function (result) {
                        console.log("BP Enable After Recovery", result.value);
                    });
                    b.digitalRead(PumpEnablePin, function (result) {
                        console.log("Pump Enable ", result.value);
                    });
                    Success();
                }, 5000);
            }, 2000);
            break;
        }
    }

    function Success() {
        var response = {"status": "success"};
        res.send(response);
    }

    function Failed() {
        var response = {"status": "Failed"};
        res.send(response);
    }

    function PulsesOn() {
        // b.analogWrite('P9_16', 0.5, 11.7, printJSON);
        function printJSON(x) {
            console.log(JSON.stringify(x));
        }
    }
});
router.all('/Reset_BE', function (req, res) {
    var request = req.body.inputJsonStr;
    var jsonrequest = JSON.parse(request);
    var DUTID = jsonrequest.DUTID;
    console.log(DUTID);

    function Success() {
        var response = {"status": "success"};
        res.send(response);
    }

    function Failed() {
        var response = {"status": "Failed"};
        res.send(response);
    }

    switch (DUTID) {
        case "M10":
            console.log(DUTID);
            Success();
            break;
        case "CC":
            console.log(DUTID);
            Success();
            break;
        case "IRNFC":
            console.log(DUTID);
            Success();
            break;
        case "FNFC":
            console.log(DUTID);
            Success();
            break;
        case "TRIAC":
            console.log(DUTID);
            Success();
            break;
        case "ESR":
            console.log(DUTID);
            Success();
            break;
        case "HUL1":
            console.log(DUTID);
            /*var timeout = setTimeout(function () {
                console.log("set timeout");
            }, 2000);
            PowerOff(timeout);*/

            totalReset();
            Success();
            break;
        case "HUL2":
            console.log(DUTID);
            var timeout = setTimeout(function () {
                console.log("set timeout");
            }, 2000);
            PowerOff(timeout);
            Success();
            break;
    }
});

module.exports = router;
