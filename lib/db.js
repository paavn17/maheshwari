// lib/db.js
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  dateStrings: true, // ✅ Ensures DATE/TIME are returned as strings, not JS Date objects
});

// export const db = mysql.createPool({
//   host: "sql12.freesqldatabase.com",
//   user: "sql12797130",
//   password: "xtN4zZGPS8",
//   database: "sql12797130",
//   dateStrings: true, // ✅ Ensures DATE/TIME are returned as strings, not JS Date objects
// });
