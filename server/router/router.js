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
  CollectInwardForCartArticals,getNotification,
  getSoNumber,
  getsoarticledetails,
  udatepartytoken,
  getcompleteoutwordDetails,
  getCompletedSoDetails,pushnotification,
  FilterSoNumber,
  filteroutwardnumber,
  cartCount,
  sliderimages,
  getAllNotification,
  updateNotification
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
Routes.post("/getsonumber",getSoNumber);
Routes.post("/getsoarticledetails",getsoarticledetails);
Routes.post("/udatepartytoken",udatepartytoken);
Routes.post("/getcompleteoutwordDetails",getcompleteoutwordDetails);
Routes.post("/getcompletedsodetails",getCompletedSoDetails);
Routes.post("/pushnotification",pushnotification);
Routes.post("/filtersonumber",FilterSoNumber);
Routes.post("/filteroutwardnumber",filteroutwardnumber);
Routes.post("/cartcount",cartCount);
Routes.get("/sliderimages",sliderimages)
Routes.post("/getallnotification",getAllNotification);
Routes.post("/updatenotification",updateNotification);
module.exports = Routes;
