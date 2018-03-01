var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);
var modal1 = document.getElementById('myModal1');
var modal = document.getElementById('SettingsModalID');
var modal2 = document.getElementById('myModal2');
var jigtype = document.getElementById('TestJigSelectList');
var testModeOption = document.getElementById('testModeOption');

var testMode = "manual"; //default to auto testing mode
var testCaseData;
var testJigData;
var testJigList;
var LoadedTestCase;
var PreviousTestcase;
var PreviousTestCaseButtonId;
var testResultSummary={TotalCnt:0,TestedCnt:0,SuccessCnt:0,FailCnt:0};
var testedTestCases=[];
var testResultDetail={"DETAILS":[]};
var TestResultDetails=
    {
        "DUT_ID": "XXX",
        "DUT_HW_VER": "XX:YY",
        "DUT_SW_VER": "PP:QQ",
        "DUT_NM": "SHORTNM",
        "SN":"XXXXXXX",
        "HW_VER":"XX:XX",
        "SW_VER":"XX:XX",
        "MFGDT":"DD-MON-YYYY",
        "TESTCASE_FILE_NM":"TestCaseFileName",
        "TEST_START_TS":"STARTTIMESTAMP",
        "TEST_END_TS":"ENDTIMESTAMP",
        "TEST_RESULT": "SUCCESS/FAIL",
        "TOTAL_CNT":testResultSummary.TotalCnt,
        "TESTED_CNT": testResultSummary.TestedCnt,
        "SUCCESS_CNT": testResultSummary.SuccessCnt,
        "FAIL_CNT":testResultSummary.FailCnt,
        "DETAILS": []
    };
var TestResultDetailsTemplate=
    {
        "DUT_ID": "XXX",
        "DUT_HW_VER": "XX:YY",
        "DUT_SW_VER": "PP:QQ",
        "DUT_NM": "SHORTNM",
        "SN":"XXXXXXX",
        "HW_VER":"XX:XX",
        "SW_VER":"XX:XX",
        "MFGDT":"DD-MON-YYYY",
        "TESTCASE_FILE_NM":"TestCaseFileName",
        "TEST_START_TS":"STARTTIMESTAMP",
        "TEST_END_TS":"ENDTIMESTAMP",
        "TEST_RESULT": "SUCCESS/FAIL",
        "TOTAL_CNT":testResultSummary.TotalCnt,
        "TESTED_CNT": testResultSummary.TestedCnt,
        "SUCCESS_CNT": testResultSummary.SuccessCnt,
        "FAIL_CNT":testResultSummary.FailCnt,
        "DETAILS": []
    };
function UpdateTestJigData(){
    //Set TestJigType in the backend
    //LoadTestJigData
}


function checkIfAllCasesRan()
{
    var finalResult;
    if(testedTestCases.length===testCaseData.TestCases.length){
        //document.getElementById('TestCaseRunText').value="All test cases had ran";
        if (testResultSummary.SuccessCnt===testResultSummary.TotalCnt){
            finalResult="PASSED";
        }
        else{
            finalResult="FAILED";
        }
        document.getElementById('TestCasesFinalResult').value="Testing Completed  " + finalResult;
        document.getElementById('TestCasesFinalResult').style.display="block";
        var curDate = new Date();
        var curTimeStamp = curDate.getTime();
        TestResultDetails.TEST_RESULT=finalResult;
        TestResultDetails.TEST_END_TS=curTimeStamp;
        TestResultDetails.TESTED_CNT=testResultSummary.TestedCnt;
        TestResultDetails.TOTAL_CNT=testResultSummary.TotalCnt;
        TestResultDetails.SUCCESS_CNT=testResultSummary.SuccessCnt;
        TestResultDetails.FAIL_CNT=testResultSummary.FailCnt;
        TestResultDetails.DETAILS = testResultDetail;
        //upload Final Results
        UploadTestResults();

            setTimeout(function(){
                //document.location.reload(true);
                LoadTestJigDataSync();
            },4000);

    }
}

