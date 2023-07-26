/* eslint-disable */

const connection = require("../database/database.js");
const multer = require("multer");
const Routes = require("../router/router.js");
const moment = require("moment");
const mysql = require("mysql2/promise");
// const connection = require("../database/database.js");

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
    "SELECT a.Id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id GROUP BY a.ArticleNumber LIMIT 100";

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
  const query = `SELECT a.Id, a.ArticleNumber, r.ArticleRate, c.Title, p.Name as article_photos  FROM wishlist wl INNER JOIN article a ON wl.article_id = a.Id INNER JOIN articlerate r ON a.Id = r.ArticleId left JOIN articlephotos p ON a.Id = p.ArticlesId INNER JOIN category c ON a.CategoryId = c.Id WHERE wl.party_id = ${party_id} GROUP BY a.Id`;

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
// exports.articledetails = (req, res) => {
//   const article_id = req.body.article_id;
//   const query = `SELECT
//   a.StyleDescription,
//   a.ArticleNumber,
//   a.ArticleColor,
//   a.ArticleSize,
//   a.OpeningStock,
//   GROUP_CONCAT(ap.Name) AS photos,
//   ar.ArticleRate,
//   c.Title AS Category
// FROM article a
// LEFT JOIN articlephotos ap ON a.Id = ap.ArticlesId
// LEFT JOIN articlerate ar ON a.Id = ar.ArticleId
// LEFT JOIN category c ON a.CategoryId = c.Id
// WHERE a.Id = ${article_id};`

//   connection.query(query, (error, results) => {
//     if (error) {
//       console.error("Error executing query:", error);
//       res.status(500).json({ error: "Failed to get data from database table" });
//     } else {
//       // Check if results array is not empty
//       if (results.length === 0) {
//         res.status(404).json({ error: "Article not found" });
//       } else {
//         const formattedResult = {
//           ...results[0],
//           photos: results[0].photos ? results[0].photos.split(",") : [],
//         };
//         res.json(formattedResult);
//       }
//     }
//   });
// };
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

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
// exports.articledetails = (req, res) => {
//   async function calculateArticleData(ArticleId, PartyId) {
//     try {
//       const articleFlagCheckQuery = `SELECT ArticleOpenFlag FROM article WHERE Id = '${ArticleId}'`;
//       const outletArticleRateQuery = `SELECT UserId, OutletArticleRate, OutletAssign FROM party WHERE Id = '${PartyId}'`;

//       const [articleFlagCheck, outletArticleRate] = await Promise.all([
//         executeQuery(articleFlagCheckQuery),
//         executeQuery(outletArticleRateQuery),
//       ]);

//       let totalInward = 0;
//       let totalOutwards = 0;

//       const inwardQuery = `SELECT NoPacks FROM Inward WHERE ArticleId = '${ArticleId}'`;
//       const outwardQuery = `SELECT NoPacks FROM Outward WHERE ArticleId = '${ArticleId}'`;
//       // Other queries for salesreturns, purchasereturns, stocktransfers, stockshortage, SO, etc.

//       const [inwards, outwards] = await Promise.all([
//         executeQuery(inwardQuery),
//         executeQuery(outwardQuery),
//         // Execute other queries and store the results in their respective variables
//       ]);

//       // Process inward records
//       for (const inward of inwards) {
//         if (inward.NoPacks.includes(",")) {
//           totalInward += inward.NoPacks.split(",").reduce(
//             (acc, val) => acc + parseInt(val),
//             0
//           );
//         } else {
//           totalInward += parseInt(inward.NoPacks);
//         }
//       }

//       // Process other records like salesreturns, purchasereturns, stocktransfers, stockshortage, SO, etc.

//       // Calculate TotalRemaining
//       const TotalRemaining = totalInward - totalOutwards;

//       let outletArticleRateValue;
//       if (outletArticleRate[0].OutletAssign === 1) {
//         outletArticleRateValue = outletArticleRate[0].OutletArticleRate;
//       } else {
//         let outletPartyArticleRate;
//         if (outletArticleRate[0].UserId) {
//           const userRecordQuery = `SELECT PartyId FROM Users WHERE Id = '${outletArticleRate[0].UserId}'`;
//           const userRecord = await executeQuery(userRecordQuery);
//           if (userRecord[0].PartyId !== 0) {
//             const outletPartyArticleRateQuery = `SELECT OutletArticleRate FROM party WHERE Id = '${userRecord[0].PartyId}'`;
//             const outletPartyResult = await executeQuery(
//               outletPartyArticleRateQuery
//             );
//             outletPartyArticleRate = outletPartyResult[0].OutletArticleRate;
//           } else {
//             // Set outletPartyArticleRate to 0 or any default value as needed
//             outletPartyArticleRate = 0;
//           }
//         } else {
//           // Set outletPartyArticleRate to 0 or any default value as needed
//           outletPartyArticleRate = 0;
//         }
//         outletArticleRateValue =
//           outletPartyArticleRate || outletArticleRate[0].OutletArticleRate;
//       }

