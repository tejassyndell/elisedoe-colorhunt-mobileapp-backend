/* eslint-disable */

const connection = require("../database/database.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
//ff
//delete wishlist api
exports.deletewishlist = (req, res) => {
  const party_id = req.body.party_id;
  const article_id = req.body.article_id;
  const query = `DELETE FROM wishlist WHERE party_id = ${party_id} AND article_id = ${article_id}`

   connection.query(query, (error, results) => {
     if (error) {
       console.error("Error executing query:", error);
       res
         .status(500)
         .json({ error: "Failed to get data from database table" });
     } else {
       res.status(200).json(results);
     }
   });
}




//upload image api
exports.uploadimage = (req, res) => {
  upload.single('file') = (req, res) => {
    
  }
}



// exports.uploadimage = (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded.' });
//   }

//   // Read the image file
//   const imageFile = req.file;

//   // Prepare the data to be inserted into the database
//   const imageData = {
//     filename: imageFile.originalname,
//     mimetype: imageFile.mimetype,
//     data: imageFile.buffer,
//   };
//   const query = "UPDATE party SET profile_img =? WHERE Id = 197"
//   connection.query(query, [imageData.data], (err, results) => {
//     if (err) {
//       console.log("error saving image to dtabase:", err);
//       return res.status(500).json({message:'Error Saving image'})
//     }
//     console.log("Image Saved Successfully");
//     return res.status(200).json({ message: 'Image Saved Successfully' });
//   })
// }
