// Quick script to run the migration
import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cinepass',
  multipleStatements: true,
});

try {
  const sql = fs.readFileSync('database/cinepass_migration.sql', 'utf8');
  const conn = await pool.getConnection();
  console.log('✅ Connected to MySQL');
  
  await conn.query(sql);
  console.log('✅ Migration executed successfully');
  
  const [rows] = await conn.query('SELECT movie_id, title, director, votes, is_trending FROM Movies');
  console.table(rows);
  
  conn.release();
  await pool.end();
  console.log('✅ Done!');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