//       if (articleFlagCheck[0].ArticleOpenFlag === 0) {
//         const articleDataQuery = `SELECT art.ArticleOpenFlag, art.ArticleNumber, ar.ArticleRate, art.ArticleRatio, art.ArticleSize, art.ArticleColor,
//           (CASE WHEN c.Colorflag IS NULL THEN cc.Colorflag ELSE c.Colorflag END) AS Colorflag,
//           (CASE WHEN c.Title IS NULL THEN cc.Title ELSE c.Title END) AS Category, i.NoPacks, i.SalesNoPacks , ap.Name as Photos
//           FROM article art
//           LEFT JOIN po p ON p.ArticleId=art.Id
//           LEFT JOIN category c ON c.Id=p.CategoryId
//           LEFT JOIN category cc ON cc.Id=art.CategoryId
//           LEFT JOIN articlerate ar ON ar.ArticleId=art.Id
//           INNER JOIN inward i ON i.ArticleId=art.Id
//           lEFT JOIN articlephotos ap ON art.Id = ap.ArticlesId
//           WHERE art.Id='${ArticleId}'
//           ORDER BY i.Id DESC
//           LIMIT 0, 1`;

//         const data = await executeQuery(articleDataQuery);
//         for (const record of data) {
//           record.NoPacks = TotalRemaining;
//           if (outletArticleRate.length !== 0) {
//             record.ArticleRate += outletArticleRateValue;
//           }
//         }
//         return data;
//       } else {
//         const mixNoPacksQuery = `SELECT mxp.NoPacks, a.ArticleNumber, c.Title AS Category, ar.ArticleRate, a.ArticleOpenFlag
//           FROM mixnopacks mxp
//           INNER JOIN article a ON a.Id=mxp.ArticleId
//           LEFT JOIN category c ON c.Id=a.CategoryId
//           LEFT JOIN articlerate ar ON ar.ArticleId=a.Id
//           WHERE mxp.ArticleId='${ArticleId}'`;

//         const data = await executeQuery(mixNoPacksQuery);
//         for (const record of data) {
//           record.NoPacks = TotalRemaining;
//           record.ArticleRate += outletArticleRateValue;
//         }
//         return data;
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }
//   const photosquery = `SELECT GROUP_CONCAT(ap.Name) AS photos FROM article a
// LEFT JOIN articlephotos ap ON a.Id = ap.ArticlesId
// LEFT JOIN articlerate ar ON a.Id = ar.ArticleId
// LEFT JOIN category c ON a.CategoryId = c.Id
// WHERE a.Id = 100; `;

//   connection.query(photosquery, (error, results) => {
//     if (error) {
//       console.error("Error executing query:", error);
//       res.status(500).json({ error: "Failed to get data from database table" });
//     } else {
//       // Check if results array is not empty
//       if (results.length === 0) {
//         res.status(404).json({ error: "Article not found" });
//       } else {
//         const formattedResult = {
//           ...results[0],
//           photos: results[0].photos ? results[0].photos.split(",") : [],
//         };

//         res.json(formattedResult);
//       }
//     }
//   });

//   // Usage example
//   calculateArticleData("100", "812")
//     .then((result) => res.json(result))
//     .catch((error) => console.error("Error:", error));
// };

