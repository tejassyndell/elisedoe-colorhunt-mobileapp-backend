/* eslint-disable */
const express = require("express");
const Routes = express.Router();
const {
  createAccount,
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
  addso,
  phoneNumberValidation,
  UserData,
  CollectInwardForCartArticals,getNotification
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
Routes.post('/SendMail',SendMail)
Routes.post("/createAccount", createAccount);
Routes.post("/phoneNumberValidation", phoneNumberValidation);
Routes.post("/UserData", UserData);
Routes.post("/collectinwardforcartarticals", CollectInwardForCartArticals);
Routes.post("/getNotification", getNotification);

module.exports = Routes;
