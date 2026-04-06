const mongoose = require("mongoose");

const mealProgressSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  actualCalories: { type: Number, default: null },
  notes: { type: String, default: "" },
  completedAt: { type: Date, default: null },
});

const dayProgressSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  breakfast: { type: mealProgressSchema, default: () => ({}) },
  lunch: { type: mealProgressSchema, default: () => ({}) },
  dinner: { type: mealProgressSchema, default: () => ({}) },
  actualWaterIntake: { type: Number, default: null }, // in liters
  dailyNotes: { type: String, default: "" },
  completedAt: { type: Date, default: null },
});

const dietPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profile: {
      age: Number,
      gender: String,
      weight_kg: Number,
      height_cm: Number,
      activity_level: String,
      goal: String,
    },
    dietType: String,
    allergies: [String],
    medicalConditions: [String],
    mealsPerDay: Number,

    plan: {
      type: Object, 
      required: true,
    },

    // Progress tracking - maps day names to progress data
    progress: {
      type: Map,
      of: dayProgressSchema,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

// Virtual to calculate overall completion percentage
dietPlanSchema.virtual("completionPercentage").get(function() {
  if (!this.plan?.weekly_plan) return 0;
  
  const days = Object.keys(this.plan.weekly_plan);
  if (days.length === 0) return 0;
  
  let totalMeals = 0;
  let completedMeals = 0;
  
  days.forEach(day => {
    const dayProgress = this.progress.get(day);
    if (dayProgress) {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        totalMeals++;
        if (dayProgress[meal]?.completed) completedMeals++;
      });
    } else {
      totalMeals += 3; // breakfast, lunch, dinner
    }
  });
  
  return totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
});

// Ensure virtuals are included in JSON
dietPlanSchema.set('toJSON', { virtuals: true });
dietPlanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("DietPlan", dietPlanSchema);