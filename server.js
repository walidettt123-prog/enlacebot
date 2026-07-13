const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const Database = require("better-sqlite3");

const app = express();

// Crear carpeta data si no existe
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "database.db"));

// Crear tablas
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
    type TEXT DEFAULT 'enlace',
    clicks INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Añadir columna 'type' si no existe (para proyectos antiguos)
try {
  db.exec("ALTER TABLE links ADD COLUMN type TEXT DEFAULT 'enlace'");
} catch (e) {
  // La columna ya existe, no hacer nada
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "workhub-secret-key-2026",
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
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 WorkHub v2.0 corriendo en puerto ${PORT}`);
});
