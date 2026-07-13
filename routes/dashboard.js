const express = require("express");
const router = express.Router();

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

router.get("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;

  // Get all categories
  const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();

  // Get all links with category name
  const links = db.prepare(`
    SELECT l.*, c.name as category_name 
    FROM links l 
    LEFT JOIN categories c ON l.category_id = c.id 
    ORDER BY l.is_favorite DESC, l.title
  `).all();

  // Group links by category
  const linksByCategory = {};
  categories.forEach(cat => {
    linksByCategory[cat.id] = links.filter(link => link.category_id === cat.id);
  });

  // Get favorites
  const favorites = links.filter(link => link.is_favorite === 1);

  res.render("dashboard", {
    user: req.session.user,
    categories,
    links,
    linksByCategory,
    favorites
  });
});

module.exports = router;