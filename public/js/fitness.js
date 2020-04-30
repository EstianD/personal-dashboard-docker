jQuery(document).ready(function($) {

   let date = new Date()

   let fitnessChart
   let data = {}
   let filtered = {}

   // FILTERED STATS
   let filtered_calories = 0 
   let filtered_km_run = 0 
   let filtered_km_ride = 0

   let chartState = {
      type: 'calories_burned',
      workout: 'all',
      date_start_filter: moment().startOf('month').format('MM/DD/YYYY'),
      date_end_filter: moment().format('MM/DD/YYYY'),
      filtered_data: {
         dates: [],
         data: []
      }
   }
   
   
   // FILTER DATA BY DATE FUNCTION
   const filterData = () => {
      let filteredData = data.chart.filter(function (item) {
         let date = moment.unix(parseInt(item.workoutDate)).format('MM/DD/YYYY').toString()

         return (date >= chartState.date_start_filter && date <= chartState.date_end_filter);
      });

      // FILTER CHARTSTATE WITHIN DATES
      filtered = filteredData
   }

   // DATERANGE PICKER FOR FITNESS PAGE
   // DEFAULT = LAST MONTH
   $('input[name="dates"]').daterangepicker({
      startDate: new Date(chartState.date_start_filter),
      endDate: new Date(chartState.date_end_filter)
   });

   // DATERANGE PICKER ONCHANGE FUNCTION
   $('input[name="dates"]').change(() => {
      let dateRange = $('#fitness-cal').val()

      chartState.date_start_filter = dateRange.substring(0, 10)
      chartState.date_end_filter = dateRange.substring(13, 23)

      filterData()
      changeState(chartState)
      generateChart(chartState, filtered)
   })

   // CHART
   // REQUEST DATA FROM SERVER AND START CHART FUNCTION CHAIN
   const loadData = () => { 

      $.ajax({
         url: '/fitness/chart/',
         type: 'GET',
         success: function( res ){
            data = res

            // LOOP THROUGH RETURNED DATA TO GET DATES FOR WORKOUTS
            let workoutDates, workoutStats, distance

            filterData()
            changeState(chartState)        
            generateChart(chartState, filtered)
         }
      });
   }

   // FUNCTION FOR BUILDING CHART
   const generateChart = (state, data) => {

      // RENDER CHART
      fitnessChart = Highcharts.chart('chart-container', {
         chart: {
            type: 'column'
         },
         title: {
            text: 'Activities'
         },
         xAxis: {
            categories: state.filtered_data.dates,
            crosshair: true
         },
         yAxis: {
            min: 0,
            title: {
               text: 'Calories burned'
            }
         },
         tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">Calories: </td>' +
            '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
         },
         plotOptions: {
            column: {
               pointPadding: 0.2,
               borderWidth: 0
            },
            series: {
               marker: {
                  enabled: false
               }
            }
         },
         series: [{
            name: 'Calories Burned',
            data: state.filtered_data.data
         }]
      });
   }

   const changeState = (state) => {
      // RESET CHART STATE
      chartState.filtered_data.dates = []
      chartState.filtered_data.data = []

      filtered_calories = 0
      filtered_km_run = 0
      filtered_km_ride = 0

      chartState.workout = $('#fitness-select').val()
      // RETURN ALL WORKOUTS
      if(state.workout === 'all'){
         // PUSH ALL DATA TO STATE ARRAYS
         chartState.filtered_data.dates = filtered.map((workout) => {
            return moment.unix(parseInt(workout.workoutDate)).format('MM/DD/YYYY').toString()
         })
         // GET CALORIES BURNED
         chartState.filtered_data.data = filtered.map((workout) => {
            
            return parseInt(workout[state.type])
         })

         // RETURN RUNS
      } else if(state.workout === 'runs'){   
         // GET CALORIES BURNED
         filtered.forEach((workout) => {
            if(workout.workout.includes('Run')){
               // PUSH ALL RUN DATA TO STATE ARRAYS
               chartState.filtered_data.dates.push(moment.unix(parseInt(workout.workoutDate)).format('MM/DD/YYYY').toString())
               chartState.filtered_data.data.push(parseInt(workout[state.type]))
            }
         })
         // RETURN TYPE = WORKOUT
      } else if(state.workout === 'workouts'){

         filtered.forEach((workout) => {
            if(workout.workout.includes('Workout')){
               // PUSH ALL WORKOUT DATA TO STATE ARRAY
               chartState.filtered_data.dates.push(moment.unix(parseInt(workout.workoutDate)).format('MM/DD/YYYY').toString())
               chartState.filtered_data.data.push(parseInt(workout[state.type]))
            }
         })
      } else if(state.workout === 'ride'){

         filtered.forEach((workout) => {
            if(workout.workout.includes('Ride')){
               // PUSH ALL WORKOUT DATA TO STATE ARRAY
               chartState.filtered_data.dates.push(moment.unix(parseInt(workout.workoutDate)).format('MM/DD/YYYY').toString())
               chartState.filtered_data.data.push(parseInt(workout[state.type]))
            }
         })
      }

      filtered.forEach((workout) => {
         filtered_calories += parseInt(workout.calories_burned)

         if(workout.workout === "Run"){
            filtered_km_run += parseInt(workout.distance)
         } else if(workout.workout === "Ride"){
            filtered_km_ride += parseInt(workout.distance)
         }
          
      })
      // ASIGN STATS TO ELEMENT
      $('#filtered-calories').text(filtered_calories.toString())
      $('#filtered-run-distance').text(filtered_km_run.toString()+'m')
      $('#filtered-ride-distance').text(filtered_km_ride.toString()+'m')
   }

   // // FITNESS CHART AJAX REQUEST
   if(window.location.href.includes('fitness')){
      loadData()
   }

   // ON CHANGE FOR WORKOUT SELECT
   $('#fitness-select').change(() => {

      // CHANGE STATE DEPENDING ON SELECT
      changeState(chartState)
      // ASIGN CHART TO VARIABLE
      fitnessChart = $('#chart-container').highcharts()
      
      // UPDATE CHART DATA
      fitnessChart.update({
         series: {
            data: chartState.filtered_data.data
         },
         xAxis: {
            categories: chartState.filtered_data.dates
         }
      }, false)

      // REDRAW CHART
      fitnessChart.redraw()
   })

   // SYNC STRAVA AJAX REQUEST
   $("#sync-strava").on('click', function() {
      $('#syncing-block').css("display", "block")
      // event.preventSubmit()
      $.ajax({
         url: '/fitness/strava/sync',
         type: 'POST',
         success: function( res ){
            $('#syncing-block').css("display", "none")
            if(res.status = 'ok'){
               console.log('done')
            } else if(res.status = 'error') {
               console.log('error')
            }
         }
      });
   })

})