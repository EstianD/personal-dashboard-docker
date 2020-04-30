const express = require('express')
const dashboardRouter = require('express').Router()
const { ensureAuthenticated } = require('../utils/auth')


module.exports = dashboardRouter
