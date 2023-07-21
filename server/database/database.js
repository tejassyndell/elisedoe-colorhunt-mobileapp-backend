/* eslint-disable */
const mysql = require("mysql");

//for local connections

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "colorvm3_stagingwebservice",
  password: "",
});

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'sincpr5_sincpr5',
//   database: 'sincpr5_webfleet',
//   password: 'wr5Xb9857wgq44SdLnkR!'
// })

connection.connect((err) => {
  if (err) {
    console.error("error connecting to MySQL:", err.stack);
    return;
  }
  console.log("connected to MySQL database");
});

module.exports = connection;
