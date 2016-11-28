/**
 * Created by Shaocong on 11/16/2016.
 */
//open a new tab
//TODO: alarms for repeat periodically




function showNotification(title, content) {

    new Notification(title, {
        body: content
    });
}

chrome.browserAction.onClicked.addListener(function(atab) {
//
    //TODO:changed for testing, should be :"https://eappointment.ica.gov.sg/ibook/index.do"
    chrome.tabs.create({url:"C:/Users/Shaocong/MYP/PRext/test/test.html" , selected: false},function (tab) {
        chrome.tabs.executeScript(tab.id,
            { file: "jquery-3.1.1.js" },function () {
                chrome.tabs.executeScript(tab.id,
                    { file: "content_script.js" },function () {

                        console.log("Script injected");


                          chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

                                  if(sender.tab.id!=tab.id) return;
                                        //console.log(request.type);


                                  if(request.type=="End"){
                                     sendResponse({debugMsg:"Now close tab"});
                                      //now close the tab
                                     chrome.tabs.remove(tab.id,function () {
                                       console.log("Now the tab is closed");
                                    });

                                    } else if(request.type=="AvailableDate")
                                     {



                                    showNotification("Now has available slot @ PR E Appointment!", request.date);

                                     } else if(request.type=="DateChosen"){

                                       //print out current page
                                      chrome.tabs.captureVisibleTab(
                                       tab.windowId, {format: 'png', quality: 100}, function(dataURI) {//getImage? Save it
                                       console.log("picture url: " +dataURI );
///data URl format:
///data:image/png;base64,iVBORw0KGgoA
                                      });


       showNotification("A date for PR appointment has been booked for you",request.date);

        //todo:uncomment after testing
        //******
       //setTimeout( function () {

        //chrome.tabs.remove(tab.id,function () {
          //  console.log("Now the tab is closed");
        //});
    //},5000);

    }

});


                    });
            });

    });


});






