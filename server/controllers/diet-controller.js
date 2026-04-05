// controllers/diet-controller.js
const axios = require("axios");
const DietPlan = require("../models/DietPlan");

const AI_SERVICE_URL = "http://127.0.0.1:8000/api/v1/planner/generate";

const generateDietPlan = async (req, res) => {
  try {
    const userId = req.user.id; 
    const requestData = req.body;

    const response = await axios.post(AI_SERVICE_URL, requestData);

    const plan = response.data;

    const savedPlan = await DietPlan.create({
      userId,
      profile: requestData.profile,
      dietType: requestData.diet_type,
      allergies: requestData.allergies,
      medicalConditions: requestData.medical_conditions,
      mealsPerDay: requestData.meals_per_day,
      plan,
    });

    res.status(200).json({
      success: true,
      message: "Diet plan generated successfully",
      data: savedPlan,
    });
  } catch (error) {
    console.error("Diet generation error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate diet plan",
      error: error.response?.data || error.message,
    });
  }
};

const getUserDietPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const plans = await DietPlan.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch diet plans",
    });
  }
};
// controllers/diet-controller.js

const updateMeal = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, newMeal } = req.body;

    const plan = await DietPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // 🔥 Update specific meal
    plan.plan.weekly_plan[day][mealType] = newMeal;

    await plan.save();

    res.json({
      success: true,
      message: "Meal updated successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
const replaceFoodItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, oldItem, newItem } = req.body;

    const plan = await DietPlan.findById(planId);

    let meal = plan.plan.weekly_plan[day][mealType];

    meal.ingredients = meal.ingredients.map(item =>
      item === oldItem ? newItem : item
    );

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
const removeFoodItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, item } = req.body;

    const plan = await DietPlan.findById(planId);

    let meal = plan.plan.weekly_plan[day][mealType];

    meal.ingredients = meal.ingredients.filter(i => i !== item);

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
const addSnack = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, snack } = req.body;

    const plan = await DietPlan.findById(planId);

    plan.plan.weekly_plan[day].snacks.push(snack);

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
module.exports = {
  generateDietPlan,
  getUserDietPlans,
  updateMeal,
  addSnack,
  removeFoodItem,
  replaceFoodItem
};