function UpdateTestResults(testCaseId,result)
{
//update Result Summary & Details
    testResultSummary.TotalCnt=testResultSummary.TotalCnt+1;
   if (result == "success") {
        document.getElementById('TestCaseRunStatus').style.color="green";
        document.getElementById('TestCaseRunStatus').value = "SUCCESS";
    }
    else {
        document.getElementById('TestCaseRunStatus').style.color="red";
        document.getElementById('TestCaseRunStatus').value = "FAILED";
    }
    if (!testedTestCases.includes(testCaseId))
    {
        testedTestCases.push(testCaseId);
        for (var i = 0; i < testCaseData.TestCases.length; i++)
        {
            if (testCaseData.TestCases[i].TCID == testCaseId)
            {
                testResultSummary.TestedCnt=testResultSummary.TestedCnt+1;
                testResultDetail.DETAILS[i].TCID=LoadedTestCase.TCID;
                testResultDetail.DETAILS[i].TCSHORTNM=LoadedTestCase.TCSHORTNM;
                testResultDetail.DETAILS[i].DESC=LoadedTestCase.DESC;
                testResultDetail.DETAILS[i].LAST_STATUS = result;
                testResultDetail.DETAILS[i].TRY_CNT = 1;
                if (result == "success") {
                    testResultDetail.DETAILS[i].SUCCESS_CNT = 1;
                    testResultSummary.SuccessCnt=testResultSummary.SuccessCnt+1;
                    document.getElementById('TestCaseRunStatus').style.color="green";
                    document.getElementById('TestCaseRunStatus').value = "SUCCESS";
                }
                else {
                    testResultDetail.DETAILS[i].FAIL_CNT = 1;
                    testResultSummary.FailCnt=testResultSummary.FailCnt+1;
                    document.getElementById('TestCaseRunStatus').style.color="red";
                    document.getElementById('TestCaseRunStatus').value = "FAILED";
                }
            }
        }
    }
    else
    {
        for (i = 0; i < testCaseData.TestCases.length; i++)
        {
            if (testCaseData.TestCases[i].TCID == testCaseId)
            {
                testResultDetail.DETAILS[i].TCID=LoadedTestCase.TCID;
                testResultDetail.DETAILS[i].TCSHORTNM=LoadedTestCase.TCSHORTNM;
                testResultDetail.DETAILS[i].DESC=LoadedTestCase.DESC;
                testResultDetail.DETAILS[i].TRY_CNT = testResultDetail.DETAILS[i].TRY_CNT + 1;
                if (result == "success") {
                    testResultDetail.DETAILS[i].SUCCESS_CNT = testResultDetail.DETAILS[i].SUCCESS_CNT+1;
                    if(testResultDetail.DETAILS[i].LAST_STATUS=="failed") {
                        testResultSummary.SuccessCnt = testResultSummary.SuccessCnt + 1;
                        testResultSummary.FailCnt = testResultSummary.FailCnt - 1;
                    }
                }
                else {
                    testResultDetail.DETAILS[i].FAIL_CNT = testResultDetail.DETAILS[i].FAIL_CNT + 1;
                    if(testResultDetail.DETAILS[i].LAST_STATUS=="success") {
                        testResultSummary.SuccessCnt = testResultSummary.SuccessCnt - 1;
                        testResultSummary.FailCnt = testResultSummary.FailCnt + 1;
                    }
                }
                testResultDetail.DETAILS[i].LAST_STATUS = result;
            }
        }
    }
    myConsole.log(testResultDetail);
    myConsole.log(testResultSummary);
    document.getElementById('tested_text_box').value=testResultSummary.TestedCnt;
    document.getElementById('success_text_box').value=testResultSummary.SuccessCnt;
    document.getElementById('fail_text_box').value=testResultSummary.FailCnt;
    checkIfAllCasesRan(); //this includes uploading results
}

