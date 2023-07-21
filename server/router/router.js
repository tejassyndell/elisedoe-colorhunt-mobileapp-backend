/* eslint-disable */
const express = require('express')
const Routes = express.Router()
const {
  grlAllArticles,
  getCategories,
  grlAllArticlesscroll,
  getWishlist,
  AddWishlist,
} = require('../controller/controllerM2.js')


//for login auth

// grlAllArticles
// //for dashboard
// //---------------------new change 28-----------------------
Routes.get('/gelAllArticles', grlAllArticles);
Routes.get('/getCategories', getCategories);
Routes.get('/gelAllArticlesscroll', grlAllArticlesscroll);
Routes.post('/getWishlist', getWishlist);
Routes.post('/AddWishlist', AddWishlist);

// //---------------------new change 28-----------------------


module.exports = Routes
