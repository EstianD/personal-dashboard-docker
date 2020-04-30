const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const flash = require('connect-flash')
const session = require('express-session')
// const cookieSession = require('cookie-session')
const passport = require('passport')

const config = require('./utils/config')
const auth = require('./utils/auth')

// PASSPORT CONFIG
require('./utils/passport')(passport)

// ROUTERS
// const Router = require('./controllers/index')
const usersRouter = require('./controllers/users')
const dashboardRouter = require('./controllers/index')
const fitnessRouter = require('./controllers/fitness')

const app = express()

// MIDDLEWARE
// EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));

// BODY PARSER
app.use(express.urlencoded({ extended: false }))

// COOKIE SESSION
// app.use(cookieSession({
//    maxAge: 24 * 60 * 60 * 1000, 
//    keys: [config.COOKIE_KEY]
// }))

// EXPRESS-SESSION
app.use(session({
   secret: config.SESSION_KEY,
   saveUninitialized: false,
   resave: false,
   cookie: { 
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
   } //MAKE THIS TRUE IF SERVED OVER HTTPS
}))

// PASSPORT MIDDLEWARE
app.use(passport.initialize())
app.use(passport.session())

// CONNECT FLASH
app.use(flash())

// GLOBAL VARIABLES
app.use((req, res, next) => {
   res.locals.success_msg = req.flash('success_msg')
   res.locals.error_msg = req.flash('error_msg')
   res.locals.error = req.flash('error')
   next()
})

// CONNECT
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true,
useUnifiedTopology: true })
   .then(() => {
      console.log('connected to MongoDB')
   })
   .catch((error) => {
      console.log('error connecting to MongoDB', error.message)
   })


app.use(cors())
app.use(bodyParser.json())

// DEFINE ROUTES
app.use('/', usersRouter)
app.use('/', dashboardRouter)
app.use('/fitness/', fitnessRouter)
// app.use('/', Router)

module.exports = app
