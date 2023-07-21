/* eslint-disable */
 const axios = require('axios');
 const {promisify } = require('util');
 const uid = 26
 const connection = require('../database/database.js')


 //Full Article data
//  exports.getProductName = async (req, res) => {
//     const query =
//       "SELECT a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id";
  
//     connection.query(query, (error, productData) => {
//       if (error) {
//         console.log("Error executing query:", err);
//         res.status(210).json("error")
//         return;
//       }else{
//         res.status(200).json(productData)
//       }
//     //   res.json(results);
//     });
//   };
// exports.grlAllArticles = async (req, res) => {
//   const query =
//   "SELECT a.id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id GROUP BY a.ArticleNumber LIMIT100";

//   connection.query(query, (error, productData) => {
//     if (error) {
//       console.log("Error executing query:", err);
//       res.status(500).json("error");
//       return;
//     } else {
//       res.status(200).json(productData);
//     }
//   });
// };
exports.grlAllArticles = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = 100; // Set the number of records to return per page

  // Calculate the offset based on the current page and limit
  const offset = (page - 1) * limit;

  const query = `
    SELECT a.id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory
    FROM article AS a
    INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId
    INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId
    INNER JOIN category AS c ON a.CategoryId = c.Id
    INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id
    GROUP BY a.ArticleNumber
    ORDER BY a.id
    LIMIT ${limit} OFFSET ${offset}
  `;

  connection.query(query, (error, productData) => {
    if (error) {
      console.log("Error executing query:", error);
      res.status(500).json("error");
      return;
    } else {
      res.status(200).json(productData);
    }
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

  //Add to wishlist post api
exports.AddWishlist = (req, res) => {
  const { user_id, article_id } = req.body;
  console.log(user_id, article_id );
  const query =
    "INSERT INTO `wishlist` ( `party_id`, `article_id`) VALUES (" +
    user_id +
    "," +
    article_id +
    ")";
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to create data in database" });
    } else {
      res.status(200).json(results);
    }
  });
};

//get wishlist api
exports.getWishlist = (req, res) => {
  const { party_id } = req.body;
  const query = `SELECT a.Id,a.ArticleNumber, r.ArticleRate, c.Title, p.Name as article_photos FROM wishlist wl INNER JOIN article a ON wl.article_id = a.Id INNER JOIN articlerate r ON a.Id = r.ArticleId left JOIN articlephotos p ON a.Id = p.ArticlesId INNER JOIN category c ON a.CategoryId = c.Id  WHERE wl.party_id = ${party_id} GROUP BY a.Id`;

  connection.query(query, (error, status) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to get data from database table" });
    } else {
      res.status(200).json(status);
    }
  });
};

  exports.grlAllArticlesscroll = (req,res) =>{
    // API endpoint for infinite scrolling

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = 20; // Adjust the limit as needed

  // Calculate the offset based on the current page and limit
  const offset = (page - 1) * limit;

  // New query with joins
  const query = `
    SELECT a.id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory
    FROM article AS a
    INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId
    INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId
    INNER JOIN category AS c ON a.CategoryId = c.Id
    INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id
    GROUP BY a.ArticleNumber
    ORDER BY a.id
    LIMIT ${limit} OFFSET ${offset}
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Check if there are more results
    const hasMore = results.length === limit;

    // Send the response with the results and hasMore flag
    res.status(200).json({ results, hasMore });
  });

  }





  