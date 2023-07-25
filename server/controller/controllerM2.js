/* eslint-disable */

const connection = require("../database/database.js");
const multer = require("multer");
const Routes = require("../router/router.js");
const moment = require("moment");

const imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    callback(null, `image-${Date.now()}.${file.originalname}`);
  },
});
const imgfilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(null, error("Only Image is allowed"));
  }
};
const upload = multer({
  storage: imgconfig,
  fileFilter: imgfilter,
});

//Full Article data
exports.getAllArticles = async (req, res) => {
  const query =
    "SELECT a.id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id GROUP BY a.ArticleNumber LIMIT 100";

  connection.query(query, (error, productData) => {
    if (error) {
      console.log("Error executing query:", err);
      res.status(210).json("error");
      return;
    } else {
      res.status(200).json(productData);
    }
  });
};
//Categories
exports.getCategories = (req, res) => {
  const query = "SELECT Title as Category from category";
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve data from the database" });
    } else {
      res.status(200).json(results);
    }
  });
};
//Party Api
exports.getParty = (req, res) => {
  const query = "SELECT * FROM `party` WHERE `Id`=197 ";
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve data from the database" });
    } else {
      res.status(200).json(results);
    }
  });
};
//Add to wishlist post api
exports.AddWishlist = (req, res) => {
  const { user_id, article_id } = req.body;
  const query = `INSERT INTO wishlist ( party_id,article_id) VALUES ( ${user_id}, ${article_id} )`;

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

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to get data from database table" });
    } else {
      res.status(200).json(results);
    }
  });
};
//delete wishlist api
exports.deletewishlist = (req, res) => {
  const party_id = req.body.party_id;
  const article_id = req.body.article_id;
  const query = `DELETE FROM wishlist WHERE party_id = ${party_id} AND article_id = ${article_id}`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to get data from database table" });
    } else {
      res.status(200).json(results);
    }
  });
};
//article Details
exports.articledetails = (req, res) => {
  const article_id = req.body.article_id;
  const query = `SELECT
  a.StyleDescription,
  a.ArticleNumber,
  a.ArticleColor,
  a.ArticleSize,
  a.OpeningStock,
  GROUP_CONCAT(ap.Name) AS photos,
  ar.ArticleRate,
  c.Title AS Category
FROM article a
LEFT JOIN articlephotos ap ON a.Id = ap.ArticlesId
LEFT JOIN articlerate ar ON a.Id = ar.ArticleId
LEFT JOIN category c ON a.CategoryId = c.Id
WHERE ${article_id}
GROUP BY
  a.StyleDescription,
  a.ArticleNumber,
  a.ArticleColor,
  a.ArticleSize,
  a.OpeningStock,
  ar.ArticleRate,
  c.Title;`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to get data from database table" });
    } else {
      // Check if results array is not empty
      if (results.length === 0) {
        res.status(404).json({ error: "Article not found" });
      } else {
        const formattedResult = {
          ...results[0],
          photos: results[0].photos ? results[0].photos.split(",") : [],
        };
        res.json(formattedResult);
      }
    }
  });
};
//upload pic profile
exports.uploadimage = (req, res) => {
  upload.single("image")(req, res, (err) => {
    const filename = `'` + req.file.filename + `'`;
    console.log(filename);
    if (!filename) {
      res.status(422).json({ status: 422, message: "No image" });
    }
    try {
      connection.query(
        `UPDATE party SET profile_img = ${filename} WHERE Id = 197`
      ),
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Image added");
            res.status(201).json({ status: 201, data: req.body });
          }
        };
    } catch (error) {
      res.status(422).json({ status: 422, error });
    }
  });
};
