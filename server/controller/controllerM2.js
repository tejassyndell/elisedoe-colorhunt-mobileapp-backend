/* eslint-disable */

const { json } = require("body-parser");
const connection = require("../database/database.js");
const multer = require("multer");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { Expo } = require('expo-server-sdk');
const express = require('express');

const app = express();

app.use(bodyParser.json());

// Create an Expo client
const expo = new Expo();

// Replace with your Firebase Admin setup code (initialize Firebase)
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//image upload function
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
    "SELECT a.Id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id GROUP BY a.ArticleNumber LIMIT 50";

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

//createAccount
exports.createAccount = async (req, res) => {
  const {
    name,
    address,
    phoneNumber,
    state,
    country,
    city,
    pincode,
    contactPerson,
  } = req.body;

  const insertQuery =
    "INSERT INTO account (Name, Address, PhoneNumber, State, Country, City, Pincode, ContactPerson) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  connection.query(
    insertQuery,
    [name, address, phoneNumber, state, country, city, pincode, contactPerson],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res
          .status(500)
          .json({ error: "Failed to insert data into the database" });
      } else {
        console.log("Account data inserted:", result);
        res.status(200).json({ message: "Account created successfully" });
      }
    }
  );
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

//Categories
exports.getCategories = (req, res) => {
  const query = "SELECT Title as Category from category";
  console.log("done");
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
  const party_id = req.body.party_id
  const query = `SELECT * FROM party WHERE Id=${party_id}`;
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
}

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

