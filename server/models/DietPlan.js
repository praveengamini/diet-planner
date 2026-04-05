const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);