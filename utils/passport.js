const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const StravaStrategy = require('passport-strava-oauth2').Strategy

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const config = require('./config')
// const localStorage = require('node-localstorage')

// USER MODEL
const User = require('../models/User')

// LOCAL STRATEGY
module.exports = (passport) => {

   // STRAVA STRATEGY
    passport.use(
      new StravaStrategy({
         callbackURL:'/api/auth/strava/callback',
         clientID: config.STRAVA_ID,
         clientSecret: config.STRAVA_SECRET
      }, (accessToken, refreshToken, profile, user, done) => {
         
         User.findOne({ stravaId: profile.athlete.id })
            .then((user) => {
               // console.log(user)
               // CHECK IF USER EXIST
               if(user){
                  // SAVE ACCESS TOKEN
                  user.strava_access_token = accessToken
                  user.save()

                  done(null, user)
               } else {
                  // USER DOES NOT EXIST
                  new User({
                     firstname: profile.name.givenName,
                     lastname: profile.name.familyName,
                     email: profile.emails[0].value,
                     stravaId: profile.id,
                     profileImage: profile.photos[0].value
                  }).save().then((newUser) => {
                     // console.log(`new user created ${newUser}`)
                     done(null, newUser)
                  })
               }
            })
         
         
      })
   )

   // SERIALIZE USER
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })
   // DESERIALIZE USER
   passport.deserializeUser((id, done) => {
      User.findById(id).then((user) => {
         done(null, user)
      })
   })

}