function ResetScreen(){
    TestResultDetails = TestResultDetailsTemplate;
    document.getElementById('tested_text_box').value="";
    document.getElementById('success_text_box').value="";
    document.getElementById('fail_text_box').value="";
    document.getElementById('totalCasesTxtBox').value = "";
    //document.getElementById('TestCaseTitle').value="";
    document.getElementById('TestCaseRunText').value="";
    document.getElementById('TestCaseRunStatus').value="";
    document.getElementById('TestCaseRunInstruction').value = "";
    document.getElementById('TestCaseRunTimer').value = "";
    document.getElementById('TestCasesFinalResult').value = "";
    Disable();
    myConsole.log("Exiting ResetScreen");
}

function LoadTestJigData() {
    //Initialize Test Jig Data
    //Initialize Test Case Data
    initialize();
    var xhttp = new XMLHttpRequest();
    var url = "http://localhost:3001/LoadTestJigData_BE";
    //making a synchronous request here.
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function ()
    {
        if ((this.readyState == 4) && (this.status == 200))
		{
		    document.getElementById('tc').style.display='block';
		    myConsole.log("after getting response" + xhttp.responseText);
		    var response=JSON.parse(this.responseText);
		    if(response.status=="success") {
			testJigList=response.TestJigList;
			testJigData=response.TestJigData;
			testCaseData = response.TestCaseData;
              		//Fill TestJig Details in to Results Detail.
                	TestResultDetails.DUT_ID =testJigData.DUT_ID;
                	TestResultDetails.DUT_HW_VER =testJigData.HW_VER;
                	TestResultDetails.DUT_SW_VER =testJigData.SW_VER;
                	TestResultDetails.DUT_NM =testJigData.DUT_NM;
                	TestResultDetails.TESTCASE_FILE_NM =testJigData.TestCaseFile;
			for(i=0;i<testCaseData.TestCases.length;i++)
			{
			    testResultDetail.DETAILS.push({});
			}
			myConsole.log(testResultDetail.DETAILS);

			var totalCases = Object.keys(testCaseData.TestCases).length;
			document.getElementById('TestJigType').value = testJigData.DUT_NM;
			document.getElementById('totalCasesTxtBox').value = totalCases;
			myConsole.log(testCaseData.TestCases.length);

			document.getElementById("tc").style.display = "none";
			for(var i=0;i<testCaseData.TestCases.length;i++)
			{
			    var button = document.createElement("BUTTON");
			    var ButtonID=("_"+ i);
			    document.getElementById('tc').appendChild(button).setAttribute("id",ButtonID);
			    button.innerText=testCaseData.TestCases[i].TCSHORTNM;
			    testCaseData.TestCases[i].UILabelID=ButtonID;
			    button.onclick= function()
			    {
				var ClickedBtnID=event.srcElement.id;
				var j=ClickedBtnID.slice(1);
				myConsole.log(j);
				LoadTestCase(testCaseData.TestCases[j].TCID,testCaseData.TestCases[j].UILabelID);
			    }
			}
			LoadTestCase(testCaseData.TestCases[0].TCID,testCaseData.TestCases[0].UILabelID);
			EnableOnLoad();
		    }
		    else
		    {
			var error=response.error;
			document.getElementById('TestJigType').value = error;
		    }
		}
    };
    xhttp.send();
}

