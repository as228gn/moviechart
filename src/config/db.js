/**
 * @file This module contains the configuration for the Mysql2 Database.
 * @module Mysql2
 * @author Anna Ståhlberg
 */

// import fs from 'fs'
// import mysql from 'mysql2'

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 3306,
//   ssl: {
//     ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem', 'utf8')
//   }
// })

// export default pool.promise()

import dotenv from 'dotenv'
import mysql from 'mysql2'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

export default pool.promise()
