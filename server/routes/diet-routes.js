// routes/diet-routes.js
const express = require("express");
const {
  generateDietPlan,
  getUserDietPlans,
  updateMeal,replaceFoodItem,removeFoodItem,addSnack
} = require("../controllers/diet-controller");

const { authMiddleware } = require("../controllers/auth-controller");

const router = express.Router();

// 🔥 Generate diet plan
router.post("/generate", authMiddleware, generateDietPlan);
// 🔥 Get history
router.get("/history", authMiddleware, getUserDietPlans);
router.put("/:planId/update-meal", authMiddleware, updateMeal);
router.put("/:planId/replace-item", authMiddleware, replaceFoodItem);
router.put("/:planId/remove-item", authMiddleware, removeFoodItem);
router.put("/:planId/add-snack", authMiddleware, addSnack);

module.exports = router;