function LoadTestJigDataSync() {
    //Initialize Test Jig Data
    Disable() //disable all clickable elements
    initialize();
    var xhttp = new XMLHttpRequest();
    var url = "http://localhost:3001/LoadTestJigData_BE";
    //making a synchronous request here.
    xhttp.open("POST", url, false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    myConsole.log("after getting response" + xhttp.responseText);
    var response = JSON.parse(xhttp.responseText);
    if (response.status == "success") {
        testJigList = response.TestJigList;
        testJigData = response.TestJigData;
        testCaseData = response.TestCaseData;
        //Fill TestJig Details in to Results Detail.
        TestResultDetails.DUT_ID = testJigData.DUT_ID;
        TestResultDetails.DUT_HW_VER = testJigData.HW_VER;
        TestResultDetails.DUT_SW_VER = testJigData.SW_VER;
        TestResultDetails.DUT_NM = testJigData.DUT_NM;
        TestResultDetails.TESTCASE_FILE_NM = testJigData.TestCaseFile;
        for (i = 0; i < testCaseData.TestCases.length; i++) {
            testResultDetail.DETAILS.push({});
        }
        myConsole.log(testResultDetail.DETAILS);
        var totalCases = Object.keys(testCaseData.TestCases).length;
        document.getElementById('TestJigType').value = testJigData.DUT_NM;
        document.getElementById('totalCasesTxtBox').value = totalCases;
        myConsole.log(testCaseData.TestCases.length);
        document.getElementById("tc").style.display = "none";
        for (var i = 0; i < testCaseData.TestCases.length; i++) {
            var button = document.createElement("BUTTON");
            var ButtonID = ("_" + i);
            document.getElementById('tc').appendChild(button).setAttribute("id", ButtonID);
            button.innerText = testCaseData.TestCases[i].TCSHORTNM;
            testCaseData.TestCases[i].UILabelID = ButtonID;
            button.onclick = function () {
                var ClickedBtnID = event.srcElement.id;
                var j = ClickedBtnID.slice(1);
                myConsole.log(j);
                LoadTestCase(testCaseData.TestCases[j].TCID, testCaseData.TestCases[j].UILabelID);
            }
        }
        LoadTestCase(testCaseData.TestCases[0].TCID, testCaseData.TestCases[0].UILabelID);
        EnableOnLoad();
    }
}

function ReloadTestJigData(TestJigType)
{
    //Set TestJigType in the backend
    //LoadTestJigData
    var xhttp = new XMLHttpRequest();
    var url = "http://localhost:3001/LoadTestJigData_BE/Reload_BE";
    xhttp.open("POST", url, false);
    var request={"TestJigType":TestJigType};
    var params = JSON.stringify(request);
    myConsole.log(params);
    var params = "inputJsonStr" + "=" + params;
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(params);
    myConsole.log("after getting response" + xhttp.responseText);
    var response=JSON.parse(xhttp.responseText);
    if(response.success=="success")
    {
        //document.location.reload(true);
        LoadTestJigDataSync();
    }
    /*
    xhttp.onreadystatechange = function () {
        if ((this.readyState == 4) && (this.status == 200)){
            myConsole.log("after getting response" + xhttp.responseText);
            var response=JSON.parse(this.responseText);
            testJigData=response.TestJigData;
            if(response.success=="success") {
                LoadTestJigDataSync();
            }
            }

    };
    xhttp.send(params);
    */

}

function nextTestCase()
{
    var NextTestcase;
    for(i=0;i<testCaseData.TestCases.length;i++)
    {
        if(testCaseData.TestCases[i].TCID==LoadedTestCase.TCID)
        {
            NextTestcase=testCaseData.TestCases[i+1];
            myConsole.log(NextTestcase);
        }
    }
    LoadTestCase(NextTestcase.TCID,NextTestcase.UILabelID);
}

function initialize()
{
    ResetScreen();
    //Initialize Test Case Data
    //Reset Test Result Details
    TestResultDetails = TestResultDetailsTemplate;
    testResultDetail={"DETAILS":[]};
    testResultSummary={TotalCnt:0,TestedCnt:0,SuccessCnt:0,FailCnt:0};
    document.getElementById('tc').style.display='block';
    testedTestCases=[];

}

function retryTestCase()
{
    LoadTestCase(LoadedTestCase.TCID,LoadedTestCase.UILabelID);
    RunTestCase(LoadedTestCase.TCID,LoadedTestCase.Steps[0].StepNumber);
}
function LoadTestCase(tcid,id)
{
    document.getElementById('TestCaseRunStatus').value = "";
    document.getElementById('TestCasesFinalResult').style.display="none";
    if(PreviousTestcase==undefined){}
    else
    document.getElementById(PreviousTestCaseButtonId).style.background="blue";
    for(i=0;i<testCaseData.TestCases.length;i++)
    {
        if (tcid == testCaseData.TestCases[i].TCID)
        {
            LoadedTestCase=testCaseData.TestCases[i];
            LoadedTestCase.TCStatus="loaded";
            LoadedTestCase.TCStartTime="";
            LoadedTestCase.TCEndTime="";
            LoadedTestCase.NumberOfSteps="";
            LoadedTestCase.LastRunStep="";

            PreviousTestcase=LoadedTestCase;
            PreviousTestCaseButtonId=id;
            myConsole.log("PSK:Test Case Short Name: " + LoadedTestCase.TCSHORTNM);
            //document.getElementById('TestCaseTitle').value = "Testing";
            //document.getElementById('TestCaseTitle').value = "TCID:"+LoadedTestCase.TCID +"   "+ LoadedTestCase.TCSHORTNM;
            //document.getElementById('testcase_nm').value = LoadedTestCase.TCSHORTNM;
            document.getElementById('TestCaseRunText').value = LoadedTestCase.TCID + " " + LoadedTestCase.DESC;
            document.getElementById(id).style.background="orange";
            document.getElementById(id).innerText=LoadedTestCase.TCSHORTNM;
        }
    }
}

function RunTestCase(tcid,StepNum)
{
    myConsole.log(tcid);

    var tciModal = document.getElementById('TestcasesModalId');
    var xhttp;
    var url = "http://localhost:3001/RunTestCase_BE";
    var response;
    var result;
    LoadedTestCase.TCStartTime = x;
    myConsole.log(LoadedTestCase);
    Disable();
    var DUTID_TCID = testCaseData.DUT + "_" + tcid;
    var request =
        {
            DUTID_TCID: DUTID_TCID, StepNum: StepNum
        };
    var params = JSON.stringify(request);
    params = "inputJsonStr" + "=" + params;
    myConsole.log(params);
    switch (DUTID_TCID)
    {
        case "M10_1" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "M10_2" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "M10_3" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "M10_4" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
            
        case "M10_5" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "M10_6" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "M10_7" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
            
        case "M10_8" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
            
        case "M10_9" :
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;

        case "CC_1":
            myConsole.log("CC_1 selected");
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "CC_2":
            myConsole.log("CC_2 step 1");
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;

        case "FNFC_1":
         myConsole.log("FNFC TC1 selected");
         myConsole.log("Yes going through new logic");
         //document.getElementById('TestCaseRunStatus').style.display="none";
         document.getElementById('TestCaseRunInstruction').style.display="block";
	 document.getElementById('TestCaseRunInstruction').style.color="blue";
	 document.getElementById('TestCaseRunInstruction').value = "Place TestStrip on Filter NFC Sensor";
	 var fnfctimerCount = 10;
	 document.getElementById('TestCaseRunTimer').style.display="block";
	 document.getElementById('TestCaseRunTimer').style.color="orange";
	 document.getElementById('TestCaseRunTimer').value="";
	 var fnfccountDown = setInterval(function () {
	 document.getElementById('TestCaseRunTimer').value = fnfctimerCount;
	 fnfctimerCount = fnfctimerCount - 1;
	 myConsole.log("Counting down :" + fnfctimerCount);

         }, 1000);
          xhttp = new XMLHttpRequest();
         xhttp.open("POST", url, true);
         xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhttp.onreadystatechange = function ()
         {

            if ((this.readyState == 4) ) {
                    if(this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    myConsole.log("after getting response" + xhttp.responseText);
                    var fnfcresult = response.status;
                        }else {
                       fnfcresult="failed";
										                    }
                   clearInterval(fnfccountDown);
                   myConsole.log(fnfccountDown);
                   myConsole.log("after clearInterval");
                    myConsole.log("TestCase: " + tcid);
                 document.getElementById('TestCaseRunInstruction').style.display="none";
                  document.getElementById('TestCaseRunTimer').style.display="none";
                 //document.getElementById('TestCaseRunStatus').style.display="block";
                  UpdateTestResults(tcid,fnfcresult);
                  //checkIfAllCasesRan();
                  myConsole.log(testResultDetail);
               myConsole.log(testResultSummary);
                Enable();
                }
        };
        xhttp.send(params);
       break;
      case "IRNFC_1":
         myConsole.log("IRNFC TC1 selected");
         myConsole.log("Yes going through new logic");
         //document.getElementById('TestCaseRunStatus').style.display="none";
         document.getElementById('TestCaseRunInstruction').style.display="block";
	 document.getElementById('TestCaseRunInstruction').style.color="blue";
	 document.getElementById('TestCaseRunInstruction').value = "Place TestStrip on IRNFC Sensor and remove it";
	 var timerCount = 10;
	 document.getElementById('TestCaseRunTimer').style.display="block";
	 document.getElementById('TestCaseRunTimer').style.color="orange";
	 document.getElementById('TestCaseRunTimer').value="";
	 countDown = setInterval(function () {
	 document.getElementById('TestCaseRunTimer').value = timerCount;
	 timerCount = timerCount - 1;
	 myConsole.log("Counting down :" + timerCount);

         }, 1000);
          xhttp = new XMLHttpRequest();
         xhttp.open("POST", url, true);
         xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhttp.onreadystatechange = function ()
         {

            if ((this.readyState == 4) ) {
                    if(this.status == 200) {
                    var response = JSON.parse(this.responseText);
                    myConsole.log("after getting response" + xhttp.responseText);
                   var result = response.status;
                        }else {
                       result="failed";
										                    }
                   clearInterval(countDown);
                   myConsole.log(countDown);
                   myConsole.log("after clearInterval");
                    myConsole.log("TestCase: " + tcid);
                 document.getElementById('TestCaseRunInstruction').style.display="none";
                  document.getElementById('TestCaseRunTimer').style.display="none";
                 //document.getElementById('TestCaseRunStatus').style.display="block";
                  UpdateTestResults(tcid,result);
                  //checkIfAllCasesRan();
                  myConsole.log(testResultDetail);
               myConsole.log(testResultSummary);
                Enable();
                }
        };
        xhttp.send(params);
       break;
        case "IRNFC_2":
            myConsole.log("IRNFC TC2 selected");
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;
        case "IRNFC_3":
        myConsole.log("IRNFC TC3 selected");
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", url, false);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(params);
        myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;

        case "IRNFC_4":
            myConsole.log("IRNFC TC3 selected");
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response=JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            //checkIfAllCasesRan();
            myConsole.log(testResultDetail);
            myConsole.log(testResultSummary);
            Enable();
            break;

        case "ESR_1":
            myConsole.log("Running TC ESR_1");
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response = JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            Enable();
            break;
        case "TRIAC_1":
            myConsole.log("Running TC TRIAC_1");
            xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(params);
            myConsole.log("after getting response" + xhttp.responseText);
            response = JSON.parse(xhttp.responseText);
            result=response.status;
            UpdateTestResults(tcid,result);
            Enable();
            break;
    }
	if(testMode==="auto"){
        nextTestCase();
        RunTestCase(LoadedTestCase.TCID,LoadedTestCase.Steps[0].StepNumber);
    }
}
function Disable() 
{
    document.getElementById('start_icon').style.pointerEvents = "none";
    document.getElementById('next_icon').style.pointerEvents = "none";
    document.getElementById('retry_icon').style.pointerEvents = "none";
    document.getElementById('setting_icon').style.pointerEvents = "none";
    document.getElementById('reset').style.pointerEvents = "none";
    document.getElementById('view_results').style.pointerEvents = "none";
    document.getElementById('scanner_image').style.pointerEvents = "none";
}
function Enable()
{
    document.getElementById('start_icon').style.pointerEvents = "auto";
    document.getElementById('next_icon').style.pointerEvents = "auto";
    document.getElementById('retry_icon').style.pointerEvents = "auto";
    document.getElementById('setting_icon').style.pointerEvents = "auto";
    document.getElementById('reset').style.pointerEvents = "auto";
    document.getElementById('view_results').style.pointerEvents = "auto";
    document.getElementById('scanner_image').style.pointerEvents = "auto";
}

function EnableOnLoad()
{
    document.getElementById('setting_icon').style.pointerEvents = "auto";
    document.getElementById('reset').style.pointerEvents = "auto";
    document.getElementById('scanner_image').style.pointerEvents = "auto";
    document.getElementById('BoardDetail').readOnly=false;
    document.getElementById('BoardDetail').focus();
    document.getElementById('BoardDetail').value="";

}
    /*var xhttp = new XMLHttpRequest();
    var url = "http://localhost:3001/RunTestCase_BE";
    var request =
        {
            DUTID_TCID:DUTID_TCID,StepNum:StepNum
        };
    var params = JSON.stringify(request);
    myConsole.log(params);
    var params = "inputJsonStr" + "=" + params;
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function ()
    {
        if ((this.readyState == 4) && (this.status == 200))
        {
            myConsole.log("after getting response" + xhttp.responseText);
            var status=JSON.parse(this.responseText);
            LoadedTestCase.TCEndTime=x;
            attempts=attempts+1;
                if (!tested.includes(request.testcase_id)) {
                    tested.push(request.testcase_id);
                    if(status.status=="success")
                    {
                        success = success + 1;
                        //document.getElementById('message').innerHTML=current_TC +
                        //    "  tested successfully enter next button to test next testcase";
                        document.getElementById('success_text_box').value=success;
                    }
                    else
                    {
                        //document.getElementById('message').innerHTML=current_TC +
                         //   "  testing failed click on retry icon to retest or click on next icon to test next testcase";
                        failed=failed+1;
                        document.getElementById('fail_text_box').value=failed;
                    }
                    document.getElementById('tested_text_box').value=tested.length;
                }
            myConsole.log(success);
            myConsole.log(failed);
            myConsole.log(tested.length);
            myConsole.log(attempts);

           // document.getElementById('tested_text_box').value=tested;
            document.getElementById('retry_icon').style.pointerEvents="auto";
            document.getElementById('next_icon').style.pointerEvents="auto";
            document.getElementById('start_icon').style.pointerEvents="none";
        }
    };
    xhttp.send(params);
}*/
function DisplaySettingsModal()
{
    modal.style.display = "block";
    jigtype.innerHTML="";
    jigtype.innerHTML = '<option>' + "SelectJigType" + '</option>';
    for (var i = 0; i < testJigList.TestJigList.length; i++) {
        jigtype.innerHTML = jigtype.innerHTML +
            '<option value="' + testJigList.TestJigList[i]['DUT_ID'] + '">' +
            testJigList.TestJigList[i]['DUT_ID'] + '</option>';
    }
}

function setTestMode(selectedTestMode){
    testMode=selectedTestMode;
}

function closeBarcodeModal()
{
    modal1.style.display = "none";
}
function OKButtonForBarcode()
{
    modal1.style.display = "none";
}

function closeViewResultsModal()
{
    modal2.style.display = "none";
}
function closeSettingsModal()
{
    modal.style.display = "none";
}

function readBarCode(barCodeText){
    myConsole.log(barCodeText);
    var SN=barCodeText;
    document.getElementById('BoardDetail').value=barCodeText;
    modal1.style.display="none";
    setBoardDetails(barCodeText);
}

function setBoardDetails(boardDetail)
{
    myConsole.log("In Set Board Detail");
    document.getElementById('BoardDetail').readOnly="true";
    document.getElementById("start_icon").style.pointerEvents="auto";
    document.getElementById('next_icon').style.pointerEvents="auto";
    var curDate = new Date();
    var curTimeStamp = curDate.getTime();
    TestResultDetails.SN =boardDetail;
    TestResultDetails.TEST_START_TS=curTimeStamp;

}

function ScanBarCode(){

    modal1.style.display = "block";
    var barcode="dmantztk20-01-181.12.2";
    var SN=barcode.slice(0,8);
    var MFGDT=barcode.substr(8,8);
    var HWver=barcode.substr(16,3);
    var SWver=barcode.substr(19,3);
    myConsole.log(SN);
    myConsole.log(MFGDT);
    myConsole.log(HWver);
    myConsole.log(SWver);

    document.getElementById("start_icon").style.pointerEvents="auto";
    document.getElementById('next_icon').style.pointerEvents="auto";
    //document.getElementById('scanner_image').style.pointerEvents="none";
}
var x = new Date();
function DisplayTimeIPInfo()
{
    var strcount;
    var dateTime = new Date();
    document.getElementById('date_time').innerHTML = dateTime.toLocaleString('en-IN', { timeZone: 'UTC' })
    DT=displayDateTime();
}
function displayDateTime()
{
    var refresh=1000; // Refresh rate in milli seconds
    mytime=setTimeout('DisplayTimeIPInfo()',refresh)
}
function reset() {
    /*
    document.getElementById("currently_tested_board").value = "";
    document.getElementById("case_text_box").value = "";
    document.getElementById("tested_text_box").value = "";
    document.getElementById("success_text_box").value = "";
    document.getElementById("fail_text_box").value = "";
    document.getElementById("inner_table").value = "";
    */
    document.location.reload(true);
    LoadTestJigDataSync();
}

function viewResults() {
    modal2.style.display = "block";
    var txt = "&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;" + "<b>RESULTS</b>";
    txt += "<div id='id'><table border='3' id='table'>" +
        "<tr id='tr1'><th id='th'>TID</th>" +
        "<th>TCSHORM</th>" +
        "<th id='th1'>DESC</th>" +
        "<th>LAST_STATUS</th></tr>";
    for (x in testResultDetail.DETAILS) {
        txt += "<tr id='tr'><td>" + testResultDetail.DETAILS[x].TCID + "</td>" +
            "<td>" + testResultDetail.DETAILS[x].TCSHORTNM + "</td>" +
            "<td>" + testResultDetail.DETAILS[x].DESC + "</td>" +
            "<td>" + testResultDetail.DETAILS[x].LAST_STATUS + "</td>" +
            "</tr>";
    }
    txt += "</table></div>";
    document.getElementById("show1").innerHTML = txt;
}
function UploadTestResults()
{
    //modal2.style.display = "block";
    document.getElementById("uploaddata").innerHTML = "Uploading";
    var xhttp = new XMLHttpRequest();
    var url = "http://localhost:3001/ViewResults_BE";
    var request =
        {
            TestResultDetails: TestResultDetails
        };
    var params = JSON.stringify(request);
    myConsole.log(params);
    var params = "inputJsonStr" + "=" + params;
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function () {
        if ((this.readyState == 4) && (this.status == 200)) {
            myConsole.log("after getting response" + xhttp.responseText);
            var jsonresponse=JSON.parse(this.responseText);
            document.getElementById("uploaddata").innerHTML = jsonresponse.status;
        }
    };
    xhttp.send(params);
}
/*function nextTestcase()
{
    var current_TC=document.getElementById('testcase_id').value;
    var xhttp = new XMLHttpRequest();
    var url = "http://localhost:3001/nextTestcase_v2";
    var request =
        {
            testcase_id:current_TC
        };
    var params = JSON.stringify(request);
    myConsole.log(params);
    var params = "inputJsonStr" + "=" + params;
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function ()
    {
        if ((this.readyState == 4) && (this.status == 200))
        {
            myConsole.log("after getting response" + xhttp.responseText);
            var jsonresponse=JSON.parse(this.responseText);
            var nextTestcase=jsonresponse.nexttestcase;
            document.getElementById('testcase_id').value=nextTestcase;
            //document.getElementById('retry_icon').style.pointerEvents="auto";
           // document.getElementById('next_icon').style.pointerEvents="auto";
           // document.getElementById('start_icon').style.pointerEvents="auto";
        }
    };
    xhttp.send(params);
}
*/
