/* eslint-disable */
 const axios = require('axios');
 const {promisify } = require('util');
 const uid = 26
 const connection = require('../database/database.js')


 //Full Article data
 exports.getProductName = async (req, res) => {
    const query =
      "SELECT a.ArticleNumber, a.StyleDescription, a.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id";
  
    connection.query(query, (error, productData) => {
      if (error) {
        console.log("Error executing query:", err);
        res.status(210).json("error")
        return;
      }else{
        res.status(200).json(productData)
      }
    //   res.json(results);
    });
  };
  
 //Full Article Categories data

  exports.getCategories = (req, res) => {
    const query = "SELECT Title as Category from category";
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ error: "Failed to retrieve data from the database" });
      } else {
        console.log(results);
        res.status(200).json(results);
      }
    });
  };
