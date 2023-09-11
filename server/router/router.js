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
  getCartArticleDetails,
  getcategorywithphotos,
  transportationdropdowns,
  SendMail,findfromthecart,
  updateCartArticale,
  addso
} = require("../controller/controllerM2.js");


Routes.get("/getAllArticles", getAllArticles);
Routes.get("/getCategories", getCategories);
Routes.post("/getParty", getParty);
Routes.post("/addWishlist", AddWishlist);
Routes.post("/getWishlist", getWishlist);
Routes.post("/uploadimage", uploadimage);
Routes.post("/deletewishlist", deletewishlist);
Routes.post("/articledetails", articledetails);
Routes.post("/orderdetails", orderdetails);
Routes.post("/addtocart", addtocart);
Routes.post("/findfromthecart",findfromthecart);
Routes.post("/updateCartArticale",updateCartArticale);
Routes.post("/cartdetails", cartdetails);
Routes.post("/deletecartitem",deletecartitem);
Routes.post("/getCartArticleDetails",getCartArticleDetails)
Routes.get("/getcategorywithphotos",getcategorywithphotos)
Routes.get("/gettransportation",transportationdropdowns)
Routes.post("/addso",addso);
//for contact-us
Routes.post('/SendMail',SendMail)
module.exports = Routes;
