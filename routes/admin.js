const express = require("express");
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Panel Admin
router.get("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();
  const links = db.prepare(`
    SELECT l.*, c.name as category_name 
    FROM links l 
    LEFT JOIN categories c ON l.category_id = c.id 
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

// Añadir enlace (versión simple)
router.post("/add-link", requireAuth, (req, res) => {
  const { title, url, category_id } = req.body;
  const db = req.app.locals.db;

  try {
    db.prepare(`
      INSERT INTO links (title, url, category_id) 
      VALUES (?, ?, ?)
    `).run(title, url, category_id || null);

    res.redirect("/admin?success=Enlace añadido correctamente");
  } catch (err) {
    res.redirect("/admin?error=Error al añadir el enlace");
  }
});

// Eliminar enlace
router.post("/delete-link", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  db.prepare("DELETE FROM links WHERE id = ?").run(req.body.id);
  res.redirect("/admin?success=Enlace eliminado");
});

// Toggle favorito
router.post("/toggle-favorite", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const link = db.prepare("SELECT is_favorite FROM links WHERE id = ?").get(req.body.id);
  const newFav = link.is_favorite === 1 ? 0 : 1;
  db.prepare("UPDATE links SET is_favorite = ? WHERE id = ?").run(newFav, req.body.id);
  res.redirect("/admin?success=Favorito actualizado");
});

// Añadir categoría
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
