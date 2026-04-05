import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlternatives } from "../../store/diet";
import { useLocation } from "react-router-dom";
import { DIET_OPTIONS } from "../../utilities/constants/dietOptions";

const Alternatives = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { alternatives } = useSelector((state) => state.diet);

  const [form, setForm] = useState({
    food_item: "",
    reason: "healthier option",
    calorie_tolerance_percent: 20,
    diet_type: "omnivore",
    allergies: [],
    num_alternatives: 5,
  });

  // 🔥 Pre-fill when coming from replace
  useEffect(() => {
    if (location.state?.foodItem) {
      setForm((prev) => ({
        ...prev,
        food_item: location.state.foodItem,
      }));
    }
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    dispatch(fetchAlternatives(form));
  };

  const handleSelect = (alt) => {
    const context = location.state?.replaceContext;

    if (context) {
      alert(`Replace with ${alt.name}`);
      // 🔥 Later → dispatch update to diet plan
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">

        <h2 className="text-2xl font-bold text-black mb-6">
          Food Alternatives
        </h2>

        {/* 🔥 INPUT FORM */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">

          {/* Food */}
          <div>
            <label className="label">Food Item</label>
            <input
              className="input"
              value={form.food_item}
              onChange={(e) => handleChange("food_item", e.target.value)}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="label">Reason</label>
            <select
              className="input"
              value={form.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
            >
              <option value="healthier option">Healthier</option>
              <option value="weight loss">Weight Loss</option>
              <option value="muscle gain">Muscle Gain</option>
            </select>
          </div>

          {/* Diet Type */}
          <div>
            <label className="label">Diet Type</label>
            <select
              className="input"
              value={form.diet_type}
              onChange={(e) => handleChange("diet_type", e.target.value)}
            >
              {DIET_OPTIONS.dietTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calorie tolerance */}
          <div>
            <label className="label">Calorie Tolerance (%)</label>
            <input
              type="number"
              className="input"
              value={form.calorie_tolerance_percent}
              onChange={(e) =>
                handleChange("calorie_tolerance_percent", +e.target.value)
              }
            />
          </div>

          {/* Number of alternatives */}
          <div>
            <label className="label">Number of Alternatives</label>
            <select
              className="input"
              value={form.num_alternatives}
              onChange={(e) =>
                handleChange("num_alternatives", +e.target.value)
              }
            >
              {[3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

        </div>

        <button
          onClick={handleSearch}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg mb-6"
        >
          Get Alternatives
        </button>

        {/* 🔥 ORIGINAL FOOD */}
        {alternatives?.length > 0 && (
          <div className="mb-6 p-4 border rounded-lg bg-orange-100">
            <h3 className="font-bold text-black mb-2">Original Food</h3>

            <p className="font-semibold">{form.food_item}</p>

            {/* macros not stored in redux directly → optional enhancement */}
          </div>
        )}

        {/* 🔥 ALTERNATIVES LIST */}
        <div className="space-y-4">
          {alternatives.map((alt, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 hover:bg-orange-50 flex justify-between"
            >
              <div>
                <h3 className="font-semibold text-black">{alt.name}</h3>

                {/* 🔥 ALL DATA */}
                <p className="text-sm text-gray-600">
                  {alt.calories_per_100g} kcal / 100g
                </p>

                <p className="text-xs text-gray-500">
                  Protein: {alt.macros.protein_g}g | 
                  Carbs: {alt.macros.carbs_g}g | 
                  Fats: {alt.macros.fats_g}g
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {alt.benefit}
                </p>

                <p className="text-xs text-orange-500 mt-1">
                  Similarity: {(alt.similarity_score * 100).toFixed(0)}%
                </p>
              </div>

              <button
                onClick={() => handleSelect(alt)}
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Select
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Alternatives;