// Filename: server/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'artemon.db');

const sqlite = sqlite3.verbose();

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.configure('busyTimeout', 10000); 
    db.run('PRAGMA journal_mode = WAL;');

    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        displayName TEXT,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'customer',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        image TEXT,
        rating REAL DEFAULT 0,
        stock INTEGER DEFAULT 10,
        isTrending BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        total REAL,
        status TEXT DEFAULT 'Pending',
        items TEXT, 
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. User Favorites Table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        user_email TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_email, product_id),
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // 5. User Cart Table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_cart_items (
        user_email TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_email, product_id),
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // 6. Search History Table
    db.run(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        query TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      )
    `);

    // 7. UPDATED: Reviews Table with Status Column
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        headline TEXT NOT NULL,
        body TEXT,
        status TEXT DEFAULT 'approved',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (!err) {
        // Migration: Add status column if it doesn't exist in existing DB
        db.run("ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'approved'", (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('Migration Error:', err.message);
          }
        });
      }
    });

    // 8. Metadata & Seeding
    db.run(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `, (err) => {
        if (!err) checkIfSeeded();
    });
  });
}

function checkIfSeeded() {
    db.get("SELECT value FROM app_metadata WHERE key = 'is_seeded'", (err, row) => {
        if (err) return console.error(err.message);
        if (row && row.value === 'true') {
            console.log("⚡ Database ready.");
            return;
        }
        seedProducts();
    });
}

function seedProducts() {
    console.log("🌱 First run detected! Initializing empty database...");
    db.run("INSERT INTO app_metadata (key, value) VALUES ('is_seeded', 'true')");
    console.log("✅ Database initialized.");
}

export default db;