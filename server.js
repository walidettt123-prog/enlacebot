const express = require("express");
const path = require("path");
const session = require("express-session");
const Database = require("better-sqlite3");

const app = express();

// Database initialization
const db = new Database(path.join(__dirname, "data", "database.db"));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    category_id INTEGER,
    clicks INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Insert default admin user if not exists (password: admin123)
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const bcrypt = require("bcrypt");
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashedPassword);
  console.log("✅ Default admin user created: admin / admin123");
}

// Insert default categories if empty
const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get().count;
if (catCount === 0) {
  const insertCat = db.prepare("INSERT INTO categories (name) VALUES (?)");
  ["Comunicación", "Energía", "Documentación", "General"].forEach(name => insertCat.run(name));
  console.log("✅ Default categories created");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "workhub-super-secret-key-2026",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Make db available to routes
app.locals.db = db;

// Routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);

// Redirect root to dashboard or login
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 WorkHub v2.0 running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});