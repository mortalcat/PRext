/**
 * Created by Shaocong on 11/17/2016.
 */
$(function(){


    function submit1() {
$("#mframe").html(form2);


    }
    function submit2() {
        $("#mframe").html(form3);


    }



var form2= "<form name='calendarForm' onsubmit='submit2()'>"+

        "<input type='text' name='apptDetails.identifier1'>"+
        "<input type='text' name='apptDetails.identifier2'>"+

      "  <input type='text' name='apptDetails.identifier3'>"+

       " <input type='submit' >"+

        "</form>";




});