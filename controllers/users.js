const usersRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
// const localStorage = require('node-localstorage')

const auth = require('../utils/auth')
const User = require('../models/User')

const { ensureAuthenticated } = require('../utils/auth')

// LOGIN ROUTE
usersRouter.get('/login', (req, res) => {
   res.render('login')
})


// STRAVA AUTH
usersRouter.get('/login/strava', passport.authenticate('strava', {
   scope: ['activity:read_all']
}))

// STRAVA CALLBACK
usersRouter.get('/api/auth/strava/callback', passport.authenticate('strava'), (req, res) => {
   console.log('here', req.user)
   // CHECK IF ALL NEEDED PROFILE FIELDS IS COMPLETED
   // AGE/WEIGHT
   if(!req.user.dateOfBirth || !req.user.weight){
      res.redirect('/user-details')
   } else {
      res.redirect('/fitness')
   }
})

// FINISH USER DETAILS UPON FIRST LOGIN
usersRouter.get('/user-details', (req, res) => {
   res.render('user-details')
})

// SAVE USER PERSONAL DATA
usersRouter.post('/users/save_personal_data', async (req, res) => {
   if(!req.body['date-of-birth'] || !req.body['user-weight']){
      req.flash('error_msg', 'Please complete all fields')
      res.redirect('/user-details')
   } else {
      
      const user = await User.findOne({ _id: req.user.id })
      console.log(user)
      user.weight = req.body['user-weight']
      user.dateOfBirth = req.body['date-of-birth']

      if(await user.save()){
         res.redirect('/fitness')
      }

   }
   
})


// LOGOUT HANDLE
usersRouter.get('/logout', (req, res) => {
   
   req.user.strava_access_token = null
   req.user.save()
   req.session.destroy((err) => {
      if(err){
         return next(err)
      } else {
         return res.redirect('/login')
      }
   })
   req.flash('success_msg', 'You are logged out')
   res.redirect('/login')
})

// DASHBOARD ROUTE
// usersRouter.get('/', (req, res) => {
//    res.render('dashboard')
// })

module.exports = usersRouter