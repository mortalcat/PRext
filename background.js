/**
 * Created by Shaocong on 11/16/2016.
 */

//TODO: if error, jump off to next schedult

var oldChromeVersion = !chrome.runtime;

var requestTimerId;

//set prefrence for the day ,first without popup for input,TODO:later use user input from popup

function Rule( startHour, endHour, frequency){//frequency in min
    //TODO: may want to modify the restrain on rule
    if (endHour< startHour || startHour < 0 || endHour > 24) {
        console.log("Err: RUle not possible, startHour and endHour wrong");
    return;
    }
    this. startHour = startHour;
    this.endHour = endHour;
    this.frequency = frequency;
}
var preference = [];
/*** comment out for testing
preference[0] = new Rule(8, 10, 10);
preference[1] = new Rule(10,15, 30);
preference[2] = new Rule(15,17,10);
preference[3] = new Rule(17, 24, 30);
preference[4] = new Rule(0, 2, 10);
***/

//This is only for testing
preference[0] = new Rule(14, 18, 2);

//
function setAlarm(frequency){

    if (oldChromeVersion) {////Old version needs to manually set the timeout session
        if (requestTimerId) {// clear previous
            console.log('Creating timeout alarm');

            window.clearTimeout(requestTimerId);
        }
        requestTimerId = window.setTimeout(onAlarm, frequency*60*1000);
    } else {
        console.log('Creating alarm');
        // Use a repeating alarm so that it fires again if there was a problem
        // setting the next alarm.
        chrome.alarms.create('refresh', {periodInMinutes: frequency});
    }
}

function identifyRule(){
    var today = new Date();
    var curHour= today.getHours();
    var curMinute = today.getMinutes();
    var time2Wait;

    console.log("now is  "+today.getHours()+":"+curMinute);
    for(var i = 0 ; i < preference.length;i++) {

       var rule = preference[i];
        var frequency = rule.frequency;
        console.log("rule: " + rule.startHour + "-" + rule.endHour);
        if (curHour < rule.endHour && curHour >= rule.startHour && 60 - frequency > curMinute) {
            var minute2Start = ((Math.floor(curMinute / frequency)+1) * frequency);
            time2Wait = minute2Start - curMinute;


            setAlarm(time2Wait);
            console.log("visit e-ap website in  " + time2Wait + "min");
            return;
        }
    }

    //No rule for now found?=>find rule for next nearest time!
    var nextRuleStartHour = curHour;

    //TODO: preference should be sorted, note this when adding rules from popup
    preference.forEach(function (rule) {
       if(rule.startHour > nextRuleStartHour){
           nextRuleStartHour = rule.startHour;
           time2Wait =  (nextRuleStartHour - curHour - 1)*60 + (60 - curMinute);
       }
    });

    //if not find, go to next day
    if(nextRuleStartHour === curHour){

        nextRuleStartHour = preference[0].startHour;
        time2Wait = (24 - curHour)*60 - curMinute + nextRuleStartHour;
    }


    setAlarm(time2Wait);
    console.log("visit e-ap website in  " + time2Wait + "min");

}


function onAlarm(){
        //run the program
console.log("Now book for me");
        bookAppointment();
    identifyRule();//set the next


}

function onInit() {

    identifyRule();//set the next

}

//bind onAlarm to chrome runTime

if (oldChromeVersion) {
    onInit();
} else {
    chrome.runtime.onInstalled.addListener(onInit);
    chrome.alarms.onAlarm.addListener(onAlarm);
}













//chrome.browserAction.onClicked.addListener(function(atab) { ////This is only for ease of testing, replaced by alarm auto call
//

