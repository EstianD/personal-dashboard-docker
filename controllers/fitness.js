const express = require('express')
const fitnessRouter = require('express').Router()
const { ensureAuthenticated } = require('../utils/auth')
const localStorage = require('node-localstorage')
const axios = require('axios')

// MODELS
const User = require('../models/User')
const Fitness = require('../models/Fitness')

const config = require('../utils/config')
// DASHBOARD
fitnessRouter.get('/', ensureAuthenticated, (req, res) => {
   res.render('fitness', {
      user: req.user
   })
})

fitnessRouter.post('/strava/sync', ensureAuthenticated, (req, res) => {

   let status
   let avgHr, t, age, w 
   let timeDiff = new Date().getTime() - new Date(req.user.dateOfBirth).getTime()

   const yearDiff = (timeDiff / 31556952000).toString()

   age = yearDiff.substr(0, yearDiff.indexOf('.')); 
   
   if(req.user.strava_access_token){

      const link = `https://www.strava.com/api/v3/athlete/activities?access_token=${req.user.strava_access_token}`

      const loadStravaData = async (req, res) => {
         const data = await axios.get(link)

         // console.log(data.data)

         // CHECK IF DATA IS RETURNED
         if(data) {
            data.data.forEach(async entry => {
               // CHECK IF WORKOUT EXISTS FOR USER
               // RETRIEVE ARRAY OF WORKOUTS AND MATCH IT WITH INCLUDE() FUNCTION
               const res = await Fitness.findOne({ fitnessId: entry.id }).select('fitnessId').lean()

               avgHr = parseInt(entry.average_heartrate)
               w = req.user.weight
               t = Number(entry.elapsed_time, 10) / 60 / 60
               age = parseInt(age)

               // CALCULATE CALORIES BURNED FOR WORKOUT
               let sumFirst = (-55.0969 + (0.6309 * avgHr) + (0.1988 * w) + (0.2017 * age))

               
               let secTot = (sumFirst / 4.184)
               let calBurned = secTot * 60 * t

               if(!res){
                  let workout = new Fitness({
                     workout: entry.type,
                     elapsedTime: entry.elapsed_time,
                     workoutDate: Date.parse(entry.start_date.substring(0, 10)) / 1000,
                     heartrateAvg: entry.average_heartrate,
                     heartrateMax: entry.max_heartrate,
                     calories_burned: parseInt(calBurned),
                     distance: entry.distance,
                     fitnessId: entry.id,
                     userId: req.user.id
                  })

                  await workout.save()
                  
               }
            })

            // UPDATED LAST SYNCED IN USERS
            User.findById({ _id: req.user.id })
               .then((user) => {
                  user.strava_last_synced = new Date()
                  user.save()
               })

            return res.json({ status: 'ok' })
         }
         return res.json({ status: 'error' })
      }

      loadStravaData(req, res)

   }

})

// GET CHART DATA
fitnessRouter.get('/chart', async (req, res) => {

   // GET FITNESS DATA FOR AUTH USER
   const fitness = await Fitness.find({ userId: req.user.id }).sort({ workoutDate: 1 })

   return res.json({ chart: fitness })

})


module.exports = fitnessRouter