import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAlternatives, replaceItem, clearAlternatives } from "../../store/diet";
import { toast } from "sonner";
import { ArrowLeft, Search, Zap, CheckCircle, RefreshCw } from "lucide-react";

const DIET_TYPES = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
];

const REASONS = [
  { value: "healthier option", label: "Healthier" },
  { value: "weight loss", label: "Weight Loss" },
  { value: "muscle gain", label: "Muscle Gain" },
  { value: "lower carbs", label: "Lower Carbs" },
  { value: "higher protein", label: "Higher Protein" },
];

const COMMON_ALLERGIES = ["peanuts", "tree nuts", "milk", "eggs", "wheat", "soy", "fish", "shellfish"];

const MacroBadge = ({ label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>
      {label}: {value}g
    </span>
  );
};

const SimilarityBar = ({ score }) => {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "bg-green-400" : pct >= 60 ? "bg-orange-400" : "bg-gray-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-500">{pct}%</span>
    </div>
  );
};

const Alternatives = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { alternatives, alternativesOriginal, altLoading } = useSelector((s) => s.diet);

  const replaceContext = location.state?.replaceContext || null;
  const [replacing, setReplacing] = useState(null);

  const [form, setForm] = useState({
    food_item: location.state?.foodItem || "",
    reason: "healthier option",
    calorie_tolerance_percent: 20,
    diet_type: "omnivore",
    allergies: [],
    num_alternatives: 5,
  });

  useEffect(() => {
    return () => dispatch(clearAlternatives());
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAllergy = (a) =>
    setForm((f) => ({
      ...f,
      allergies: f.allergies.includes(a)
        ? f.allergies.filter((x) => x !== a)
        : [...f.allergies, a],
    }));

  const handleSearch = () => {
    if (!form.food_item.trim()) {
      toast.error("Enter a food item");
      return;
    }
    dispatch(fetchAlternatives(form));
  };

  const handleSelect = async (alt) => {
    if (!replaceContext) {
      toast.info(`Selected: ${alt.name}`);
      return;
    }
    setReplacing(alt.name);
    const result = await dispatch(replaceItem({
      planId: replaceContext.planId,
      day: replaceContext.day,
      mealType: replaceContext.mealType,
      oldItem: replaceContext.oldItem,
      newItem: alt.name,
    }));
    setReplacing(null);
    if (replaceItem.fulfilled.match(result)) {
      toast.success(`Replaced with ${alt.name}!`);
      navigate(`/user/diet/${replaceContext.planId}`);
    } else {
      toast.error("Replacement failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-black text-gray-900 text-xl">Food Alternatives</h1>
            {replaceContext && (
              <p className="text-xs text-orange-600 font-semibold">
                Replacing <em>"{replaceContext.oldItem}"</em> in {replaceContext.day} · {replaceContext.mealType}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Search Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-gray-800 text-lg">Search</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Food item */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Food Item</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. fried chicken"
                value={form.food_item}
                onChange={(e) => set("food_item", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Reason</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
              >
                {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Diet Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Diet Type</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.diet_type}
                onChange={(e) => set("diet_type", e.target.value)}
              >
                {DIET_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            {/* Calorie tolerance */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1.5">
                Calorie Tolerance: ±{form.calorie_tolerance_percent}%
              </label>
              <input
                type="range" min="5" max="50" step="5"
                className="w-full accent-orange-500"
                value={form.calorie_tolerance_percent}
                onChange={(e) => set("calorie_tolerance_percent", Number(e.target.value))}
              />
            </div>

            {/* Num alternatives */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Number of Results</label>
              <div className="flex gap-2">
                {[3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("num_alternatives", n)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      form.num_alternatives === n
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Avoid Allergens</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergy(a)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                      form.allergies.includes(a)
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={altLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-60"
          >
            {altLoading ? (
              <><RefreshCw size={16} className="animate-spin" /> Searching...</>
            ) : (
              <><Search size={16} /> Find Alternatives</>
            )}
          </button>
        </div>

        {/* Original Food Card */}
        {alternativesOriginal && (
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-5 border border-orange-200">
            <div className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">Original Food</div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-lg capitalize">{alternativesOriginal.name}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-orange-700">{alternativesOriginal.estimated_calories_per_100g} kcal/100g</span>
                  <MacroBadge label="P" value={alternativesOriginal.macros?.protein_g} color="blue" />
                  <MacroBadge label="C" value={alternativesOriginal.macros?.carbs_g} color="orange" />
                  <MacroBadge label="F" value={alternativesOriginal.macros?.fats_g} color="purple" />
                </div>
              </div>
              <Zap size={32} className="text-orange-300" />
            </div>
          </div>
        )}

        {/* Results */}
        {alternatives.length > 0 && (
          <div>
            <h2 className="font-black text-gray-900 text-xl mb-4">
              {alternatives.length} Alternatives Found
            </h2>
            <div className="space-y-3">
              {alternatives.map((alt, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md p-5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name + Similarity */}
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-gray-900 capitalize">{alt.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          alt.similarity_score >= 0.75
                            ? "bg-green-100 text-green-700"
                            : alt.similarity_score >= 0.6
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {(alt.similarity_score * 100).toFixed(0)}% similar
                        </span>
                      </div>

                      {/* Calories */}
                      <div className="text-sm font-bold text-gray-700 mb-2">
                        {alt.calories_per_100g} <span className="text-gray-400 font-medium">kcal/100g</span>
                      </div>

                      {/* Macros */}
                      <div className="flex gap-2 flex-wrap mb-3">
                        <MacroBadge label="P" value={alt.macros?.protein_g} color="blue" />
                        <MacroBadge label="C" value={alt.macros?.carbs_g} color="orange" />
                        <MacroBadge label="F" value={alt.macros?.fats_g} color="purple" />
                      </div>

                      {/* Similarity bar */}
                      <SimilarityBar score={alt.similarity_score} />

                      {/* Benefit */}
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{alt.benefit}</p>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => handleSelect(alt)}
                      disabled={replacing === alt.name}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        replaceContext
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      } disabled:opacity-60`}
                    >
                      {replacing === alt.name ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : replaceContext ? (
                        <><CheckCircle size={14} /> Replace</>
                      ) : (
                        "Select"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!altLoading && alternatives.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Search for a food item to see alternatives</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alternatives;