const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// === Configuración de Multer para iconos ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/icons/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|svg|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes (jpg, png, svg, webp)'));
    }
  }
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// === ADMIN ===
router.get("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();
  const links = db.prepare(`
    SELECT l.*, c.name as category_name 
    FROM links l LEFT JOIN categories c ON l.category_id = c.id 
    ORDER BY l.title
  `).all();

  res.render("admin/index", {
    user: req.session.user,
    categories,
    links,
    success: req.query.success,
    error: req.query.error
  });
});

// === AÑADIR ENLACE CON ICONO ===
router.post("/add-link", requireAuth, upload.single('icon'), (req, res) => {
  const { title, url, category_id } = req.body;
  const db = req.app.locals.db;

  let iconPath = null;
  if (req.file) {
    iconPath = '/uploads/icons/' + req.file.filename;
  }

  try {
    db.prepare(`INSERT INTO links (title, url, icon, category_id) VALUES (?, ?, ?, ?)`)
      .run(title, url, iconPath, category_id || null);

    res.redirect("/admin?success=Enlace añadido correctamente");
  } catch (err) {
    res.redirect("/admin?error=Error al añadir el enlace");
  }
});

// === ELIMINAR ENLACE ===
router.post("/delete-link", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  db.prepare("DELETE FROM links WHERE id = ?").run(req.body.id);
  res.redirect("/admin?success=Enlace eliminado");
});

// === TOGGLE FAVORITO ===
router.post("/toggle-favorite", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const link = db.prepare("SELECT is_favorite FROM links WHERE id = ?").get(req.body.id);
  const newFav = link.is_favorite === 1 ? 0 : 1;
  db.prepare("UPDATE links SET is_favorite = ? WHERE id = ?").run(newFav, req.body.id);
  res.redirect("/admin?success=Favorito actualizado");
});

// === AÑADIR CATEGORÍA ===
router.post("/add-category", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  try {
    db.prepare("INSERT INTO categories (name) VALUES (?)").run(req.body.name);
    res.redirect("/admin?success=Categoría añadida");
  } catch (e) {
    res.redirect("/admin?error=Error al añadir categoría");
  }
});

module.exports = router;