function  bookAppointment() {

    var bookedDate;

    //TODO:changed for testing, should be :"https://eappointment.ica.gov.sg/ibook/index.do"
    chrome.tabs.create({url: "C:/Users/Shaocong/MYP/PRext/test/test.html", selected: false}, function (tab) {//create tab for the e-appoin link
        chrome.tabs.executeScript(tab.id,
            {file: "jquery-3.1.1.js"}, function () {
                chrome.tabs.executeScript(tab.id,
                    {file: "content_script.js"}, function () {//inject two scripts

                        console.log("Scripts injected");

                        var appId = tab.id;
                        var ori_tab;

                        var readyToCapture = false;
                        console.log("APPTAB" + appId);

                        chrome.tabs.onActivated.addListener(function (info) {
                            Capture(info);
                        });


                        function Capture(info) {
                            console.log("changedTab" + info.tabId);

                            if (readyToCapture && info.tabId == appId) {
                                console.log("Switch tab");

                                //print out current page
                                chrome.tabs.captureVisibleTab(//capture appointment tab
                                    tab.windowId, {format: 'png', quality: 100}, function (dataURI) {//getImage?
                                        //switch the tab back!
                                        chrome.tabs.update(ori_tab, {active: true});

                     /////////////////////////////////////////NOW SAVE IMAGE///////////////////////////////////////////////
                                        console.log("capture... ");
                                        if (!dataURI) {//dataURI  Undefined?
                                            console.log("err: NO DATAURL CAPTURED");//print err and return!
                                            return;
                                        }

                                        //put dataUrl into a file. save in local file system
                                        var mBlob = getBlob(dataURI);
                                        saveBlob(mBlob, "appointmentReceipt" + Date.now() + ".png", downloadPic, mErrBack);

                                        function mErrBack() {
                                            //TODO: more proper errBack
                                            console.log("ERR: write blob err");
                                        }

                                        function downloadPic(url) {//download from local file system
                                            console.log(url);
                                            chrome.downloads.download({url: url}, downloadCallback);
                                        }

                                        function downloadCallback(downloadId) {//notificate after download completed
                                            //TODO: notify user WITH DOWNLOAD FILE
                                            if (!bookedDate) {
                                                console.log("Err: No date property in request");
                                                return;
                                            }
                                            showNotification("A date for PR appointment has been booked for you", bookedDate);
                                        }

////////////////////////////////////////////////////////////////data URl format:
//////////////////////////////////////////////////////////////////data:image/png;base64,iVBORw0KGgoA
                                    });

                            }
                        }

                        //receive message from content script
                        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

                            if (sender.tab.id != tab.id) return;
                            //console.log(request.type);


                            if (request.type == "End") {
                                sendResponse({debugMsg: "Now close tab"});
                                //now close the tab
                                chrome.tabs.remove(tab.id, function () {
                                    console.log("Now the tab is closed");
                                });

                            } else if (request.type == "AvailableDate") {


                                showNotification("Now has available slot @ PR E Appointment!", request.date);

                            } else if (request.type == "DateChosen") {


                                chrome.tabs.query({
                                    active: true,
                                    windowId: tab.windowId
                                }, function (re) {

                                    ori_tab = re[0].id;

                                    if (ori_tab !== tab.id) {
                                        // Requested tab is inactive
                                        // Activate requested tab
                                        chrome.tabs.update(tab.id, {active: true});

                                        // Tab isn't ready, you can't capture yet
                                        // Set waiting = true and wait...
                                        readyToCapture = true;
                                        bookedDate = request.date;
                                        console.log("Now switch to active and start capature");

                                    } else {
                                        console.log("ERR: the e-appointment page should not be active!");
                                    }
                                });


                                //todo:uncomment after testing
                                //****** close the tab
                                //setTimeout( function () {

                                //chrome.tabs.remove(tab.id,function () {
                                //  console.log("Now the tab is closed");
                                //});
                                //},5000);

                            }


                        });

                        function showNotification(title, content) {

                            new Notification(title, {
                                body: content
                            });
                        }


                        function getBlob(dataURI) {
                            // convert base64 to raw binary data held in a string
                            // doesn't handle URLEncoded DataURIs
                            var byteString = atob(dataURI.split(',')[1]);

                            // separate out the mime component
                            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                            // write the bytes of the string to an ArrayBuffer
                            var ab = new ArrayBuffer(byteString.length);
                            var ia = new Uint8Array(ab);
                            for (var i = 0; i < byteString.length; i++) {
                                ia[i] = byteString.charCodeAt(i);
                            }

                            // create a blob for writing to a file
                            var blob = new Blob([ab], {type: mimeString});
                            return blob;
                        }

                        function saveBlob(blob, filename, callback, errback) {

                            function onwriteend() {
                                // open the file that now contains the blob - calling
                                // `openPage` again if we had to split up the image
                                //TODO: change
                                var urlName = ('filesystem:chrome-extension://' +
                                chrome.i18n.getMessage('@@extension_id') +
                                "/temporary/" + filename);

                                console.log(urlName);

                                callback(urlName);
                            }

                            // come up with file-system size with a little buffer
                            //TODO: buffer required?
                            var size = blob.size + (1024 / 2);

                            // create a blob for writing to a file
                            var reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                            reqFileSystem(window.TEMPORARY, size, function (fs) {
                                fs.root.getFile(filename, {create: true}, function (fileEntry) {
                                    fileEntry.createWriter(function (fileWriter) {
                                        fileWriter.onwriteend = onwriteend;
                                        fileWriter.write(blob);
                                    }, errback); // TODO - standardize error callbacks?
                                }, errback);
                            }, errback);
                        };

                    });
            });

    });
};

//});







