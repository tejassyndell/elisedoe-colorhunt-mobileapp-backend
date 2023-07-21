/* eslint-disable */
const express = require('express')
const Routes = express.Router()
const {
  gatAllArticles,
  getCategories,
  gatAllArticlesscroll,
  getWishlist,
  AddWishlist,
} = require('../controller/controllerM2.js')


//for login auth

// grlAllArticles
// //for dashboard
// //---------------------new change 28-----------------------
Routes.get('/gatAllArticles', gatAllArticles);
Routes.get('/getCategories', getCategories);
Routes.get('/gatAllArticlesscroll', gatAllArticlesscroll);
Routes.post('/getWishlist', getWishlist);
Routes.post('/AddWishlist', AddWishlist);

// //---------------------new change 28-----------------------


module.exports = Routes
