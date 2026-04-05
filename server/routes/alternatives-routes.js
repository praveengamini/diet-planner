// routes/alternatives-routes.js
const express = require("express");
const { suggestAlternatives } = require("../controllers/alternatives-controller");
const { authMiddleware } = require("../controllers/auth-controller");

const router = express.Router();

router.post("/suggest", authMiddleware, suggestAlternatives);

module.exports = router;