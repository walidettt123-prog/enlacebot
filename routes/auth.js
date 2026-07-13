const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// Login page
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("login", { error: null });
});

// Process login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = req.app.locals.db;

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user) {
    return res.render("login", { error: "Usuario o contraseña incorrectos" });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.render("login", { error: "Usuario o contraseña incorrectos" });
  }

  // Login successful
  req.session.user = {
    id: user.id,
    username: user.username
  };

  res.redirect("/dashboard");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;