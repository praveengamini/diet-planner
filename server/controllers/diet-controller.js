const axios = require("axios");
const DietPlan = require("../models/DietPlan");

const AI_SERVICE_URL = "http://127.0.0.1:10000/api/v1/planner/generate";
const ALT_SERVICE_URL = "http://127.0.0.1:10000/api/v1/alternatives/suggest";

const generateDietPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestData = req.body;
    const response = await axios.post(AI_SERVICE_URL, requestData);
    const plan = response.data;
    
    // Initialize progress map for all days
    const progressMap = new Map();
    if (plan.weekly_plan) {
      Object.keys(plan.weekly_plan).forEach(day => {
        progressMap.set(day, {
          completed: false,
          breakfast: { completed: false, actualCalories: null, notes: "", completedAt: null },
          lunch: { completed: false, actualCalories: null, notes: "", completedAt: null },
          dinner: { completed: false, actualCalories: null, notes: "", completedAt: null },
          actualWaterIntake: null,
          dailyNotes: "",
          completedAt: null,
        });
      });
    }
    
    const savedPlan = await DietPlan.create({
      userId,
      profile: requestData.profile,
      dietType: requestData.diet_type,
      allergies: requestData.allergies,
      medicalConditions: requestData.medical_conditions,
      mealsPerDay: requestData.meals_per_day,
      plan,
      progress: progressMap,
    });
    
    res.status(200).json({ success: true, message: "Diet plan generated", data: savedPlan });
  } catch (error) {
    const errData = error.response?.data;
    res.status(500).json({ success: false, message: "Failed to generate", error: errData || error.message });
  }
};

const getUserDietPlans = async (req, res) => {
  try {
    const plans = await DietPlan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};

const updateMeal = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, newMeal } = req.body;
    const plan = await DietPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    plan.plan.weekly_plan[day][mealType] = newMeal;
    plan.markModified("plan");
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

const replaceFoodItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, oldItem, newItem } = req.body;
    const plan = await DietPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    let meal = plan.plan.weekly_plan[day][mealType];
    meal.ingredients = meal.ingredients.map((item) => (item === oldItem ? newItem : item));
    plan.markModified("plan");
    await plan.save();
    res.json({ success: true, data: plan });
  } catch {
    res.status(500).json({ success: false });
  }
};

const removeFoodItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, item } = req.body;
    const plan = await DietPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    let meal = plan.plan.weekly_plan[day][mealType];
    meal.ingredients = meal.ingredients.filter((i) => i !== item);
    plan.markModified("plan");
    await plan.save();
    res.json({ success: true, data: plan });
  } catch {
    res.status(500).json({ success: false });
  }
};

const addSnack = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, snack } = req.body;
    const plan = await DietPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    if (!plan.plan.weekly_plan[day].snacks) plan.plan.weekly_plan[day].snacks = [];
    plan.plan.weekly_plan[day].snacks.push(snack);
    plan.markModified("plan");
    await plan.save();
    res.json({ success: true, data: plan });
  } catch {
    res.status(500).json({ success: false });
  }
};

