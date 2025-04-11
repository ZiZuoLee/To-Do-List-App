const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function resetDatabase() {
  // Create connection without specifying database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Drop the database if it exists
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log('Database dropped successfully');

    // Create the database
    await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log('Database created successfully');

    // Use the new database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully');

    // Create todos table
    await connection.query(`
      CREATE TABLE todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitles JSON,
        deadline DATETIME,
        location VARCHAR(255),
        notes TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('Todos table created successfully');

    // Create admin user if it doesn't exist
    const adminEmail = 'admin@gmail.com';
    const adminPassword = await bcrypt.hash('admin123', 10); // You should change this password in production
    
    await connection.query(`
      INSERT INTO users (username, email, password)
      SELECT 'admin', ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = ?
      )
    `, [adminEmail, adminPassword, adminEmail]);
    
    console.log('Admin user created or already exists');

    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await connection.end();
  }
}

resetDatabase(); 