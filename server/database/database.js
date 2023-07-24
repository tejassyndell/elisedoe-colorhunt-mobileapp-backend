/* eslint-disable */
const mysql = require("mysql");
const express = require('express')
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors')
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
//for local connections

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "colorvm3_stagingwebservice",
  password: ""
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting to MySQL:", err.stack);
    return;
  }
  console.log("connected to MySQL database");
});

module.exports = connection;
