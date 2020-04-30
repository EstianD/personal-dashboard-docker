jQuery(document).ready(function($) {
   
   // DATE PICKER
   $('.datepicker').datepicker({
      format: 'yyyy/mm/dd',
      autoclose: true,
      startDate: '1900/01/01',
      endDate: '2015/01/01'
   });

})