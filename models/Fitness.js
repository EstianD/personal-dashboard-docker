const mongoose = require('mongoose')

const fitnessSchema = new mongoose.Schema({
   workout: {
      type: String,
      required: true,
   },
   elapsedTime: {
      type: String,
      required: true
   },
   workoutDate: {
      type: String,
      required: true
   },
   heartrateAvg: {
      type: String
   },
   heartrateMax: {
      type: String
   },
   calories_burned: {
      type: String
   },
   distance: {
      type: String
   },
   fitnessId: {
      type: String
   },
   userId: {
      type: String,
      required:true
   },
   createdAt: {
      type: Date,
      default: Date.now
   }
})

module.exports = mongoose.model('Fitness', fitnessSchema)