import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateDiet } from "../../store/diet";
import { toast } from "sonner";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  { value: "extra_active", label: "Extra Active", desc: "Very hard exercise & physical job" },
];

const GOALS = [
  { value: "weight_loss", label: "Weight Loss", icon: "📉" },
  { value: "weight_gain", label: "Weight Gain", icon: "📈" },
  { value: "maintenance", label: "Maintenance", icon: "⚖️" },
  { value: "muscle_gain", label: "Muscle Gain", icon: "💪" },
];

const DIET_TYPES = [
  { value: "omnivore", label: "Omnivore", icon: "🍖" },
  { value: "vegetarian", label: "Vegetarian", icon: "🥗" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "keto", label: "Keto", icon: "🥑" },
  { value: "paleo", label: "Paleo", icon: "🦴" },
  { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
];

const COMMON_ALLERGIES = ["peanuts", "tree nuts", "milk", "eggs", "wheat", "soy", "fish", "shellfish"];

const MEDICAL_CONDITIONS = ["none", "diabetes", "hypertension", "celiac", "lactose_intolerance", "anemia", "hypothyroidism"];

const STEPS = ["Profile", "Diet Preferences", "Health Info", "Review"];

const DietPlanner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.diet);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    profile: {
      age: "",
      gender: "male",
      weight_kg: "",
      height_cm: "",
      activity_level: "moderately_active",
      goal: "maintenance",
    },
    goal: "maintenance",
    diet_type: "omnivore",
    allergies: [],
    medical_conditions: ["none"],
    meals_per_day: 3,
  });

  const set = (section, key, val) => {
    if (section) {
      setForm((f) => ({ ...f, [section]: { ...f[section], [key]: val } }));
    } else {
      setForm((f) => ({ ...f, [key]: val }));
    }
  };

  const toggleAllergy = (val) => {
    setForm((f) => ({
      ...f,
      allergies: f.allergies.includes(val)
        ? f.allergies.filter((a) => a !== val)
        : [...f.allergies, val],
    }));
  };

  const toggleCondition = (val) => {
    setForm((f) => {
      let current = f.medical_conditions;
      if (val === "none") return { ...f, medical_conditions: ["none"] };
      current = current.filter((c) => c !== "none");
      return {
        ...f,
        medical_conditions: current.includes(val)
          ? current.filter((c) => c !== val)
          : [...current, val],
      };
    });
  };

  const validate = () => {
    const p = form.profile;
    if (!p.age || !p.weight_kg || !p.height_cm) {
      toast.error("Please fill all profile fields");
      return false;
    }
    if (p.age < 2 || p.age > 100) { toast.error("Age must be between 2-100"); return false; }
    if (p.weight_kg < 5 || p.weight_kg > 300) { toast.error("Invalid weight"); return false; }
    if (p.height_cm < 50 || p.height_cm > 250) { toast.error("Invalid height"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      ...form,
      profile: {
        ...form.profile,
        age: Number(form.profile.age),
        weight_kg: Number(form.profile.weight_kg),
        height_cm: Number(form.profile.height_cm),
      },
      allergies: form.allergies.length ? form.allergies : [],
    };
    const result = await dispatch(generateDiet(payload));
    if (generateDiet.fulfilled.match(result)) {
      toast.success("Diet plan generated!");
      navigate(`/user/diet/${result.payload._id}`);
    } else {
      const err = result.payload;
      if (Array.isArray(err?.detail)) {
        err.detail.forEach((d) => toast.error(d.msg));
      } else {
        toast.error("Failed to generate plan");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Build Your Plan
          </h1>
          <p className="text-gray-500 mt-2">
            AI-personalized nutrition in seconds
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  i === step
                    ? "bg-orange-500 text-white shadow-md"
                    : i < step
                    ? "bg-orange-200 text-orange-800 cursor-pointer"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/30">
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 rounded ${i < step ? "bg-orange-400" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">

          {/* STEP 0 — Profile */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Age</label>
                  <input
                    type="number" min="2" max="100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form.profile.age}
                    onChange={(e) => set("profile", "age", e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Gender</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form.profile.gender}
                    onChange={(e) => set("profile", "gender", e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Weight (kg)</label>
                  <input
                    type="number" min="5" max="300"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form.profile.weight_kg}
                    onChange={(e) => set("profile", "weight_kg", e.target.value)}
                    placeholder="65"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Height (cm)</label>
                  <input
                    type="number" min="50" max="250"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form.profile.height_cm}
                    onChange={(e) => set("profile", "height_cm", e.target.value)}
                    placeholder="170"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => set("profile", "activity_level", lvl.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                        form.profile.activity_level === lvl.value
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <span className="font-semibold text-gray-800 text-sm">{lvl.label}</span>
                      <span className="text-xs text-gray-400">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Diet Preferences */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Diet Preferences</h2>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Your Goal</label>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => { set("profile", "goal", g.value); set(null, "goal", g.value); }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        form.goal === g.value
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <span className="font-semibold text-sm text-gray-800">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Diet Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIET_TYPES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => set(null, "diet_type", d.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        form.diet_type === d.value
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <span className="text-xl">{d.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">
                  Meals per Day
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set(null, "meals_per_day", n)}
                      className={`flex-1 py-2 rounded-xl border-2 font-bold transition-all ${
                        form.meals_per_day === n
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Health Info */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Health Information</h2>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                        form.allergies.includes(a)
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {form.allergies.includes(a) ? "✕ " : "+ "}
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Medical Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {MEDICAL_CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCondition(c)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all capitalize ${
                        form.medical_conditions.includes(c)
                          ? "border-blue-400 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {form.medical_conditions.includes(c) ? "✓ " : "+ "}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Review Your Plan</h2>

              <div className="bg-orange-50 rounded-2xl p-4 space-y-3 text-sm">
                <Row label="Age" value={`${form.profile.age} years`} />
                <Row label="Gender" value={form.profile.gender} />
                <Row label="Weight" value={`${form.profile.weight_kg} kg`} />
                <Row label="Height" value={`${form.profile.height_cm} cm`} />
                <Row label="Activity" value={ACTIVITY_LEVELS.find(a=>a.value===form.profile.activity_level)?.label} />
                <Row label="Goal" value={GOALS.find(g=>g.value===form.goal)?.label} />
                <Row label="Diet Type" value={DIET_TYPES.find(d=>d.value===form.diet_type)?.label} />
                <Row label="Meals/Day" value={form.meals_per_day} />
                <Row label="Allergies" value={form.allergies.length ? form.allergies.join(", ") : "None"} />
                <Row label="Conditions" value={form.medical_conditions.join(", ")} />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold disabled:opacity-30 hover:border-gray-300 transition-all"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md transition-all"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "🚀 Generate Plan"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Shortcut to history */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have a plan?{" "}
          <button
            type="button"
            onClick={() => navigate("/user/diet/history")}
            className="text-orange-500 font-semibold hover:underline"
          >
            View history →
          </button>
        </p>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-800 font-semibold capitalize">{value}</span>
  </div>
);

export default DietPlanner;