/* eslint-disable */
const express = require('express')
const Routes = express.Router()
const {
  getAllArticles,
  getCategories,
  getParty
} = require('../controller/controllerM2.js')


//for login auth


// //for dashboard
// //---------------------new change 28-----------------------
Routes.get('/getAllArticles',getAllArticles);
Routes.get('/getCategories', getCategories);
Routes.get('/getParty', getParty);


// //---------------------new change 28-----------------------


module.exports = Routes
