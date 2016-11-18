
/**
 * Created by Shaocong on 11/16/2016.
 */

//TOdo: OPEN A TAB AT BACK
$(function() {
    console.log("here goes the injected content script");

    ////test
console.log($("frame[name='bottomFrame']"));


    var credentials = {
      "FIN":"G1086979Q",
        "NoOfPeople":"1",
        "contact":"82118301"

    };


    var maxPage2GO = 10;
    var dateNextCount = 0;
    var found = false;
    var dateArr;





    $("frame[name='bottomFrame']").on("load", function() {
        var reloadCounter = 0;
        console.log("The outer frame iS READY::");
        $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").on("load", function() {

            reloadCounter++;
            console.log(reloadCounter+" th time reload");


            if(found){//an available date is found, 4th page reloaded, now choose slot and sumbmit!

                //TODO: set time preference!IMPORTANT
/**TODO:uncomment this part when you absoulutely sure no err
                $(this).contents().find("radio")[0].prop("checked",true);
                $(this).contents().find("form[name='calendarForm']").submit();
****/
            }




            //choose for application TYpe if it is not already chosen
            if(reloadCounter==1 &&  $(this).contents().find("select[name='apptDetails.apptType']").val()!="PRAP") {
                console.log("Now choose app type");
                $(this).contents().find("select[name='apptDetails.apptType']").val("PRAP");
               $(this).contents().find("form[name='calendarForm']").submit();
            }

            else if(reloadCounter==2)
            {


                console.log($(this).contents().find("input[name='apptDetails.identifier1']"));


                        //action="/ibook/publicLogin.do"


                        if ($(this).contents().find("input[name='apptDetails.identifier1']").val()!=credentials.FIN ) {

                            $(this).contents().find("input[name='apptDetails.identifier1']").val(credentials.FIN);
                        }
                if ($(this).contents().find("input[name='apptDetails.identifier2']").val()!=credentials.NoOfPeople ) {

                    $(this).contents().find("input[name='apptDetails.identifier2']").val(credentials.NoOfPeople);
                }
                if ($(this).contents().find("input[name='apptDetails.identifier3']").val() !=credentials.contact) {

                    $(this).contents().find("input[name='apptDetails.identifier3']").val(credentials.contact);
                }


                $(this).contents().find("form[name='calendarForm'][action='/ibook/publicLogin.do']").submit();

            } else if(reloadCounter>=3 && !found && dateNextCount<maxPage2GO) {
                if(dateArr ==undefined||!dateArr) {//date not set yet?
                    console.log(dateArr);

                    //get current date
                    dateArr = $(this).contents().find("input[name='apptDetails.apptDate']").val().split(" ");

                    if (dateArr.length == 4) {
                        console.log("Today is " + dateArr[1]);





                    } else {
                        console.log("ERR!!!!");
                        //TODO:get date from Internet
                    }
                }

                //has avaialble date?

                    if ($(this).contents().find("td.cal_AS").length) {
                        console.log($(this).contents().find("td.cal_AS"));
                        ///TODO:this click does not work, find out why
                        //TODO: check if date is the exact next day, if so, do not book

                        //TODO: if found any AVA date. noti first before book
                        var nearestDateAva = $(this).contents().find("td.cal_AS")[0];
                        console.log("tmr is"+parseInt(dateArr[1]) + 1);
                        if (dateArr[1] && (parseInt(dateArr[1]) + 1) != parseInt(nearestDateAva.find("td").text()))
                            $(this).contents().find("td.cal_AS")[0].find("td").click();

                        //TODO: IF THIS IS ALREADY TAKEN. GO BACK A TIME AND BOOK THE NEXT AVA DATE
                        //TODO:4th page submit
                        found = true;

                    } else {
                        //Got to reload now, can not simply for clause bc RELOAD NEEDS TO LOAD
                        console.log("No available Date at "+dateNextCount+"th page");
                        //TODO:go to next page!

                        if(!$(this).contents().find("a[href='javascript:doNextMth(document.forms[0]);']").length){
                            console.log("can not find nextbtn!!!");
                        } else{
                            console.log($(this).contents().find("a[href='javascript:doNextMth(document.forms[0]);']"));

                        }

                            $(this).contents().find("a[href='javascript:doNextMth(document.forms[0]);']")[0].click();
                            dateNextCount++;

                    }
///TODO: log out or close tab


            }





        });

    });

///todo:notification
    //TODO alarms for repeat periodically
});

