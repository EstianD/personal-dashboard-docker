require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
let JWT_SECRET = process.env.JWT_SECRET
let GOOGLE_ID = process.env.GOOGLE_CLIENT_ID
let GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET
let STRAVA_ID = process.env.STRAVA_CLIENT_ID
let STRAVA_SECRET = process.env.STRAVA_CLIENT_SECRET
let SESSION_KEY = process.env.SESSION_KEY


if(process.env.NODE_ENV === "test"){
   MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
   MONGODB_URI,
   PORT,
   JWT_SECRET,
   GOOGLE_ID,
   GOOGLE_SECRET,
   SESSION_KEY,
   STRAVA_ID,
   STRAVA_SECRET
}