//article Details
exports.articledetails = async (req, res) => {
  try {
    const { ArticleId, PartyId } = req.query;
    console.log(ArticleId, PartyId);
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
          const articleDataQuery = `SELECT sc.Name as subcategory, art.ArticleNumber, ar.ArticleRate, art.ArticleRatio, art.ArticleSize, art.ArticleColor, 
                
          (CASE WHEN c.Title IS NULL THEN cc.Title ELSE c.Title END) AS Category, i.SalesNoPacks
          FROM article art
          LEFT JOIN po p ON p.ArticleId=art.Id
          LEFT JOIN category c ON c.Id=p.CategoryId
          LEFT JOIN category cc ON cc.Id=art.CategoryId
          LEFT JOIN subcategory sc ON sc.CategoryId = cc.Id
          LEFT JOIN articlerate ar ON ar.ArticleId=art.Id
          INNER JOIN inward i ON i.ArticleId=art.Id 
          
          WHERE art.Id= ${ArticleId}
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

//issue vadi order api
exports.orderdetails = (req, res) => {
  async function createOrUpdateSO(request) {
    const data = request.body;

    if (data.SoNumberId === "Add") {
      const generate_SONUMBER = GenerateSoNumber(data.UserId);
      const SO_Number = generate_SONUMBER.SO_Number;
      const SO_Number_Financial_Id = generate_SONUMBER.SO_Number_Financial_Id;

      const SoNumberId = await insertSonumber({
        SoNumber: SO_Number,
        FinancialYearId: SO_Number_Financial_Id,
        UserId: data.UserId,
        PartyId: data.PartyId,
        SoDate: data.Date,
        Destination: data.Destination,
        Transporter: data.Transporter,
        Remarks: data.Remarks,
        GSTAmount: data.GST,
        GSTPercentage: data.GST_Percentage,
        GSTType: data.GSTType,
        CreatedDate: new Date().toISOString(),
      });

      const userName = await Users.findOne({ where: { Id: data.UserId } });
      const sodRec = await querySONumberWithFinancialYear(SoNumberId);
      await UserLogs.create({
        Module: "SO",
        ModuleNumberId: SoNumberId,
        LogType: "Created",
        LogDescription: `${userName.Name} created so with SO Number ${sodRec.SONumber}`,
        UserId: userName.Id,
        updated_at: null,
      });

      const artRecor = await Article.findOne({ where: { Id: data.ArticleId } });
      await UserLogs.create({
        Module: "SO",
        ModuleNumberId: SoNumberId,
        LogType: "Updated",
        LogDescription: `${userName.Name} added article ${artRecor.ArticleNumber} in so with SO Number ${sodRec.SONumber}`,
        UserId: userName.Id,
        updated_at: null,
      });
    } else {
      const checksonumber = await getSonumberById(data.SoNumberId);
      if (!checksonumber) {
        // Handle error, sonumber not found
      } else {
        await updateSonumber(data.SoNumberId, {
          SoDate: data.Date,
          PartyId: data.PartyId,
          Destination: data.Destination,
          Transporter: data.Transporter,
          Remarks: data.Remarks,
          GSTAmount: data.GST,
          GSTPercentage: data.GST_Percentage,
          GSTType: data.GSTType,
        });

        const userName = await Users.findOne({ where: { Id: data.UserId } });
        const sodRec = await querySONumberWithFinancialYear(data.SoNumberId);
        const artRecor = await Article.findOne({
          where: { Id: data.ArticleId },
        });
        await UserLogs.create({
          Module: "SO",
          ModuleNumberId: data.SoNumberId,
          LogType: "Updated",
          LogDescription: `${userName.Name} added article ${artRecor.ArticleNumber} in so with SO Number ${sodRec.SONumber}`,
          UserId: userName.Id,
          updated_at: null,
        });
      }
    }

    let ArticleRate;
    if (data.ArticleRate !== undefined) {
      ArticleRate = data.ArticleRate;
    } else {
      const artratedata = await queryArticleRateByArticleId(data.ArticleId);
      const partyrec = await queryPartyById(data.PartyId);
      const partyuser = await Users.findOne({ where: { Id: partyrec.UserId } });

      if (partyuser) {
        if (partyuser.PartyId !== 0) {
          const outpartyrec = await queryPartyById(partyuser.PartyId);
          ArticleRate = artratedata.ArticleRate + outpartyrec.OutletArticleRate;
        } else {
          ArticleRate = artratedata.ArticleRate;
        }
      } else {
        ArticleRate = artratedata.ArticleRate;
      }
    }

    if (data.ArticleOpenFlag === 1) {
      const mixnopacks = await queryMixnopacksByArticleId(data.ArticleId);
      let NoPacks = "";
      let SalesNoPacks = "";
      if (data.NoPacksNew !== undefined) {
        NoPacks = data.NoPacksNew;
        if (data.NoPacksNew === 0) {
          return { id: "", NoOfSetNotMatch: "true" };
        }
        if (data.NoPacks < data.NoPacksNew) {
          return { id: "", NoOfSetNotMatch: "true" };
        }
        SalesNoPacks = mixnopacks.NoPacks - data.NoPacksNew;
      } else {
        return { id: "", ZeroNotAllow: "true" };
      }

      const sonumberdata = await querySoBySoNumberIdAndArticleId(
        data.SoNumberId,
        data.ArticleId
      );
      const getnppacks = sonumberdata.NoPacks;
      await updateMixnopacksByArticleId(data.ArticleId, {
        NoPacks: SalesNoPacks,
      });

      if (sonumberdata.total > 0) {
        const nopacksadded = getnppacks + NoPacks;

        await updateSoBySoNumberIdAndArticleId(
          data.SoNumberId,
          data.ArticleId,
          {
            NoPacks: nopacksadded,
            OutwardNoPacks: nopacksadded,
            ArticleRate: ArticleRate,
          }
        );
      } else {
        const soadd = {
          SoNumberId: data.SoNumberId,
          ArticleId: data.ArticleId,
          NoPacks: NoPacks,
          OutwardNoPacks: NoPacks,
          ArticleRate: ArticleRate,
        };
        await SO.create(soadd);
      }

      return { SoNumberId: data.SoNumberId, SO_Number: data.SO_Number };
    } else {
      const soadd = {};
      const dataresult = await queryColorFlagByArticleId(data.ArticleId);
      const Colorflag = dataresult.Colorflag;
      const datanopacks = await querySalesNoPacksByArticleId(data.ArticleId);
      const search = datanopacks.SalesNoPacks;
      let stringcomma = 0;
      let NoPacks = "";
      let SalesNoPacks = "";

      if (search.includes(",")) {
        const string = search.split(",");
        stringcomma = 1;

        if (Colorflag === 1) {
          for (const [key, vl] of data.ArticleSelectedColor.entries()) {
            const numberofpacks = vl.Id;
            if (data[`NoPacksNew_${numberofpacks}`] !== "") {
              if (stringcomma === 1) {
                if (string[key] < data[`NoPacksNew_${numberofpacks}`]) {
                  return { id: "", NoOfSetNotMatch: "true" };
                }
                SalesNoPacks += `${string[key] - data[`NoPacksNew_${numberofpacks}`]
                  },`;
              } else {
                if (search < data[`NoPacksNew_${numberofpacks}`]) {
                  return { id: "", NoOfSetNotMatch: "true" };
                }
                SalesNoPacks += `${search - data[`NoPacksNew_${numberofpacks}`]
                  },`;
              }
              NoPacks += `${data[`NoPacksNew_${numberofpacks}`]},`;
            } else {
              NoPacks += "0,";
              SalesNoPacks += `${string[key]},`;
            }
          }
        } else {
          if (data.NoPacksNew !== undefined) {
            NoPacks += data.NoPacksNew;
            if (search < data.NoPacksNew) {
              return { id: "", NoOfSetNotMatch: "true" };
            }
            SalesNoPacks += `${search - data.NoPacksNew},`;
          } else {
            return { id: "", ZeroNotAllow: "true" };
          }
        }
      }

      NoPacks = NoPacks.slice(0, -1);
      SalesNoPacks = SalesNoPacks.slice(0, -1);

      const CheckSalesNoPacks = NoPacks.split(",");
      const tmp = CheckSalesNoPacks.filter((item) => item !== "");
      if (tmp.length === 0) {
        return { id: "", ZeroNotAllow: "true" };
      }

      const sonumberdata = await querySoBySoNumberIdAndArticleId(
        data.SoNumberId,
        data.ArticleId
      );
      const getnppacks = sonumberdata.NoPacks;
      await updateInwardByArticleId(data.ArticleId, {
        SalesNoPacks: SalesNoPacks,
      });

      if (sonumberdata.total > 0) {
        let nopacksadded = "";
        if (NoPacks.includes(",")) {
          const NoPacks1 = NoPacks.split(",");
          const getnppacks = getnppacks.split(",");
          for (const [key, vl] of getnppacks.entries()) {
            nopacksadded += `${parseInt(NoPacks1[key]) + parseInt(vl)},`;
          }
        } else {
          nopacksadded += `${getnppacks + NoPacks},`;
        }
        nopacksadded = nopacksadded.slice(0, -1);

        await updateSoBySoNumberIdAndArticleId(
          data.SoNumberId,
          data.ArticleId,
          {
            NoPacks: nopacksadded,
            OutwardNoPacks: nopacksadded,
            ArticleRate: ArticleRate,
          }
        );
      } else {
        const soadd = {
          SoNumberId: data.SoNumberId,
          ArticleId: data.ArticleId,
          NoPacks: NoPacks,
          OutwardNoPacks: NoPacks,
          ArticleRate: ArticleRate,
        };
        await SO.create(soadd);
      }

      return { SoNumberId: data.SoNumberId, SO_Number: data.SO_Number };
    }
  }

  // Helper functions for database queries
  async function querySONumberWithFinancialYear(SoNumberId) {
    // Your database query logic here to fetch the SO Number with Financial Year based on SoNumberId
    // Return an object with 'SONumber' and 'FinancialYear' properties
  }

  async function queryArticleRateByArticleId(ArticleId) {
    // Your database query logic here to fetch the ArticleRate based on ArticleId
    // Return the ArticleRate value
  }

  async function queryPartyById(PartyId) {
    // Your database query logic here to fetch the party data based on PartyId
    // Return the party data
  }

  async function queryMixnopacksByArticleId(ArticleId) {
    // Your database query logic here to fetch the mixnopacks data based on ArticleId
    // Return the mixnopacks data
  }

  async function querySoBySoNumberIdAndArticleId(SoNumberId, ArticleId) {
    // Your database query logic here to fetch the SO data based on SoNumberId and ArticleId
    // Return the SO data
  }

  async function queryColorFlagByArticleId(ArticleId) {
    // Your database query logic here to fetch the Colorflag based on ArticleId
    // Return the Colorflag value
  }

  async function querySalesNoPacksByArticleId(ArticleId) {
    // Your database query logic here to fetch the SalesNoPacks data based on ArticleId
    // Return the SalesNoPacks data
  }

  async function updateMixnopacksByArticleId(ArticleId, data) {
    // Your database update logic here to update the mixnopacks data based on ArticleId
  }

  async function updateSoBySoNumberIdAndArticleId(SoNumberId, ArticleId, data) {
    // Your database update logic here to update the SO data based on SoNumberId and ArticleId
  }

  // Usage:
  const request = {
    body: {
      // Your input data goes here...
    },
  };

  const result = createOrUpdateSO(request);
};

//addtocart api
exports.addtocart = (req, res) => {
  const party_id = req.body.party_id;
  const article_id = req.body.article_id;
  const Quantity = req.body.Quantity;
  const rate = req.body.rate;
  const serailqty = JSON.stringify(Quantity);
  const values = [[party_id, article_id, serailqty, rate]];

  const query = `INSERT INTO cart (party_id,article_id,Quantity,rate) VALUES ?`;

  connection.query(query, [values], (error, results) => {
    if (error) {
      console.log("Error Executing Query:", error);
      res
        .status(500)
        .json({ error: "Failed to get data from database table " });
    } else {
      res.status(200).json(results);
    }
  });
};
//find from cart api
exports.findfromthecart = (req, res) => {
  const party_id = req.body.party_id;
  const article_id = req.body.article_id;

  const values = [[party_id, article_id]];
  console.log("---------", party_id, article_id);
  const query = `SELECT id FROM cart WHERE party_id = ? AND article_id = ? AND status = 0`;

  connection.query(query, [party_id, article_id], (error, results) => {
    if (error) {
      console.log("Error Executing Query:", error);
      res
        .status(500)
        .json({ error: "Failed to get data from database table " });
    } else {
      if (results.length == 0) {
        res.status(200).json({ id: -1 });
      }
      else {
        res.status(200).json(results);
      }
    }
  });
};


//Update cart...
exports.updateCartArticale = (req, res) => {
  const id = req.body.id;
  const Quantity = req.body.Quantity;
  const rate = req.body.rate;
  const serailqty = JSON.stringify(Quantity);
  console.log(serailqty, rate, id);
  const query = `UPDATE cart SET Quantity = ?, rate = ? WHERE id = ?;`;

  connection.query(query, [serailqty, rate, id], (error, results) => {
    if (error) {
      console.log("Error Executing Query:", error);
      res
        .status(500)
        .json({ error: "Failed to get data from database table " });
    } else {
      res.status(200).json(results);
    }
  });
};

//getcartdetails api
exports.cartdetails = (req, res) => {
  const party_id = 197;
  const query = `SELECT ArticleNumber,ArticleColor,ArticleOpenFlag, StyleDescription, article_id, ar.articleRate, rate, (SELECT ap.Name FROM articlephotos ap WHERE ap.ArticlesId = a.Id LIMIT 1) as Photos , Quantity FROM cart INNER JOIN article a ON cart.article_id = a.Id INNER JOIN articlerate ar ON cart.article_id = ar.ArticleId WHERE party_id = ${party_id} AND status = 0`;
  connection.query(query, (error, results) => {
    if (error) {
      console.log("Error Executing Query:", error);
      res
        .status(500)
        .json({ error: "Failed to get data from database table " });
    } else {
      res.status(200).json(results);
    }
  });
};

//delete cart item api
exports.deletecartitem = (req, res) => {
  const article_id = req.body.article_id;
  const party_id = req.body.party_id;
  const query = `DELETE FROM cart Where article_id = ${article_id} and party_id = ${party_id}`;
  connection.query(query, (error, results) => {
    if (error) {
      console.log("Error Executing Query:", error);
      res.status(500).json({ error: "Failed To delete data from database" });
    } else {
      res.status(200).json(results);
      console.log("Deleted");
    }
  });
};

//edit page api
exports.getCartArticleDetails = async (req, res) => {
  try {
    const { ArticleId, PartyId } = req.query;

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
          const articleDataQuery = `SELECT Quantity, art.ArticleNumber, art.ArticleRate, art.ArticleRatio, art.ArticleSize, art.ArticleColor, (CASE WHEN c.Title is NULL THEN cc.Title ELSE c.Title END) AS Category, i.SalesNoPacks FROM cart LEFT JOIN article art ON cart.article_id LEFT JOIN po p ON p.ArticleId = cart.article_id LEFT JOIN category c ON c.Id = p.CategoryId LEFT JOIN category cc ON cc.Id = art.CategoryId LEFT JOIN articlerate ar ON ar.ArticleID = art.Id INNER JOIN inward i ON i.ArticleId = art.Id WHERE art.Id = ${ArticleId} ORDER BY i.Id DESC LIMIT 0, 1  `;

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

//category with photos 
exports.getcategorywithphotos = (req, res) => {
  const query = "SELECT Title as Category, Image as Photos from category";
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

//transportation dropdown
exports.transportationdropdowns = (req, res) => {
  const query = `SELECT Name, Id from transportation`

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query", error)
      res.status(500).json({ error: "Failed to retrive data from database" })
    } else {
      res.status(200).json(results)
      console.log(results);
    }
  })
}

//Add SO...
exports.addso = (req, res) => {
  const data = req.body;
  let ArticleRate;
  let SoNumberId;
  // console.log(data);


  generateSoNumber(data.UserId, (generateSONumber) => {
    const SO_Number = generateSONumber.SO_Number;
    const SO_Number_Financial_Id = generateSONumber.SO_Number_Financial_Id;
    const SO_Number_Financial = generateSONumber.SO_Number_Financial;

    const insertQuery = `
        INSERT INTO sonumber (SoNumber, FinancialYearId, UserId, PartyId, SoDate, Destination, Transporter, Remarks, GSTAmount, GSTPercentage, GSTType, CreatedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    connection.query(
      insertQuery,
      [
        SO_Number,
        SO_Number_Financial_Id,
        data.UserId,
        data.PartyId,
        data.Date,
        data.Destination,
        data.Transporter,
        data.Remarks,
        data.GST,
        data.GST_Percentage,
        data.GSTType,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
      ],
      (error, result) => {
        if (error) {
          console.error('Error inserting data:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          SoNumberId = result.insertId;
          console.log(SoNumberId, "///////////");
          const userNameQuery = 'SELECT Name FROM Users WHERE Id = ?';
          connection.query(userNameQuery, [data.UserId], (err, userNameResult) => {
            if (err) {
              console.error('Error retrieving user name:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              const sodRecQuery = `
                  SELECT CONCAT(?, '/', fn.StartYear, '-', fn.EndYear) AS SONumber
                  FROM sonumber sn
                  INNER JOIN financialyear fn ON fn.Id = sn.FinancialYearId
                  WHERE sn.Id = ?
                `;

              connection.query(sodRecQuery, [SO_Number, result.insertId], (err, sodRecResult) => {
                if (err) {
                  console.error('Error retrieving SO data:', err);
                  res.status(500).json({ error: 'Internal Server Error' });
                } else {
                  const userName = userNameResult[0].Name;
                  const SONumber = sodRecResult[0].SONumber;

                  const logQuery = `
                      INSERT INTO UserLogs (Module, ModuleNumberId, LogType, LogDescription, UserId)
                      VALUES (?, ?, ?, ?, ?)
                    `;

                  connection.query(
                    logQuery,
                    ['SO', result.insertId, 'Created', `${userName} created SO with SO Number ${SONumber}`, data.UserId],
                    (err) => {
                      if (err) {
                        console.error('Error creating UserLog:', err);
                        res.status(500).json({ error: 'Internal Server Error' });
                      } else {
                        console.log({ message: 'SO created successfully' });
                        data.DataArticle.map(async (item) => {


                          try {


                            if (data.DataArticle) {
                              // If 'DataArticle' is provided in the request data, use its values
                              ArticleRate = item.articleRate;
                            } else {
                              // Otherwise, fetch ArticleRate from the database based on 'ArticleId'
                              const [artratedata] = connection.query('SELECT * FROM articlerate WHERE ArticleId = ?', [item.ArticleId]);

                              if (artratedata.length > 0) {
                                const partyrec = connection.query('SELECT * FROM party WHERE Id = ?', [item.PartyId]);
                                const partyuser = connection.query('SELECT * FROM Users WHERE Id = ?', [partyrec[0][0].UserId]);

                                if (partyuser.length > 0) {
                                  if (partyuser[0][0].PartyId !== 0) {
                                    const outpartyrec = connection.query('SELECT * FROM party WHERE Id = ?', [partyuser[0][0].PartyId]);
                                    ArticleRate = artratedata[0].ArticleRate + outpartyrec[0][0].OutletArticleRate;
                                  } else {
                                    ArticleRate = artratedata[0].ArticleRate;
                                  }
                                } else {
                                  ArticleRate = artratedata[0].ArticleRate;
                                }
                              } else {
                                // Handle the case when 'artratedata' is empty
                                ArticleRate = 0; // You can set a default value here
                              }
                            }
                            console.log({ ArticleRate });

                            if (item.ArticleOpenFlag === 1) {
                              // ... (previous code, as shown before)
                              let mixnopacks;
                              let NoPacks = '';
                              let SalesNoPacks = '';
                              connection.query('SELECT * FROM mixnopacks WHERE ArticleId = ?', [item.article_id], (err, result) => {
                                if (err) { console.log(err) }
                                else {
                                  console.log(result, "mixnopacks");
                                  mixnopacks = result[0];
                                  NoPacks = item.Quantity;
                                  SalesNoPacks = mixnopacks.NoPacks - item.Quantity;
                                  let sonumberdata;
                                  connection.query('SELECT COUNT(*) as total, NoPacks FROM so WHERE SoNumberId = ? AND ArticleId = ?', [SoNumberId, item.article_id], (err, rsult) => {
                                    if (err) {
                                      console.log(err);
                                    }
                                    else {
                                      console.log(result, "NoPacks");
                                      sonumberdata = rsult[0]
                                    }
                                  });

                                  const getnppacks = sonumberdata ? sonumberdata.NoPacks : 0;

                                  // Update mixnopacks
                                  connection.query('UPDATE mixnopacks SET NoPacks = ? WHERE ArticleId = ?', [SalesNoPacks, item.article_id], (err, result) => {
                                    if (err) { console.log(err); }
                                    else {
                                      if (sonumberdata && sonumberdata.total > 0) {
                                        const nopacksadded = getnppacks + NoPacks;
                                        // Update SO
                                        connection.query('UPDATE so SET NoPacks = ?, OutwardNoPacks = ?, ArticleRate = ? WHERE SoNumberId = ? AND ArticleId = ?', [nopacksadded, nopacksadded, item.articleRate, SoNumberId, item.article_id]);
                                      } else {
                                        // Insert new SO record
                                        const soadd = {
                                          SoNumberId: SoNumberId,
                                          ArticleId: item.article_id,
                                          NoPacks: NoPacks,
                                          OutwardNoPacks: NoPacks,
                                          ArticleRate: item.articleRate,
                                          created_at: data.Date,
                                          updated_at: data.Date
                                        };
                                        connection.query('INSERT INTO so SET ?', [soadd]);
                                      }
                                    }
                                  });
                                }
                              });
                            } else {

                              let sonumberdata;
                              let getnppacks;
                              let NoPacks = '';
                              let SalesNoPacks = '';
                              connection.query('SELECT SalesNoPacks FROM inward WHERE ArticleId = ? ', [item.article_id], (err, result) => {
                                if (err) {
                                  console.log(err);
                                }
                                else {
                                  console.log(result[0].SalesNoPacks, "pppppppp");
                                  const search = result[0].SalesNoPacks;
                                  console.log(search, "0000000");
                                  const searchString = ',';
                                  let stringcomma = 0;

                                  if (search.includes(searchString)) {
                                    const string = search.split(',')
                                    const nopk = item.Quantity.split(',')
                                    let arr1 = [];
                                    string.forEach((item, index) => {
                                      const result = parseInt(item) - parseInt(nopk[index]);
                                      arr1.push(result);
                                      console.log(result, "//////////////////////", index);
                                    });
                                    NoPacks += item.Quantity;
                                    SalesNoPacks = arr1.join(',');
                                    console.log(SalesNoPacks, "&&&&&&&&&&&&&&");
                                    stringcomma = 1;
                                  }
                                  else {
                                    NoPacks += item.Quantity;
                                    SalesNoPacks += (search - item.Quantity);
                                  }



                                  NoPacks = NoPacks.replace(/,\s*$/, ''); // Remove trailing comma
                                  SalesNoPacks = SalesNoPacks.replace(/,\s*$/, ''); // Remove trailing comma

                                  const CheckSalesNoPacks = NoPacks.split(',');
                                  const tmp = CheckSalesNoPacks.filter((x) => x.trim() !== '');


                                  connection.query('SELECT COUNT(*) as total, NoPacks FROM so WHERE SoNumberId = ? AND ArticleId = ?', [SoNumberId, item.article_id], (err, result) => {
                                    if (err) { console.log(err); }
                                    else {
                                      sonumberdata = result[0];
                                    }
                                  });

                                  getnppacks = sonumberdata ? sonumberdata.NoPacks : 0;
                                  connection.query('UPDATE inward SET SalesNoPacks = ? WHERE ArticleId = ?', [SalesNoPacks, item.article_id], (err, result) => {
                                    if (err) { console.log(err); }
                                    else {
                                      console.log("updated inward");
                                    }
                                  });

                                  if (sonumberdata && sonumberdata.total > 0) {
                                    console.log("{}{}{}_+_+_+");
                                    let nopacksadded = '';
                                    if (SalesNoPacks.includes(',')) {
                                      const NoPacks1 = NoPacks.split(',');
                                      const getnppacksArr = getnppacks.split(',');
                                      getnppacksArr.forEach((vl, key) => {
                                        nopacksadded += (parseInt(NoPacks1[key]) + parseInt(vl)) + ',';
                                      });
                                    } else {
                                      nopacksadded += parseInt(getnppacks) + parseInt(NoPacks) + ',';
                                    }
                                    nopacksadded = nopacksadded.replace(/,\s*$/, ''); // Remove trailing comma

                                    connection.query('UPDATE so SET NoPacks = ?, OutwardNoPacks = ?, ArticleRate = ? WHERE SoNumberId = ? AND ArticleId = ?', [nopacksadded, nopacksadded, item.articleRate, SoNumberId, item.article_id]);
                                  } else {
                                    const soadd = {
                                      SoNumberId: SoNumberId,
                                      ArticleId: item.article_id,
                                      NoPacks: NoPacks,
                                      OutwardNoPacks: NoPacks,
                                      ArticleRate: item.articleRate,
                                      created_at: data.Date,
                                      updated_at: data.Date
                                    };
                                    connection.query('INSERT INTO so SET ?', [soadd], (err, result) => {
                                      if (err) { console.log(err); }
                                      else {
                                        connection.query('UPDATE cart SET status = 1 WHERE article_id = ?', [item.article_id], (err, result) => {
                                          if (err) {
                                            console.log(err);
                                          }

                                        });

                                      }
                                    });
                                  }
                                }


                              });
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            res.status(500).json({ error: 'Internal Server Error' });
                          }
                        })

                        res.status(200).json({ status: true })

                      }
                    }
                  );
                }
              });
            }
          });
        }
      }
    );
  });




}
function generateSoNumber(UserId, callback) {
  const array = {};
  const finYearQuery = 'SELECT Id, CONCAT(StartYear, "-", EndYear) AS CurrentFinancialYear FROM financialyear ORDER BY Id DESC';
  const soNumberQuery = 'SELECT Id, FinancialYearId, SoNumber FROM sonumber WHERE UserId = ? ORDER BY Id DESC LIMIT 1';

  connection.query(finYearQuery, (err, finYearResult) => {
    if (err) {
      console.error('Error retrieving financial year data:', err);
      callback({});
    } else {
      connection.query(soNumberQuery, [UserId], (err, soNumberResult) => {
        if (err) {
          console.error('Error retrieving SO number data:', err);
          callback({});
        } else {
          if (soNumberResult.length > 0) {
            if (finYearResult[0].Id > soNumberResult[0].FinancialYearId) {
              array.SO_Number = 1;
              array.SO_Number_Financial_Id = finYearResult[0].Id;
              array.SO_Number_Financial = `1/${finYearResult[0].CurrentFinancialYear}`;
              callback(array);
            } else {
              const soNumberString = soNumberResult[0].SoNumber;
              const soNumber = parseInt(soNumberString);
              array.SO_Number = soNumber + 1;
              array.SO_Number_Financial_Id = finYearResult[0].Id;
              array.SO_Number_Financial = `${soNumber + 1}/${finYearResult[0].CurrentFinancialYear}`;
              callback(array);
            }
          } else {
            array.SO_Number = 1;
            array.SO_Number_Financial_Id = finYearResult[0].Id;
            array.SO_Number_Financial = `1/${finYearResult[0].CurrentFinancialYear}`;
            callback(array);
          }
        }
      });
    }
  });
}

exports.SendMail = async (req, res) => {
  const { username, email, subject, message } = req.body;

  try {
    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'developersweb001@gmail.com',
        pass: 'jbibkrpdwsfmpwkw'
      }
    });

    // Define email content
    const mailOptions = {
      from: email,
      to: 'nitinrathod.syndell@gmail.com',
      subject: subject,
      text: `Name: ${username}\nEmail: ${email}\nSubject:${subject}\nMessage: ${message}`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info);

    res.status(200).json('sent');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}

exports.phoneNumberValidation = (req, res) => {
  const { number } = req.body;
  console.log(number);
  const query = `SELECT  Id , Name, UserId ,PhoneNumber,Additional_phone_numbers,Address,City,State,PinCode,Country from party WHERE PhoneNumber = ? OR Additional_phone_numbers LIKE ?`;
  const numberPattern = `%${number}%`;
  connection.query(query, [number, numberPattern], (error, results) => {
    if (error) {
      console.error("Error executing query", error);
      res.status(500).json({ error: "Failed to retrive data from database" });
    } else {
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(201).json();
      }
    }
  });
};

exports.UserData = (req, res) => {
  const {
    name,
    address,
    phoneNumber,
    state,
    city,
    country,
    pinCode,
    contactPerson,
  } = req.body;

  const insertQuery = `
    INSERT INTO party
    (Name, Address, PhoneNumber, State, City, Country, PinCode, ContactPerson, Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `;

  connection.query(
    insertQuery,
    [name, address, phoneNumber, state, city, country, pinCode, contactPerson],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        console.log("Data inserted successfully");
        res.status(201).json({ message: "Data inserted successfully" });
      }
    }
  );
};

exports.CollectInwardForCartArticals = async (req, res) => {
  try {
    const { arr1 } = req.body;
    console.log(arr1);
    let arr2 = [];
    const q1 = 'SELECT SalesNoPacks , ArticleId FROM inward WHERE ArticleId = ?';

    // Assuming cartDataIdArray contains the item IDs you want to query

    // Use Promise.all to execute all queries in parallel
    await Promise.all(arr1.map(async (item) => {
      const result = await new Promise((resolve, reject) => {
        connection.query(q1, [item], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      arr2.push(result[0]);
    }));

    // Send arr2 as a response or perform other actions as needed
    res.status(200).json({ data: arr2 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

exports.getNotification = async (req, res) => {
  const { registrationToken, title, body } = req.body;
  console.log(registrationToken, title, body);
  console.log(registrationToken);
  if (!Expo.isExpoPushToken(registrationToken)) {
    return res.status(400).json({ error: 'Invalid Expo Push Token' });
  }

  const message = {
    to: registrationToken,
    sound: 'default',
    title: title || 'Notification Title',
    body: body || 'Notification Body',
    priority: 'high', // Set notification priority to high
    data: { additionalData: 'optional data' }, // Add any additional data here
  };

  try {
    const response = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent successfully:', response);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getSoNumber = async (req, res) => {
  console.log("So Number");
  try {
    const { PartyId } = req.body;
    console.log(PartyId);
    const q1 = 'SELECT sn.UserId,sn.SoNumber,sn.SoDate,sn.PartyId,sn.Id,sn.CreatedDate, so.OutwardNoPacks, so.ArticleRate FROM sonumber sn LEFT JOIN so so ON sn.id = so.SoNumberId WHERE sn.PartyId = ?';
    connection.query(q1, [PartyId], (err, resulte) => {
      if (err) {
        res.status(500).json(err);
      } else {
        const transformedResults = resulte.reduce((acc, row) => {
          const existingEntry = acc.find(entry => entry.Id === row.Id);
    
          if (existingEntry) {
            // Add to existing entry's arrays
            existingEntry.OutwardNoPacks.push(row.OutwardNoPacks);
            existingEntry.ArticleRate.push(row.ArticleRate);
          } else {
            // Create a new entry with arrays
            acc.push({
              ...row,
              OutwardNoPacks: [row.OutwardNoPacks],
              ArticleRate: [row.ArticleRate],
            });
          }
    
          return acc;
        }, []);
        // console.log(transformedResults);
        const q2 = `
        SELECT so.SoNumberId , onum.OutwardNumber
        FROM outward AS o
        INNER JOIN outwardnumber AS onum ON o.OutwardNumberId = onum.id
        INNER JOIN so AS so ON onum.SoId = so.id
        WHERE o.PartyId = ?
      `;
        connection.query(q2, [PartyId], (err, response) => {
          if (err) {
            res.status(500).json(err);
          } else {
            
            // Use a Set to remove duplicates from the response array
            const uniqueSoNumberIds = new Set();
            // Use filter to keep only the first occurrence of each SoNumberId
            const uniqueArray = response.filter(item => {
              if (!uniqueSoNumberIds.has(item.SoNumberId)) {
                uniqueSoNumberIds.add(item.SoNumberId);
                return true;
              }
              return false;
            });
            // console.log(uniqueArray);
            const combinedData = transformedResults.map(item => {
              // Find the corresponding unique item in uniqueArray based on SoNumberId
              const matchingItem = uniqueArray.find(obj => obj.SoNumberId === item.Id);
            
              // Check if a matching item was found
              if (matchingItem) {
                return {
                  ...item,
                  status: 1,
                  OutwardNumber: matchingItem.OutwardNumber,
                };
              } else {
                return {
                  ...item,
                  status: 0,
                  OutwardNumber: '', // Set an empty string if no matching item is found
                };
              }
            });
            
            // const filteredData = combinedData.filter(item => item.status === 1);
            // console.log(combinedData);
            res.status(200).json(combinedData);
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


