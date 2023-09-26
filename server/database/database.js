/* eslint-disable */
const mysql = require("mysql2");
const express = require('express')



//for local connections

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "colorhunt",
  password: ""
});

// host: "127.0.0.1",
// port:3306,
// user: "colorvm3_stagingwebservice",
// database: "colorvm3_webservice",
// password: "*94g5}L)51kJ_(CpCMv3Fv6Y"
connection.connect((err) => {
  if (err) {
    console.error("error connecting to MySQL:", err.stack);
    return;
  }
  console.log("connected to MySQL database");
});

module.exports = connection;
