const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
   firstname: {
      type: String,
      required: true,
   },
   lastname: {
      type: String,
      required: true
   },
   email: {
      type: String
   },
   weight: {
      type: Number
   },
   dateOfBirth: {
      type: String
   },
   stravaId: {
      type: String
   },
   profileImage: {
      type: String
   },
   strava_access_token: {
      type: String
   },
   strava_last_synced: {
      type: Date
   },
   createdAt: {
      type: Date,
      default: Date.now
   }
})

module.exports = mongoose.model('User', userSchema)