var express = require('express');
var router = express.Router();
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