exports.articledetails = async (req, res) => {
  try {
    const ArticleId = "100"; // Set the ArticleId here
    const PartyId = "812"; // Set the PartyId here

    async function calculateArticleData(ArticleId, PartyId) {
      try {
        const articleFlagCheckQuery = `SELECT ArticleOpenFlag FROM article WHERE Id = '${ArticleId}'`;
        const outletArticleRateQuery = `SELECT UserId, OutletArticleRate, OutletAssign FROM party WHERE Id = '${PartyId}'`;

        const [articleFlagCheck, outletArticleRate] = await Promise.all([
          executeQuery(articleFlagCheckQuery),
          executeQuery(outletArticleRateQuery),
        ]);

        let totalInward = 0;
        let totalOutwards = 0;

        const inwardQuery = `SELECT NoPacks FROM Inward WHERE ArticleId = '${ArticleId}'`;
        const outwardQuery = `SELECT NoPacks FROM Outward WHERE ArticleId = '${ArticleId}'`;
        // Other queries for salesreturns, purchasereturns, stocktransfers, stockshortage, SO, etc.

        const [inwards, outwards] = await Promise.all([
          executeQuery(inwardQuery),
          executeQuery(outwardQuery),
          // Execute other queries and store the results in their respective variables
        ]);

        // Process inward records
        for (const inward of inwards) {
          if (inward.NoPacks.includes(",")) {
            totalInward += inward.NoPacks.split(",").reduce(
              (acc, val) => acc + parseInt(val),
              0
            );
          } else {
            totalInward += parseInt(inward.NoPacks);
          }
        }

        // Process other records like salesreturns, purchasereturns, stocktransfers, stockshortage, SO, etc.

        // Calculate TotalRemaining
        const TotalRemaining = totalInward - totalOutwards;

        let outletArticleRateValue;
        if (outletArticleRate[0].OutletAssign === 1) {
          outletArticleRateValue = outletArticleRate[0].OutletArticleRate;
        } else {
          let outletPartyArticleRate;
          if (outletArticleRate[0].UserId) {
            const userRecordQuery = `SELECT PartyId FROM Users WHERE Id = '${outletArticleRate[0].UserId}'`;
            const userRecord = await executeQuery(userRecordQuery);
            if (userRecord[0].PartyId !== 0) {
              const outletPartyArticleRateQuery = `SELECT OutletArticleRate FROM party WHERE Id = '${userRecord[0].PartyId}'`;
              const outletPartyResult = await executeQuery(
                outletPartyArticleRateQuery
              );
              outletPartyArticleRate = outletPartyResult[0].OutletArticleRate;
            } else {
              // Set outletPartyArticleRate to 0 or any default value as needed
              outletPartyArticleRate = 0;
            }
          } else {
            // Set outletPartyArticleRate to 0 or any default value as needed
            outletPartyArticleRate = 0;
          }
          outletArticleRateValue =
            outletPartyArticleRate || outletArticleRate[0].OutletArticleRate;
        }

        if (articleFlagCheck[0].ArticleOpenFlag === 0) {
          const articleDataQuery = `SELECT  art.ArticleNumber, ar.ArticleRate, art.ArticleRatio, art.ArticleSize, art.ArticleColor, 
                
                  (CASE WHEN c.Title IS NULL THEN cc.Title ELSE c.Title END) AS Category, i.SalesNoPacks
                  FROM article art
                  LEFT JOIN po p ON p.ArticleId=art.Id
                  LEFT JOIN category c ON c.Id=p.CategoryId
                  LEFT JOIN category cc ON cc.Id=art.CategoryId
                  LEFT JOIN articlerate ar ON ar.ArticleId=art.Id
                  INNER JOIN inward i ON i.ArticleId=art.Id 
                  
                  WHERE art.Id='${ArticleId}'
                  ORDER BY i.Id DESC
                  LIMIT 0, 1`;

          const data = await executeQuery(articleDataQuery);
          for (const record of data) {
            record.NoPacks = TotalRemaining;
            if (outletArticleRate.length !== 0) {
              record.ArticleRate += outletArticleRateValue;
            }
          }
          return data;
        } else {
          const mixNoPacksQuery = `SELECT mxp.NoPacks, a.ArticleNumber, c.Title AS Category, ar.ArticleRate, a.ArticleOpenFlag
                  FROM mixnopacks mxp
                  INNER JOIN article a ON a.Id=mxp.ArticleId
                  LEFT JOIN category c ON c.Id=a.CategoryId
                  LEFT JOIN articlerate ar ON ar.ArticleId=a.Id
                  WHERE mxp.ArticleId='${ArticleId}'`;

          const data = await executeQuery(mixNoPacksQuery);
          for (const record of data) {
            record.NoPacks = TotalRemaining;
            record.ArticleRate += outletArticleRateValue;
          }
          return data;
        }
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    }

    const photosquery = `SELECT GROUP_CONCAT(ap.Name) AS photos FROM article a
      LEFT JOIN articlephotos ap ON a.Id = ap.ArticlesId
      LEFT JOIN articlerate ar ON a.Id = ar.ArticleId
      LEFT JOIN category c ON a.CategoryId = c.Id
      WHERE a.Id = ${ArticleId};`;

    const [calculatedData, photosResult] = await Promise.all([
      calculateArticleData(ArticleId, PartyId),
      executeQuery(photosquery),
    ]);

    if (photosResult.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const formattedResult = {
      ...photosResult[0],
      photos: photosResult[0].photos ? photosResult[0].photos.split(",") : [],
    };

    // Merge the calculated data into the formatted result
    formattedResult.calculatedData = calculatedData;

    res.json(formattedResult);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get data from database table" });
  }
};
