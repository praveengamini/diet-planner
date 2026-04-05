import { DIET_OPTIONS } from "../../utilities/constants/dietOptions";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateDiet } from "../../store/diet";

const InputField = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const DietPlanner = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.diet);

  const [form, setForm] = useState({
    profile: {
      age: "",
      gender: "male",
      weight_kg: "",
      height_cm: "",
      activity_level: "sedentary",
      goal: "maintenance",
    },
    goal: "maintenance",
    diet_type: "omnivore",
    allergies: [],
    medical_conditions: [],
    meals_per_day: 3,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    dispatch(generateDiet(form));
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-black mb-6">
          Generate Diet Plan
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <InputField label="Age">
            <input
              type="number"
              className="input"
              value={form.profile.age}
              onChange={(e) => handleChange("age", +e.target.value)}
            />
          </InputField>

          <InputField label="Weight (kg)">
            <input
              type="number"
              className="input"
              value={form.profile.weight_kg}
              onChange={(e) => handleChange("weight_kg", +e.target.value)}
            />
          </InputField>

          <InputField label="Height (cm)">
            <input
              type="number"
              className="input"
              value={form.profile.height_cm}
              onChange={(e) => handleChange("height_cm", +e.target.value)}
            />
          </InputField>

          <InputField label="Gender">
            <select
              className="input"
              value={form.profile.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </InputField>

          <InputField label="Activity Level">
            <select
              className="input col-span-2"
              value={form.profile.activity_level}
              onChange={(e) =>
                handleChange("activity_level", e.target.value)
              }
            >
              {DIET_OPTIONS.activityLevels.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Goal">
            <select
              className="input col-span-2"
              value={form.goal}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  goal: e.target.value,
                  profile: {
                    ...prev.profile,
                    goal: e.target.value,
                  },
                }))
              }
            >
              {DIET_OPTIONS.goals.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Diet Type">
            <select
              className="input col-span-2"
              value={form.diet_type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  diet_type: e.target.value,
                }))
              }
            >
              {DIET_OPTIONS.dietTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Meals Per Day">
            <input
              type="number"
              min="1"
              max="6"
              className="input col-span-2"
              value={form.meals_per_day}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  meals_per_day: +e.target.value,
                }))
              }
            />
          </InputField>

        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>
    </div>
  );
};

export default DietPlanner;