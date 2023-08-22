/* eslint-disable */
const express = require("express");
const Routes = express.Router();
const {
  getAllArticles,
  getCategories,
  getParty,
  AddWishlist,
  getWishlist,
  uploadimage,
  deletewishlist,
  articledetails,
  orderdetails,
  addtocart,
  cartdetails,
  deletecartitem,
} = require("../controller/controllerM2.js");

//for login auth

// //for dashboard
// //---------------------new change 28-----------------------
Routes.get("/getAllArticles", getAllArticles);
Routes.get("/getCategories", getCategories);
Routes.get("/getParty", getParty);
Routes.post("/addWishlist", AddWishlist);
Routes.post("/getWishlist", getWishlist);
Routes.post("/uploadimage", uploadimage);
Routes.post("/deletewishlist", deletewishlist);
Routes.post("/articledetails", articledetails);
Routes.post("/orderdetails", orderdetails);
Routes.post("/addtocart", addtocart);
Routes.post("/cartdetails", cartdetails);
Routes.post("/deletecartitem",deletecartitem)

// //---------------------new change 28-----------------------

module.exports = Routes;
