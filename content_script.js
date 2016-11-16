
/**
 * Created by Shaocong on 11/16/2016.
 */


$(function() {
    console.log("here goes the injected content script");
   // $("body").css({"background-color":"red","color":"blue"});

    ///setTimeout( function () {
        //test if we can retrieve DOM ele
console.log($("frame[name='bottomFrame']"));

    $("frame[name='bottomFrame']").on("load", function() {
        console.log("The outer frame iS READY::");
        $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").on("load", function() {

            console.log("Here comes the inner frame" ); // nothing at first
            console.log($("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("form[name='calendarForm']")  ); // nothing at first
            console.log($("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("select[name='apptDetails.apptType']")  ); // nothing at first

            if(            $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("select[name='apptDetails.apptType']").val()!="PRAP") {
                $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("select[name='apptDetails.apptType']").val("PRAP");
                $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("form[name='calendarForm']").submit();
            }
        });
//TODO: the website will reload, make sure not choose again afte reload

    });

        //console.log($("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents() ); // nothing at first
       // console.log($("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("body")  ); // nothing at first

      // $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("body").css({"background-color":"red","color":"blue"}); // nothing at first

     // console.log($("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("form[name='calendarForm']")  ); // nothing at first
      //  console.log($("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("select[name='apptDetails.apptType']")  ); // nothing at first

       // $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("select[name='apptDetails.apptType']").val("PRAP");
      // $("frame[name='bottomFrame']").contents().find("frame[name='mainFrame']").contents().find("form[name='calendarForm']").submit();
    ////}, 10000 );////wait for frame to load

    // $("#calendarForm", $("#bottomFrame").contents()).css({"background-color":"red","color":"blue"}).val("PRAP");
//jQuery("#calendarForm").css({"background-color":"red"});
//jQuery("#gaia_loginform").submit();

});

