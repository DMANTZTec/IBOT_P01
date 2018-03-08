var express = require('express');
var router = express.Router();
var fs=require('fs');
/* GET home page. */
var firstTimer;
var irNfcTimer;
var fNfcTimer;
var SerialPort = require('serialport');
var irnfcReadPort = new SerialPort('/dev/ttyO2');
var irnfcWritePort = irnfcReadPort;
var fnfcReadPort = new SerialPort('/dev/ttyO4');
var fnfcWritePort = fnfcReadPort;
var irNfctestRunning='false';
var fNfctestRunning='false';
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

router.all('/', function(req, res, next)
{
    var request = req.body.inputJsonStr;
    var jsonrequest=JSON.parse(request);
    var DUTID_TCID=jsonrequest.DUTID_TCID;
    var StepNum=jsonrequest.StepNum;
    console.log(DUTID_TCID + StepNum);
    var b = require('bonescript');

    function checksum8(inputStr,checksumValue) {

        // convert input value to upper case
        strN = new String(inputStr);
        strN = strN.toUpperCase();

        strHex = new String("0123456789ABCDEF");
        result = 0;
        fctr = 16;

        for (i=0; i<strN.length; i++) {
            if (strN.charAt(i) == " ") continue;

            v = strHex.indexOf(strN.charAt(i));
            if (v < 0) {
                result = -1;
                break;
            }
            result += v * fctr;

            if (fctr == 16) fctr = 1;
            else            fctr = 16;
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
            strResult = strHex.charAt(Math.floor(result/16)) + strHex.charAt(result%16);
        }
        if (strResult === checksumValue){
            return true;
        }
        else{
            return false;
        }
    }

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
    switch (DUTID_TCID)
    {
        case "M10_1" :
        {
            console.log("M10_1 selected");
                    console.log("Check if HDMI Cable is Connected");
                    Success();
                    break;

        }
        case "M10_2" :
        {
            console.log("M10_2 selected");
                    console.log("Push the power button");
                    console.log("Is the Power LED Turned Green?");
                    Success();
                    break;
        }
        case "M10_3" :
        {
            console.log("M10_3 selected");
            Success();
            break;
        }
        case "M10_4" :
        {
            console.log("M10_4 selected");
            Success();
            break;
        }
        case "M10_5" :
        {
            console.log("M10_5 selected");
            Success();
            break;
        }

        case "M10_6" :
        {
            console.log("M10_6 selected");
            Success();
            break;
        }

        case "M10_7" :
        {
            console.log("M10_7 selected");
            Success();
            break;
        }
        case "M10_8" :
        {
            console.log("M10_8 selected");
            Success();
            break;
        }
        case "M10_9" :
        {
            console.log("M10_9 selected");
            Success();
            break;
        }

        case "CC_1":
        {
            console.log("CC_1 selected");
                    console.log("CC_1 step 1");
                    Success();
                    break;
        }
        case "CC_2":
        {
            console.log("CC_2 selected");
            console.log("Push the power button");
            console.log("Is the Power LED Turned Green?");
            Success();
            break;
        }

        case "FNFC_1":
        {
		var fNfcTimeOut;
		var fNfcTimeInt;
		var nfcTagData;
		var ackData='*1;K;e4#';
		var nackData='*2;R;dc#';
		var readStr = '';
		var prevStr = '';
		var writeSKU1 = "*n;ABCDEFGH;990099009;b6#";
		var readSKU1 ; 
		var writeSKU2 = "*n;EZS8WSLV;123456789;64#";
		var readSKU2 ; 
		var readSKUInst = "*l;2f#";
		var checkSumVal;
		var inputToa2hex;
		//reinitialize results to false
		fnfcTagDetected = false;
		fNfctestRunning = 'true';
		if (fnfcFirstRun === true){
			fnfcFirstRun = false;
		fnfcReadPort.on('data', function (data) {
		    //sometimes multiple messages can come in a single string. So better split by separator #
            var dataStr = (data.toString()).trim(); //chanses to ASCII
            if (fNfctestRunning === "false") {
                console.log("TestCase Not Running So  Flushing Data:" + data.toString());
                flushFNFCData = dataStrArray[i];
                useFNFCData = '';
            }
            else {
            var dataStrArray = dataStr.split("#");
            for(i=0;i<dataStrArray.length;i++) {
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
                     if (readStr.substr(readStr.length - 1, 1) === "#") {
                            validReading = false;
                            console.log("Message To be Used: " + useFNFCData);
                            if (useFNFCData.substr(0, 2) === "*f") {

                                checkSumVal = useFNFCData.substr(useFNFCData.length - 3, 2);
                                console.log("Message String: " + useFNFCData.substr(0, useFNFCData.length - 3));
                                //console.log(a2hex(useFNFCData.substr(0,useFNFCData.length-3)));
                                inputToa2hex = useFNFCData.substr(0, useFNFCData.length - 3);
                                console.log("Input: " + inputToa2hex);
                                console.log("Input Checksum Value: ", checkSumVal);
                                if (checksum8(a2hex(inputToa2hex), checkSumVal)) {

                                    console.log("CheckSum Good.Sending Ack Data");
                                    fnfcTagDetected = true;
                                    writeToUart(ackData, fnfcWritePort);
                                    writeSKUTimeOut = setTimeout(function() {
                                        writeToUart(writeSKU1, fnfcWritePort);
                                    },1000);
                                    readSKUTimeOut = setTimeout(function() {
                                        writeToUart(readSKUInst, fnfcWritePort);
                                    },3000);
                                    //writeToUart(writeSKU1);
                                }
                                else {
                                    console.log("CheckSum Failed Writing Nack Data");
                                    writeToUart(nackData, fnfcWritePort);
                                }

                            }
                            if (useFNFCData.substr(0, 2) === "*m") {

                                checkSumVal = useFNFCData.substr(useFNFCData.length - 3, 2);
                                console.log("Message String: " + useFNFCData.substr(0, useFNFCData.length - 3));
                                //console.log(a2hex(useFNFCData.substr(0,useFNFCData.length-3)));
                                inputToa2hex = useFNFCData.substr(0, useFNFCData.length - 3);
                                console.log("Input: " + inputToa2hex);
                                console.log("Input Checksum Value: ", checkSumVal);
                                if (checksum8(a2hex(inputToa2hex), checkSumVal)) {

                                    console.log("CheckSum Good *m type .Sending Ack Data");
                                    writeToUart(ackData, fnfcWritePort);
                                    writeSKU2TimeOut = setTimeout(function() {
                                        writeToUart(writeSKU2, fnfcWritePort);
                                    },1000);
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
	    fNfcTimeOut = setTimeout(function() {
	         fNfctestRunning = 'false';
		    console.log("fNfcTimeOut Triggered");
		    console.log(fnfcSKUWrite);
		    console.log(fnfcSKURead);
		    console.log(fnfcTagDetected);
		 if(fnfcTagDetected === true  && fnfcSKUWrite === true && fnfcSKURead === true){
                       console.log("FNFC Test Passed" );
			           Success();
		  }else{
				  console.log("FNFC Test Failed");
			       Failed();
	         	}
	    },9000);
	    //Set test running status to True
            break;
	}
        case "IRNFC_1":
        {
		var irNfcTimeOut;
		var irNfcTimeInt;
		var nfcTagData;
		var irInData="*j;31#" ;
		var irOutData="*k;30#";
		var ackData='*1,K;f3#';
		var nackData='*2,R;29#';
		var readStr = '';
		var prevStr = '';
		var writeSKU1 = "*d;1;0999;B5#";
		var writeSKU2 = "*d;1;0000;D0#";
		var readSKU = "*l;2f#";
		var checkSumVal;
		var inputToa2hex;
		//reinitialize results to false
		irInFound = false;
		irOutFound = false;
		irnfcTagDetected = false;
		irNfctestRunning = 'true';
		if (irnfcFirstRun === true){
			irnfcFirstRun = false;

		irnfcReadPort.on('data', function (data) {
			if(irNfctestRunning === "false"){
		     console.log("TestCase Not Running So  Flushing Data:" + data.toString());
			 flushIRNFCData = data.toString();
			 useIRNFCData = '';
			}
		  else{
		//check if it is begining of string and mark that real reading started
		readStr = (data.toString()).trim();
		console.log("irnfc raw data: " + readStr);
		console.log("Previoysly read  data: " + prevStr);
		//for some reason same string is getting sent multiple times. So for now ignore such strings.
		if (readStr === prevStr){
			 console.log("Same as Prev String so flusing");
			 flushIRNFCData = data.toString();
			 readStr='';
		}
		prevStr = readStr;
		// If first char is * then start collecting data
		if(readStr.substr(0,1) === "*"){
		  console.log("Found * as first char");
		  validReading = true;
		  //whenever * found in first letter think that it is start of message again
		  useIRNFCData='';
		}
		if(validReading){
			useIRNFCData=useIRNFCData + readStr;
			if (readStr.substr(readStr.length-1,1) === "#"){
			validReading = false; 
			console.log("Message To be Used: " + useIRNFCData);
			//Check If it is IR IN Message
			if(useIRNFCData === irInData ){
				console.log("IR IN Match Found");
				irInFound = true;
			}
			if(useIRNFCData === irOutData ){
				console.log("IR Out Match Found");
				irOutFound = true;
			}
		   if(useIRNFCData.substr(0,2) === "*f"){

			   checkSumVal = useIRNFCData.substr(useIRNFCData.length-3,2); 
			   console.log("Message String: " + useIRNFCData.substr(0,useIRNFCData.length-3));
			   //console.log(a2hex(useIRNFCData.substr(0,useIRNFCData.length-3)));
			   inputToa2hex = useIRNFCData.substr(0,useIRNFCData.length-3);
			   console.log("Input: " + inputToa2hex);
			   console.log("Input Checksum Value: ", checkSumVal);
			   if(checksum8(a2hex(inputToa2hex),checkSumVal)){

				console.log("CheckSum Good.Sending Ack Data");
					irnfcTagDetected = true;
					writeToUart(ackData,irnfcWritePort);
					//writeToUart(writeSKU1);
			   }
			   else{ 
				console.log("CheckSum Failed Writing Nack Data");
					writeToUart(nackData,irnfcWritePort);
				   }
				
		   }
		   useIRNFCData = '';
			}
		}
		}
		});
		}
   	    //set 7 seconds timeout
	    irNfcTimeOut = setTimeout(function() {
	         irNfctestRunning = 'false';
		    console.log("irNfcTimeOut Triggered");
		    console.log(irInFound);
		    console.log(irOutFound);
		    console.log(irnfcTagDetected);
		 if(irInFound === true  && irOutFound === true && irnfcTagDetected === true){
                       console.log("IR Test Passed" );
			           Success();
		  }else{
				  console.log("IR Test Failed");
			       Failed();
	         	}
	    },7000);
	    //Set test running status to True
            break;
	}
        case "IRNFC_2":
    {
        console.log("IRNFC_2 selected");
        Success();
        break;
    }
    case "IRNFC_3":
    {
        console.log("IRNFC_3 selected");
        Success();
        break;
    }
    case "IRNFC_4":
        {
            console.log("IRNFC_4 selected");
            console.log("Push the power button");
            console.log("Is the Power LED Turned Green?");
            Success();
            break;
        }

    case "TRIAC_1":
    {
	    console.log("TRIAC_1 Start");
	    var outputtr1=b.HIGH;
	    var expectedInputtr1 =b.HIGH;
            var oPintr1="P9_16";
            var iPintr1="P9_42";
            b.pinMode(oPintr1,b.OUTPUT);
	    b.pinMode(iPintr1,b.INPUT);
            b.digitalWrite(oPintr1,outputtr1);
            console.log("after digitalWrite");
	    b.digitalRead(iPintr1,checkResultTRIAC1);

            firstTimer = setTimeout(function () {
            console.log("firstTimerTimeOutCalled");
            console.log("timeout cleared");
        },2000);

	    break;
    }

    case "ESR_1":
    {
	    console.log("ESR1 Start");
	    var output=b.HIGH;
	    var expectedInput =b.HIGH;
            var oPin="P9_14";
            var iPin="P9_27";
            b.pinMode(oPin,b.OUTPUT);
	    b.pinMode(iPin,b.INPUT);
            b.digitalWrite(oPin,output);
            console.log("after digitalWrite");
	    b.digitalRead(iPin,checkResultESR1);

            firstTimer = setTimeout(function () {
            console.log("Second function called");
            console.log("timeout cleared");
        },2000);

	    break;

	    /*
        console.log("ESR_1 selected");
        console.log("Just Sending Success");

        var firstTimer = setTimeout(function () {
            console.log("Second function called");
            console.log("timeout cleared");
        },2000);

        var secondTimer = setTimeout(function () {
            console.log("First function called");
            clearTimeout(firstTimer);
            Success();
        },1000);

//        Success();
        break;
	    */
    }
}

function writeToUart(message,toPort){
   console.log("Writing " , message);
   toPort.write(message, function(err) {
    if (err) {
    return console.log('Error on write: ', err.message);
   }
   console.log('message written');
  });
}

function a2hex(str) {
          var arr = [];
          for (var i = 0, l = str.length; i < l; i ++) {
                      var hex = Number(str.charCodeAt(i)).toString(16);
                      arr.push(hex);
                    }
          return arr.join('');
}

function hex2a(hexx) {
            console.log('In hex2a',hexx);
            var hex = hexx.toString();//force conversion
            console.log('Hello:',hex);
            var str = '';
            for (var i = 0; i < hex.length; i += 2)
                        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return str;
}

function checksum8(inputStr,checksumValue) {

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

        for (i=0; i<strN.length; i++) {
            if (strN.charAt(i) == " ") continue;

            v = strHex.indexOf(strN.charAt(i));
            if (v < 0) {
                result = -1;
                break;
            }
            result += v * fctr;

            if (fctr == 16) fctr = 1;
            else            fctr = 16;
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
            strResult = strHex.charAt(Math.floor(result/16)) + strHex.charAt(result%16);
        }
	console.log("Computed Checksum: " + strResult);
        if (strResult === inputCheckSum){
            return true;
        }
        else{
            return false;
        }
}
function checkResultESR1(result){
	                    console.log('Result = ' + result.value);
	                    var b2 = require('bonescript');
                            var oPin="P9_14";
	                    var expectedInput2 =b2.HIGH;
	                    console.log('Error = ' + result.err);
	                    if (result.value==expectedInput2) {
	                           console.log('ESR_1: Success');
                                   b2.digitalWrite(oPin,b2.LOW);
				   clearTimeout(firstTimer);
	                           Success();
                            }
	                    else{
		                  console.log('ESR_1: Fail');
                                   b2.digitalWrite(oPin,b2.LOW);
				  clearTimeout(firstTimer);
		                  Failed();
		            }
}

function checkResultTRIAC1(result){
	                    console.log('Triac1 Result = ' + result.value);
	                    var b2 = require('bonescript');
                            var oPin="P9_16";
	                    var expectedInput2 =b2.HIGH;
	                    console.log('Error = ' + result.err);
	                    if (result.value==expectedInput2) {
	                           console.log('ESR_1: Success');
                                   b2.digitalWrite(oPin,b2.LOW);
				   clearTimeout(firstTimer);
	                           Success();
                            }
	                    else{
		                  console.log('ESR_1: Fail');
                                   b2.digitalWrite(oPin,b2.LOW);
				  clearTimeout(firstTimer);
		                  Failed();
		            }
}
});

module.exports = router;

