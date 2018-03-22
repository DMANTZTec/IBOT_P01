var express = require('express');
var router = express.Router();
//var HUL_testjiglist = require('../config/HUL_TestJigList.json');

var fs=require('fs');
/* GET home page. */
var firstTimer;
var secondTimer;
//var SerialPort = require('serialport');
//var rdport2 = new SerialPort('/dev/ttyO2');
var dataFromSP2;
var hiveMappingData =
{
    "TC Run Detail Fields" : [
    {"TEST_RUN_ID":"F01"},
    {"TCID":"F02"},
    {"LAST_STATUS":"F03"},
    {"TRY_CNT":"F04"},
    {"FAIL_CNT":"F05"},
    {"SUCCESS_CNT":"F06"},
    {"DESC":"F07"} ],
    "TC Run Summary Fields" : [
    {"TEST_RUN_ID":"F01"},
    {"DUT_ID":"F02"},
    {"DUT_HW_VER":"F03"},
    {"DUT_SW_VER":"F04"},
    {"DUT_NM":"F05"},
    {"FIXTURE_TYPE_ID":"F06"},
    {"SN":"F07"} ,
    {"HW_VER":"F08"},
    {"SW_VER":"F09"},
    {"MFGDT":"F10"},
    {"TEST_START_TS":"F11"},
    {"TEST_END_TS":"F12"},
    {"TEST_RESULT":"F13"},
    {"TOTAL_CNT":"F14"},
    {"TESTED_CNT":"F15"},
    {"SUCCESS_CNT":"F16"},
    {"FAIL_CNT":"F17"},
    {"MANUFACTURER":"F18"},
    {"FIXTURE_NM":"F19"}
]
};

