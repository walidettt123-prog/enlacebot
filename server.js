const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const Database = require("better-sqlite3");

const app = express();

// === Crear la carpeta 'data' automáticamente si no existe ===
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("✅ Carpeta 'data/' creada automáticamente");
}

// Inicializar base de datos
const dbPath = path.join(dataDir, "database.db");
const db = new Database(dbPath);

// Crear tablas si no existen
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

// Crear usuario admin por defecto
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const bcrypt = require("bcrypt");
  const hashed = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashed);
  console.log("✅ Usuario admin creado → admin / admin123");
}

// Crear categorías por defecto
const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get().count;
if (catCount === 0) {
  const stmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
  ["Comunicación", "Energía", "Documentación", "General"].forEach(name => stmt.run(name));
  console.log("✅ Categorías creadas");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "workhub-secret-2026",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));

app.locals.db = db;

// Rutas
app.use("/", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/admin", require("./routes/admin"));

app.get("/", (req, res) => {
  res.redirect(req.session.user ? "/dashboard" : "/login");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 WorkHub v2.0 corriendo en puerto ${PORT}`);
});
