
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

    $("frame[name='bottomFrame']").on("load", function() {
        var reloadCounter = 0;
        console.log("The outer frame iS READY::");
        $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").on("load", function() {

            reloadCounter++;
            console.log(reloadCounter+" th time reload");
            //console.log("Here comes the inner frame" );
           // console.log($(this).contents().find("select[name='apptDetails.apptType']")  );

            //choose for application TYpe if it is not already chosen
            if(reloadCounter==1 &&  $(this).contents().find("select[name='apptDetails.apptType']").val()!="PRAP") {
                console.log("Now choose app type");
                $(this).contents().find("select[name='apptDetails.apptType']").val("PRAP");
               $(this).contents().find("form[name='calendarForm']").submit();
            }

            if(reloadCounter==2)
            {
                ///TODO: how do we know if the page is already refreshed?

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

            } else if(reloadCounter==3){

                //has avaialble date?
                //TODO:automatically choose for you
                if($(this).contents().find("td.cal_AS").length){
                    console.log($(this).contents().find("td.cal_AS"));
///TODO:this click does not work, find out why
                    $(this).contents().find("td.cal_AS")[0].click();
                }
//TODO:4th page submit
                //TODO: check if date is the exact next day, if so, do not book

            }







        });

    });

///todo:notification
});