const deleteDietPlanCtrl = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await DietPlan.findOneAndDelete({ _id: planId, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// ─── PROGRESS TRACKING CONTROLLERS ───────────────────────────────────────────

const toggleMealCompletion = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, actualCalories, notes } = req.body;
    
    const plan = await DietPlan.findOne({ _id: planId, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    
    // Get or initialize day progress
    let dayProgress = plan.progress.get(day);
    if (!dayProgress) {
      dayProgress = {
        completed: false,
        breakfast: { completed: false, actualCalories: null, notes: "", completedAt: null },
        lunch: { completed: false, actualCalories: null, notes: "", completedAt: null },
        dinner: { completed: false, actualCalories: null, notes: "", completedAt: null },
        actualWaterIntake: null,
        dailyNotes: "",
        completedAt: null,
      };
    }
    
    // Toggle meal completion
    const currentStatus = dayProgress[mealType]?.completed || false;
    dayProgress[mealType] = {
      completed: !currentStatus,
      actualCalories: !currentStatus ? (actualCalories || null) : null,
      notes: !currentStatus ? (notes || "") : "",
      completedAt: !currentStatus ? new Date() : null,
    };
    
    // Check if all meals for the day are completed
    const allMealsCompleted = ['breakfast', 'lunch', 'dinner'].every(
      meal => dayProgress[meal]?.completed
    );
    
    dayProgress.completed = allMealsCompleted;
    if (allMealsCompleted && !dayProgress.completedAt) {
      dayProgress.completedAt = new Date();
    } else if (!allMealsCompleted) {
      dayProgress.completedAt = null;
    }
    
    plan.progress.set(day, dayProgress);
    plan.markModified("progress");
    await plan.save();
    
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error("Toggle meal error:", error);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

const updateMealProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, mealType, actualCalories, notes, completed } = req.body;
    
    const plan = await DietPlan.findOne({ _id: planId, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    
    let dayProgress = plan.progress.get(day);
    if (!dayProgress) {
      dayProgress = {
        completed: false,
        breakfast: { completed: false, actualCalories: null, notes: "", completedAt: null },
        lunch: { completed: false, actualCalories: null, notes: "", completedAt: null },
        dinner: { completed: false, actualCalories: null, notes: "", completedAt: null },
        actualWaterIntake: null,
        dailyNotes: "",
        completedAt: null,
      };
    }
    
    dayProgress[mealType] = {
      completed: completed !== undefined ? completed : dayProgress[mealType]?.completed || false,
      actualCalories: actualCalories !== undefined ? actualCalories : dayProgress[mealType]?.actualCalories,
      notes: notes !== undefined ? notes : dayProgress[mealType]?.notes || "",
      completedAt: completed ? new Date() : dayProgress[mealType]?.completedAt,
    };
    
    // Update day completion status
    const allMealsCompleted = ['breakfast', 'lunch', 'dinner'].every(
      meal => dayProgress[meal]?.completed
    );
    dayProgress.completed = allMealsCompleted;
    if (allMealsCompleted && !dayProgress.completedAt) {
      dayProgress.completedAt = new Date();
    } else if (!allMealsCompleted) {
      dayProgress.completedAt = null;
    }
    
    plan.progress.set(day, dayProgress);
    plan.markModified("progress");
    await plan.save();
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

const updateDayProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, actualWaterIntake, dailyNotes } = req.body;
    
    const plan = await DietPlan.findOne({ _id: planId, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    
    let dayProgress = plan.progress.get(day);
    if (!dayProgress) {
      dayProgress = {
        completed: false,
        breakfast: { completed: false, actualCalories: null, notes: "", completedAt: null },
        lunch: { completed: false, actualCalories: null, notes: "", completedAt: null },
        dinner: { completed: false, actualCalories: null, notes: "", completedAt: null },
        actualWaterIntake: null,
        dailyNotes: "",
        completedAt: null,
      };
    }
    
    if (actualWaterIntake !== undefined) dayProgress.actualWaterIntake = actualWaterIntake;
    if (dailyNotes !== undefined) dayProgress.dailyNotes = dailyNotes;
    
    plan.progress.set(day, dayProgress);
    plan.markModified("progress");
    await plan.save();
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

const getProgressStats = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await DietPlan.findOne({ _id: planId, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Not found" });
    
    const days = Object.keys(plan.plan.weekly_plan || {});
    let totalMeals = 0;
    let completedMeals = 0;
    let totalCaloriesTarget = 0;
    let totalCaloriesActual = 0;
    let totalWaterTarget = 0;
    let totalWaterActual = 0;
    
    days.forEach(day => {
      const dayProgress = plan.progress.get(day);
      const dayPlan = plan.plan.weekly_plan[day];
      
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        totalMeals++;
        if (dayProgress?.[meal]?.completed) {
          completedMeals++;
          totalCaloriesActual += dayProgress[meal].actualCalories || dayPlan[meal]?.calories || 0;
        }
        totalCaloriesTarget += dayPlan[meal]?.calories || 0;
      });
      
      totalWaterTarget += plan.plan.daily_water_intake_liters || 0;
      if (dayProgress?.actualWaterIntake) {
        totalWaterActual += dayProgress.actualWaterIntake;
      }
    });
    
    const stats = {
      completionPercentage: totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0,
      totalMeals,
      completedMeals,
      totalCaloriesTarget,
      totalCaloriesActual,
      calorieAdherence: totalCaloriesTarget > 0 ? Math.round((totalCaloriesActual / totalCaloriesTarget) * 100) : 0,
      totalWaterTarget,
      totalWaterActual,
      waterAdherence: totalWaterTarget > 0 ? Math.round((totalWaterActual / totalWaterTarget) * 100) : 0,
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

module.exports = {
  generateDietPlan,
  getUserDietPlans,
  updateMeal,
  addSnack,
  removeFoodItem,
  replaceFoodItem,
  deleteDietPlan: deleteDietPlanCtrl,
  // Progress tracking
  toggleMealCompletion,
  updateMealProgress,
  updateDayProgress,
  getProgressStats,
};