router.all('/', function(req, res, next)
{
    var request = req.body.inputJsonStr;
    var jsonrequest=JSON.parse(request);
    var DUTID_TCID=jsonrequest.DUTID_TCID;
    var StepNum=jsonrequest.StepNum;
    console.log(DUTID_TCID + StepNum);
    res.setHeader("Content-Type", "text/plain");
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
            console.log("FNFC_1 selected");
            /*
              rdport2.on('data', function (data) {
                    console.log('Data:', data);
                    dataFromSP2=data;
                    console.log('ASCII:', data.toString());
                });
            */
            /*
                        firstTimer = setTimeout(function ()  {
                            console.log("Second function called");
                            console.log("timeout cleared");
                        },10000);

                        secondTimer = setTimeout(function () {
                            console.log("First function called");
                            //clearTimeout(firstTimer);
                            Success();
                        },1000);
             */
            Success();
            break;
        }
        case "IRNFC_1":
        {
            console.log("IRNFC_1 selected");
            /*
              rdport2.on('data', function (data) {
                    console.log('Data:', data);
                    dataFromSP2=data;
                    console.log('ASCII:', data.toString());
                });
            */
/*
            firstTimer = setTimeout(function ()  {
                console.log("Second function called");
                console.log("timeout cleared");
            },10000);

            secondTimer = setTimeout(function () {
                console.log("First function called");
                //clearTimeout(firstTimer);
                Success();
            },1000);
 */
            Success();
            break;
        }
        case "IRNFC_2":
    {
        console.log("IRNFC_2 selected");
        console.log("CC_1 step 1");
        Success();
        break;
    }
    case "IRNFC_3":
    {
        console.log("IRNFC_3 selected");
        console.log("CC_1 step 1");
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
    case "ESR_1":
    {
        console.log("ESR_1 selected");
        console.log("Just Sending Success");

        firstTimer = setTimeout(function () {
            console.log("Second function called");
            console.log("timeout cleared");
        },6000);

        secondTimer = setTimeout(function () {
            console.log("First function called");
            clearTimeout(firstTimer);
            Success();
        },2000);

//        Success();
        break;
    }
}
/*switch(DUTID_TCID){
    case "HUL1_1":
    {
        console.log("HUL1_1 selected");
        console.log("Voltage of 5V from Regulator");
        Success();
        break;
    }
    case "HUL1_2":
    {
        console.log("HUL1_2 selected");
        console.log("Voltage 3.3 from Regulator");
        Success();
        break;
    }
    case "HUL1_3":
    {
        console.log("HUL1_3 selected");
        console.log("SV Voltage Check");
        Success();
        break;
    }
    case "HUL1_4":
    {
        console.log("HUL1_4 selected");
        console.log("RV Voltage Check");
        Success();
        break;
    }
    case "HUL1_5":
    {
        console.log("HUL1_5 selected");
        console.log("BP Voltage Check");
        Success();
        break;
    }
    case "HUL1_6":
    {
        console.log("HUL1_6 selected");
        console.log("SV Alert Check");
        Success();
        break;
    }
    case "HUL1_7":
    {
        console.log("HUL1_7 selected");
        console.log("RV Alert Check");
        Success();
        break;
    }
    case "HUL1_8":
    {
        console.log("HUL1_8 selected");
        console.log("Voltage 3.3 from Regulator");
        Success();
        break;
    }
    case "HUL1_9":
    {
        console.log("HUL1_9 selected");
        console.log("BP Alert Check");
        Success();
        break;
    }
    case "HUL1_10":
    {
        console.log("HUL1_10 selected");
        console.log("BP Enable  Check");
        Success();
        break;
    }
    case "HUL1_11":
    {
        console.log("HUL1_11 selected");
        console.log("LPS Check");
        Success();
        break;
    }
    case "HUL1_12":
    {
        console.log("HUL1_12 selected");
        console.log("LCS Check");
        Success();
        break;
    }
    case "HUL1_13":
    {
        console.log("HUL1_13 selected");
        console.log("LPS Check");
        Success();
        break;
    }
    case "HUL1_14":
    {
        console.log("HUL1_14 selected");
        console.log("Flow Sensor Check");
        Success();
        break;
    }
    case "HUL1_15":
    {
        console.log("HUL1_15 selected");
        console.log("UART 0");
        Success();
        break;
    }
    case "HUL1_16":
    {
        console.log("HUL1_16 selected");
        console.log("UART 0");
        Success();
        break;
    }
    case "HUL1_17":
    {
        console.log("HUL1_17 selected");
        console.log("LCD Signal Check ?");
        Success();
        break;
    }
    case "HUL1_18":
    {
        console.log("HUL1_18 selected");
        console.log("JTAG Signal Check ( If Flashing is working then no need to test)");
        Success();
        break;
    }
    case "HUL1_19":
    {
        console.log("HUL1_19 selected");
        console.log("LCS Disable & LCS Check");
        Success();
        break;
    }
    case "HUL1_20":
    {
        console.log("HUL1_20 selected");
        console.log("Pump Enable Check");
        Success();
        break;
    } case "HUL1_21":
    {
    console.log("HUL1_21 selected");
    console.log("BP Enable Check ");
    Success();
    break;
    }
    case "HUL1_22":
    {
        console.log("HUL1_21 selected");
        console.log("LCS Enable & LPS Disable");
        Success();
        break;
    }
    case "HUL1_23":
    {
        console.log("HUL1_23 selected");
        console.log("Pump Enable Check");
        Success();
        break;
    }
    case "HUL1_24":
    {
        console.log("HUL1_24 selected");
        console.log("If all cases are successful , prompt for IQ Bar Code");
        Success();
        break;
    }
    case "HUL2_1":
    {
        console.log("HUL2_1 selected");
        console.log("LCS Open & Check");
        Success();
        break;

    }
    {
        console.log("HUL2_2 selected");
        console.log("LPS Open & Check");
        Success();
        break;

    }
    {
        console.log("HUL2_3 selected");
        console.log("SV Short & Check");
        Success();
        break;

    }
    {
        console.log("HUL2_4 selected");
        console.log("RO Short & Check");
        Success();
        break;

    }
    {
        console.log("HUL2_5 selected");
        console.log("BP Short & Check");
        Success();
        break;

    }
    {
        console.log("HUL2_6 selected");
        console.log("FS Tamper Check");
        Success();
        break;

    }
    {
        console.log("HUL2_7 selected");
        console.log("RO Tamper Check");
        Success();
        break;

    }
    {
        console.log("HUL2_8 selected");
        console.log("If all cases are successful wait for 3 minutes ");
        Success();
        break;

    }
    {
        console.log("HUL2_9 selected");
        console.log("If 1-8 are successful Generate Bar Code & communicate to printer");
        Success();
        break;

    }


}*/
});

module.exports = router;






    /*for(i=0;i<testcases.length;i++)
    {
        if(testcases[i].TCID==current_TC)
        {
            if(testcases[i].test==check)
            {
                var status="success";
            }
            else
            {
                var status="failed";
            }
        }
    }
    response1={status:status};
    res.send(response1);
    //res.render('index', { title: 'Express' });*/
