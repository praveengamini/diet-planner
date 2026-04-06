// routes/diet-routes.js
const express = require("express");
const {
  generateDietPlan, getUserDietPlans,
  updateMeal, replaceFoodItem, removeFoodItem, addSnack, deleteDietPlan,
  toggleMealCompletion, updateMealProgress, updateDayProgress, getProgressStats,
} = require("../controllers/diet-controller");
const { authMiddleware } = require("../controllers/auth-controller");
 
const router = express.Router();
 
router.post("/generate", authMiddleware, generateDietPlan);
router.get("/history", authMiddleware, getUserDietPlans);
router.put("/:planId/update-meal", authMiddleware, updateMeal);
router.put("/:planId/replace-item", authMiddleware, replaceFoodItem);
router.put("/:planId/remove-item", authMiddleware, removeFoodItem);
router.put("/:planId/add-snack", authMiddleware, addSnack);
router.delete("/:planId", authMiddleware, deleteDietPlan);

// Progress tracking routes
router.put("/:planId/progress/toggle-meal", authMiddleware, toggleMealCompletion);
router.put("/:planId/progress/update-meal", authMiddleware, updateMealProgress);
router.put("/:planId/progress/update-day", authMiddleware, updateDayProgress);
router.get("/:planId/progress/stats", authMiddleware, getProgressStats);
 
module.exports = router;