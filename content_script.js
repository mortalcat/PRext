
/**
 * Created by Shaocong on 11/16/2016.
 */

$(function() {



    console.log("here goes the injected content script");

    ////test
//console.log($("frame[name='bottomFrame']"));

var chosenSlot;
    var credentials = {
      "FIN":"G1086979Q",
        "NoOfPeople":"1",
        "contact":"82118301"

    };

    var reloadCounter = 2;//TODO:changed for testing. should be 0

    var maxPage2GO = 10;
    var dateNextCount = 0;
    var found = false, slotChose = false;
    var curDate;

    var pollFrameLoadingInterval = 1000;



    var monthConvert=[
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"

    ];



  function Date(day, month, year){

      if(typeof(day)=="string"){

          day = parseInt(day);
      }
      if(typeof(month)=="string"){
          month = parseInt(month);
      }
      if(typeof(year)=="string"){
          year = parseInt(year);
      }

      var mDate={
          "day":day,
          "month":month,
          "year":year

      };
console.log(typeof (day));
console.log(typeof (day));
      return mDate;

  }

  function notEarlier(date1, date2){

      //check if date1&date2  are valid date


      if(!isDate(date1) || !isDate(date2) ) {
       console.log("ERR:date1 or date2 is not valid date");

          return null;
      }
          if(date1.year > date2.year){
              return true;
          } else if(date1.year==date2.year&& date1.month > date2.month){
              return true;
          } else if(date1.year==date2.year && date1.month==date2.month && date1.day>=date2.day) {
              return true;

          } else {
              return false;
          }

function hasProperty(obj, key){
   return obj.hasOwnProperty(key);
}
function isDate(obj){
    return hasProperty(obj,"day") && hasProperty(obj,"month") && hasProperty(obj,"year");
}
  }

  //TODO:this should be put into option:Default will be one day after current date
  var earliestPossibleDate = Date(19,11,2016);
    var onlyNotiAvDate = false;

////dateStr format "Wednesday 16 Nov 2016"
function DateFromString(dateStr){

    var whichMonth = function (MonthStr) {
        console.log("input2Lower"+MonthStr.toLowerCase());

        for(var i=0; i<monthConvert.length;i++)
        {
            if(MonthStr.toLowerCase() === monthConvert[i]){
                return i+1;
            }

        }
        console.log("ERR:Input month string is not valid");
        return null;
    };

    var dateArr = dateStr.split(" ");
    if(dateArr.length!==4){
        console.log("ERR: the date String get from the website is not right.")
        return null;
    }

    console.log("result: "+whichMonth(dateArr[2]));
    var theDate = Date(dateArr[1],whichMonth(dateArr[2]),dateArr[3]);

    return theDate;
}



////poll for dom element in the frame if it is loaded
 ///slector is in relative to frame
    function pollForLoad(domSlector){
        var intId;
        var isFrameLoaded = function () {
            //both frames have been loaded?
            if(    $("frame[name='bottomFrame']") &&    $("fra,e[name='bottomFrame']").contents().find("frame[name='mainFrame']").length
            &&  $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find(domSlector).length){
                console.log("clear timer"+intId);
                clearInterval(intId);
                regiForMe();

            }

        };
        intId = setInterval(isFrameLoaded, pollFrameLoadingInterval);


        return intId;
    }

    pollForLoad("select[name='apptDetails.apptType']");
    //todo: CHANGED FOR TESTING ,DELETE WHEN FINISHED
    regiForMe();

    function regiForMe() {
        var frame = $("div#frame");

    if(dateNextCount==maxPage2GO){
            console.log("finished going to next pages. now should end");
            //tell background procedure is over

        chrome.runtime.sendMessage({type:"End"},function(response){


            });

        }

        reloadCounter++;
        console.log(reloadCounter + " th time reload");

        if(slotChose){//final page with credentials loaded, now save and exit

            //TODO:print out this page for credentials

            //tell bg to close this tab
            var dateMsg = chosenSlot.day+"/"+chosenSlot.month+"/"+chosenSlot.year+" "+chosenSlot.slot;
            chrome.runtime.sendMessage({type:"DateChosen",date:dateMsg},function(response){


            });


        }
        else if (found&&!slotChose) {//an available date is found, 4th page reloaded, now choose slot and sumbmit!

            //TODO: set time preference!
            //TODO:changed for testing, put contents() back after
             frame.find("input[type='radio']").eq(0).prop("checked",true);
            //TODO:changed for testing, put contents() back after
            chosenSlot["slot"] = frame.find("input[type='radio']").eq(0).val();
            console.log("time slot chosen:"+chosenSlot.slot);
            slotChose = true;
            //TODO:changed for testing, uncomment after
            // frame.find("form[name='calendarForm']").submit();
            //pollForLoad("body");
            //TODO:changed for testing, delete when finished
            regiForMe();

        }

      //TODO:CHANGED FOR TESTING  var frame =  $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']");

        //choose for application TYpe if it is not already chosen
        if (reloadCounter == 1 && frame.contents().find("select[name='apptDetails.apptType']").val() != "PRAP") {
            console.log("Now choose app type");
            frame.contents().find("select[name='apptDetails.apptType']").val("PRAP");
            frame.contents().find("form[name='calendarForm']").submit();
            pollForLoad("input[name='apptDetails.identifier1']");
        }

        else if (reloadCounter == 2) {

        console.log("now fills in fields :below is the first input field");

            console.log(frame.contents().find("input[name='apptDetails.identifier1']"));



//fill in fields
            if (frame.contents().find("input[name='apptDetails.identifier1']").val() != credentials.FIN) {

                frame.contents().find("input[name='apptDetails.identifier1']").val(credentials.FIN);
            }
            if (frame.contents().find("input[name='apptDetails.identifier2']").val() != credentials.NoOfPeople) {

                frame.contents().find("input[name='apptDetails.identifier2']").val(credentials.NoOfPeople);
            }
            if (frame.contents().find("input[name='apptDetails.identifier3']").val() != credentials.contact) {

                frame.contents().find("input[name='apptDetails.identifier3']").val(credentials.contact);
            }


            frame.contents().find("form[name='calendarForm'][action='/ibook/publicLogin.do']").submit();
            pollForLoad("input[name='apptDetails.apptDate']");

        } else if (reloadCounter >= 3 && !found && dateNextCount < maxPage2GO) {
            if (curDate == undefined || !curDate) {//date not set yet?
                //get current date
                //TODO:changed for testing, put back .contents when finished
                dateStr =frame.find("input[name='apptDetails.apptDate']").val();

                 curDate = DateFromString(dateStr);

                console.log("current date is " + curDate.day + "/"+curDate.month+"/"+curDate.year);

            }

            //has avaialble date?
            //TODO:changed for testing, put back .contents when finished

            if (frame.find("td.cal_AS").length) {
                console.log(frame.find("td.cal_AS"));


                //TODO:changed for testing, put back .contents when finished

                var AvDateBtns = frame.find("td.cal_AS");

                for(i=0; i <AvDateBtns.length&&!found;i++) {//loop to find a available date that is before the set latest possible date

                    var day2Choose = parseInt(AvDateBtns.eq(i).find("td").text());
                    //TODO:changed for testing, put back .contents when finished
                    var pageMonth = frame.find("input[name='calendar.calendarMonth']").val();
                    console.log(frame.find("input[name='calendar.calendarMonth']").val());
                    //TODO:changed for testing, put back .contents when finished
                    var pageYear = frame.find("input[name='calendar.calendarYear']").val();
console.log("choose date: "+day2Choose+"/"+pageMonth+"/"+pageYear);
                    console.log(earliestPossibleDate);

                    var date2Choose = Date(day2Choose,pageMonth,pageYear);
                    if (notEarlier(date2Choose, earliestPossibleDate)) {
                        console.log("Now found a AVA date");
                        chosenSlot=date2Choose;
                        console.log(chosenSlot);
                        found = true;

                        if(onlyNotiAvDate){
                            var dateStr = date2Choose.day+"/"+date2Choose.month+"/"+date2Choose.year;

                            chrome.runtime.sendMessage({type:"AvailableDate",date:dateStr},function(response){

                            });

                            //stop all other code? No need, because not directly calling for any reload


                        } else {

                            console.log("Now click the AVA date for me");
                            //TODO:changed for testing, put back .contents when finished

                            frame.find("td.cal_AS").eq(i).find("td").click();
                            //TODO:changed for testing, put back .uncomment when finished

                            //pollForLoad("form[name='calendarForm'][action='/ibook/processTimeSlot.do']");
                            //TODO:changed for testing, delete when finished
                            regiForMe();
                        }
                    }



                }

            } else {
                //Got to reload now, can not simply for clause bc RELOAD NEEDS TO LOAD
                console.log("No available Date at " + dateNextCount + "th page");


                if (!frame.contents().find("a[href='javascript:doNextMth(document.forms[0]);']").length) {
                    console.log("can not find nextbtn!!!");
                } else {
                    console.log(frame.contents().find("a[href='javascript:doNextMth(document.forms[0]);']"));

                }

                frame.contents().find("a[href='javascript:doNextMth(document.forms[0]);']")[0].click();
                dateNextCount++;
                pollForLoad("input[name='apptDetails.apptDate']");

            }



        }


    }



});

