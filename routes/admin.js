const express = require("express");
const router = express.Router();

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Admin dashboard
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
    links
  });
});

// Add new link
router.post("/add-link", requireAuth, (req, res) => {
  const { title, url, category_id, icon } = req.body;
  const db = req.app.locals.db;

  try {
    db.prepare(`
      INSERT INTO links (title, url, icon, category_id) 
      VALUES (?, ?, ?, ?)
    `).run(title, url, icon || null, category_id || null);

    res.redirect("/admin?success=Enlace añadido correctamente");
  } catch (error) {
    res.redirect("/admin?error=Error al añadir el enlace");
  }
});

// Edit link
router.post("/edit-link", requireAuth, (req, res) => {
  const { id, title, url, category_id, icon } = req.body;
  const db = req.app.locals.db;

  try {
    db.prepare(`
      UPDATE links 
      SET title = ?, url = ?, icon = ?, category_id = ?
      WHERE id = ?
    `).run(title, url, icon || null, category_id || null, id);

    res.redirect("/admin?success=Enlace actualizado");
  } catch (error) {
    res.redirect("/admin?error=Error al actualizar");
  }
});

// Delete link
router.post("/delete-link", requireAuth, (req, res) => {
  const { id } = req.body;
  const db = req.app.locals.db;

  try {
    db.prepare("DELETE FROM links WHERE id = ?").run(id);
    res.redirect("/admin?success=Enlace eliminado");
  } catch (error) {
    res.redirect("/admin?error=Error al eliminar");
  }
});

// Toggle favorite
router.post("/toggle-favorite", requireAuth, (req, res) => {
  const { id } = req.body;
  const db = req.app.locals.db;

  try {
    const link = db.prepare("SELECT is_favorite FROM links WHERE id = ?").get(id);
    const newFavorite = link.is_favorite === 1 ? 0 : 1;

    db.prepare("UPDATE links SET is_favorite = ? WHERE id = ?").run(newFavorite, id);
    res.redirect("/admin?success=Favorito actualizado");
  } catch (error) {
    res.redirect("/admin?error=Error al actualizar favorito");
  }
});

// Add new category
router.post("/add-category", requireAuth, (req, res) => {
  const { name } = req.body;
  const db = req.app.locals.db;

  try {
    db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    res.redirect("/admin?success=Categoría añadida");
  } catch (error) {
    res.redirect("/admin?error=La categoría ya existe o hubo un error");
  }
});

module.exports = router;