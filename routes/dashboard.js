const express = require("express");
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

router.get("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;

  try {
    const categories = db.prepare("SELECT * FROM categories ORDER BY name").all() || [];
    const links = db.prepare(`
      SELECT l.*, c.name as category_name 
      FROM links l 
      LEFT JOIN categories c ON l.category_id = c.id 
      ORDER BY l.is_favorite DESC, l.title
    `).all() || [];

    const linksByCategory = {};
    categories.forEach(cat => {
      linksByCategory[cat.id] = links.filter(link => link.category_id === cat.id);
    });

    const favorites = links.filter(link => link.is_favorite === 1);

    res.render("dashboard", {
      user: req.session.user,
      categories,
      links,
      linksByCategory,
      favorites
    });
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).send("Error cargando el dashboard");
  }
});

module.exports = router;
