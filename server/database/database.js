/* eslint-disable */
const mysql = require("mysql");
const express = require('express')



//for local connections

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "colorvm3_webservice",
  password: "",
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting to MySQL:", err.stack);
    return;
  }
  console.log("connected to MySQL database");
});

module.exports = connection;
