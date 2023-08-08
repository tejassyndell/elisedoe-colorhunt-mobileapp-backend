/* eslint-disable */

const { json } = require("body-parser");
const connection = require("../database/database.js");
const multer = require("multer");

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
    "SELECT a.Id, a.ArticleNumber, a.StyleDescription, ar.ArticleRate, ap.Name AS Photos, c.Title AS Category, sc.Name AS Subcategory FROM article AS a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id GROUP BY a.ArticleNumber ";

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
                SalesNoPacks += `${
                  string[key] - data[`NoPacksNew_${numberofpacks}`]
                },`;
              } else {
                if (search < data[`NoPacksNew_${numberofpacks}`]) {
                  return { id: "", NoOfSetNotMatch: "true" };
                }
                SalesNoPacks += `${
                  search - data[`NoPacksNew_${numberofpacks}`]
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

//getcartdetails api
exports.cartdetails = (req, res) => {
  const party_id = 197;
  const query = `SELECT ArticleNumber, StyleDescription, article_id, ar.articleRate, rate, (SELECT ap.Name FROM articlephotos ap WHERE ap.ArticlesId = a.Id LIMIT 1) as Photos , Quantity FROM cart INNER JOIN article a ON cart.article_id = a.Id INNER JOIN articlerate ar ON cart.article_id = ar.ArticleId WHERE party_id = ${party_id}`;
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
