// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.hostBlk,
  user: process.env.userBlk,
  password: process.env.passwordBlk,
  database: process.env.databaseBlk,
  port: process.env.portBlk,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;