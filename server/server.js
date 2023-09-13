/* eslint-disable */
const Express = require("express");
const bodyParser = require;
("body-parser");
const app = Express();
const mysql = require("mysql");
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "colorhunt",
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
app.post("/createAccount", (req, res) => {
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
});

// ... Other routes and configurations

app.listen(4000, () => {
  console.log("Server is listening on Port : 4000");
});

//Full Article data
app.get("/articles", (req, res) => {
  const query =
    "SELECT a.ArticleNumber , a.StyleDescription , a.ArticleRate , ap.Name AS Photos , c.Title as Category , sc.Name AS Subcategory FROM article as a INNER JOIN articlerate AS ar ON a.Id = ar.ArticleId INNER JOIN articlephotos AS ap ON a.Id = ap.ArticlesId INNER JOIN category AS c ON a.CategoryId = c.Id INNER JOIN subcategory AS sc ON a.SubCategoryId = sc.Id";
  connection.query(query, (err, results) => {
    if (err) {
      console.log("Error Executing query :", err);
      res
        .status(500)
        .json({ error: "Failed to retrive data from the database" });
      return;
    }
    res.json(results);
  });
});
//Category Api
app.get("/getcategory", (req, res) => {
  const query = "SELECT Title as Category from category";
  connection.query(query, (err, results) => {
    if (err) {
      console.log("Error Executing query :", err);
      res
        .status(500)
        .json({ error: "Failed to retrive data from the database" });
      return;
    }
    res.json(results);
  });
});
