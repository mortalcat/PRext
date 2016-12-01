/**
 * Created by Shaocong on 11/16/2016.
 */
//open a new tab
//TODO: alarms for repeat periodically





chrome.browserAction.onClicked.addListener(function(atab) {
//
    //TODO:changed for testing, should be :"https://eappointment.ica.gov.sg/ibook/index.do"
    chrome.tabs.create({url:"C:/Users/Shaocong/MYP/PRext/test/test.html" , selected: false},function (tab) {
        chrome.tabs.executeScript(tab.id,
            { file: "jquery-3.1.1.js" },function () {
                chrome.tabs.executeScript(tab.id,
                    { file: "content_script.js" },function () {

                        console.log("Scripts injected");

                        var appId = tab.id;
                        var ori_tab;

                        var readyToCapture = false;
                        console.log("APPTAB"+appId);

                        //todo:bug: onUpdated is not fired, on activated is fired when tab is not ready, FUCKKKKKKKKK
                        chrome.tabs.onActivated.addListener(function(info) {

                           Capture(info);


                        });


                        function Capture(info){

                            // If the tab wasn't ready (waiting is true)
                            // Then check if it's now ready and, if so, capture
                            console.log("changedTab" + info.tabId);
                            //console.log("status" + info.status);


                            if (readyToCapture&&  info.tabId == appId) {
                                console.log("Update tab");

                                //print out current page
                                //TODO: now it will only capture current tab?!!!
                                chrome.tabs.captureVisibleTab(
                                    tab.windowId, {format: 'png', quality: 100}, function(dataURI) {//getImage? Save it
                                        console.log("capture... " );

                                        if(!dataURI) {
                                            mErrBack();
                                            return;
                                        }
                                        console.log("picture url: " +dataURI );
                                        //TODO:put dataUrl into a file. save in local file system

                                        var mBlob = getBlob(dataURI);
                                        saveBlob(mBlob, "appointmentReceipt"+Date.now()+".png", downloadPic, mErrBack);
                                        //TODO: download the url

                                        function mErrBack() {
                                            //TODO: more proper errBack
                                            console.log("ERR: write blob err");

                                        }
                                        function downloadPic(url) {


                                            console.log(url);


                                            chrome.downloads.download(  {url : url },downloadCallback);

                                        }
                                        function downloadCallback(downloadId){
                                            //TODO: notify user WITH DOWNLOAD FILE
                                            showNotification("A date for PR appointment has been booked for you",request.date);

                                        }


///data URl format:
///data:image/png;base64,iVBORw0KGgoA
                                    });

                            }
                        }

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


                                      chrome.tabs.query({
                                          active   : true,
                                          windowId : tab.windowId
                                      }, function (re) {

                                          ori_tab = re[0].id;

                                          if (ori_tab !== tab.id) {
                                              // Requested tab is inactive
                                              // Activate requested tab
                                              chrome.tabs.update(tab.id, { active: true });

                                              // Tab isn't ready, you can't capture yet
                                              // Set waiting = true and wait...
                                              readyToCapture = true;
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


                        function getBlob(dataURI){
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
                                "/temporary/"+ filename);

                                console.log(urlName);

                                callback(urlName);
                            }

                            // come up with file-system size with a little buffer
                            //TODO: buffer required?
                            var size = blob.size + (1024 / 2);

                            // create a blob for writing to a file
                            var reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                            reqFileSystem(window.TEMPORARY, size, function(fs){
                                fs.root.getFile(filename, {create: true}, function(fileEntry) {
                                    fileEntry.createWriter(function(fileWriter) {
                                        fileWriter.onwriteend = onwriteend;
                                        fileWriter.write(blob);
                                    }, errback); // TODO - standardize error callbacks?
                                }, errback);
                            }, errback);
                        };

                    });
            });

    });


});







