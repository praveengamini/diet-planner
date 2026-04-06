import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Flame,
  ChevronRight,
  Edit2,
  X,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  ArrowLeft,
  Droplets,
  Save,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  removeItem, replaceItem, addSnack, updateMeal, deleteDietPlan,
  setCurrentPlan, updateCurrentPlanLocally,
} from "../../store/diet";

import { toast } from "sonner";

const MEALS = ["breakfast", "lunch", "dinner"];
const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
const MEAL_COLORS = {
  breakfast: { bg: "from-amber-50 to-orange-50", accent: "text-amber-700", border: "border-amber-200" },
  lunch: { bg: "from-emerald-50 to-teal-50", accent: "text-emerald-700", border: "border-emerald-200" },
  dinner: { bg: "from-indigo-50 to-purple-50", accent: "text-indigo-700", border: "border-indigo-200" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcDailyKcal = (meals) =>
  MEALS.reduce((s, m) => s + (meals[m]?.calories || 0), 0) +
  (meals.snacks || []).reduce((s, sn) => s + (sn.calories || 0), 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

const NutritionBadge = ({ label, value, unit, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <div className={`rounded-xl px-4 py-3 ${colors[color]}`}>
      <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black">{value ?? "–"}</span>
        <span className="text-xs font-semibold opacity-60">{unit}</span>
      </div>
    </div>
  );
};

const IngredientRow = ({ ingredient, index, onEdit, onDelete }) => (
  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-150">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
        {index + 1}
      </span>
      <span className="text-sm text-gray-700 font-medium truncate">{ingredient}</span>
    </div>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(ingredient, index)}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
        title="Change"
      >
        <Edit2 size={14} />
      </button>
      <button
        onClick={() => onDelete(ingredient, index)}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
        title="Remove"
      >
        <X size={14} />
      </button>
    </div>
  </div>
);

const SnackRow = ({ snack, index, onDelete }) => (
  <div className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
    <span className="text-sm text-gray-700 font-medium">{snack.name}</span>
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
        {snack.calories} kcal
      </span>
      <button
        onClick={() => onDelete(index)}
        className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X size={12} />
      </button>
    </div>
  </div>
);

const MealCard = ({ mealType, meal, dayKey, planId, isExpanded, onToggle, onRefresh }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const colors = MEAL_COLORS[mealType];
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editDialog, setEditDialog] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [snackDialog, setSnackDialog] = useState(false);
  const [snackForm, setSnackForm] = useState({ name: "", calories: "" });
  const [saving, setSaving] = useState(false);

  if (!meal) return null;

  const handleDeleteIngredient = async () => {
    setSaving(true);
    const result = await dispatch(removeItem({
      planId, day: dayKey, mealType, item: deleteDialog.ingredient,
    }));
    setSaving(false);
    if (removeItem.fulfilled.match(result)) {
      toast.success("Ingredient removed");
      onRefresh(result.payload);
    } else {
      toast.error("Failed to remove");
    }
    setDeleteDialog(null);
  };

  const handleReplaceIngredient = async () => {
    if (!editValue.trim()) return;
    setSaving(true);
    const result = await dispatch(replaceItem({
      planId, day: dayKey, mealType,
      oldItem: editDialog.ingredient,
      newItem: editValue.trim(),
    }));
    setSaving(false);
    if (replaceItem.fulfilled.match(result)) {
      toast.success("Ingredient updated");
      onRefresh(result.payload);
    } else {
      toast.error("Failed to update");
    }
    setEditDialog(null);
  };

  const handleAddSnack = async () => {
    if (!snackForm.name.trim() || !snackForm.calories) return;
    setSaving(true);
    const result = await dispatch(addSnack({
      planId, day: dayKey,
      snack: { name: snackForm.name.trim(), calories: Number(snackForm.calories) },
    }));
    setSaving(false);
    if (addSnack.fulfilled.match(result)) {
      toast.success("Snack added");
      onRefresh(result.payload);
    } else {
      toast.error("Failed to add snack");
    }
    setSnackDialog(false);
    setSnackForm({ name: "", calories: "" });
  };

  const handleDeleteSnack = async (snackIndex) => {
    // Optimistically remove from local state then sync
    const updatedSnacks = (meal.snacks || []).filter((_, i) => i !== snackIndex);
    const updatedMeal = { ...meal, snacks: updatedSnacks };
    setSaving(true);
    const result = await dispatch(updateMeal({ planId, day: dayKey, mealType, newMeal: updatedMeal }));
    setSaving(false);
    if (updateMeal.fulfilled.match(result)) {
      toast.success("Snack removed");
      onRefresh(result.payload);
    } else {
      toast.error("Failed");
    }
  };

  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
      isExpanded ? `${colors.border} bg-white shadow-md` : "border-gray-100 bg-white/60 hover:border-gray-200"
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        type="button"
        className={`w-full px-5 py-4 flex items-center justify-between transition-all ${
          isExpanded ? `bg-gradient-to-r ${colors.bg}` : "hover:bg-gray-50/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{MEAL_ICONS[mealType]}</span>
          <div className="text-left">
            <div className="font-bold text-gray-900 capitalize">{mealType}</div>
            {meal.name && <div className="text-xs text-gray-500">{meal.name}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saving && <RefreshCw size={14} className="text-orange-400 animate-spin" />}
          <div className="text-right">
            <div className="font-black text-gray-900">{meal.calories}<span className="text-xs text-gray-400 font-semibold ml-1">kcal</span></div>
          </div>
          <ChevronRight size={18} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* Body */}
      {isExpanded && (
        <div className="px-5 py-4 space-y-5">
          {/* Macros */}
          <div className="grid grid-cols-4 gap-2">
            <NutritionBadge label="Protein" value={meal.protein_g} unit="g" color="blue" />
            <NutritionBadge label="Carbs" value={meal.carbs_g} unit="g" color="orange" />
            <NutritionBadge label="Fat" value={meal.fats_g} unit="g" color="purple" />
            <NutritionBadge label="Fiber" value={meal.fiber_g} unit="g" color="green" />
          </div>

          {/* Ingredients */}
          {meal.ingredients?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ingredients</div>
              <div className="space-y-0.5">
                {meal.ingredients.map((ing, idx) => (
                  <IngredientRow
                    key={idx}
                    ingredient={ing}
                    index={idx}
                    onEdit={(ingredient) => { setEditDialog({ ingredient, index: idx }); setEditValue(ingredient); }}
                    onDelete={(ingredient) => setDeleteDialog({ ingredient, index: idx })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Portions */}
          {Object.keys(meal.portion_sizes || {}).length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Portions</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(meal.portion_sizes).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-600 font-medium capitalize truncate">{k}</span>
                    <span className="text-gray-800 font-bold ml-2 shrink-0">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Snacks */}
          {mealType === "dinner" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Snacks</div>
                <button
                  onClick={() => setSnackDialog(true)}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors"
                >
                  <Plus size={12} /> Add Snack
                </button>
              </div>
              {(meal.snacks || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic px-3">No snacks added</p>
              ) : (
                <div className="space-y-1">
                  {(meal.snacks || []).map((sn, i) => (
                    <SnackRow key={i} snack={sn} index={i} onDelete={handleDeleteSnack} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Ingredient Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle size={18} /> Remove Ingredient
            </DialogTitle>
            <DialogDescription>
              Remove <strong>"{deleteDialog?.ingredient}"</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button onClick={handleDeleteIngredient} className="bg-red-600 hover:bg-red-700 text-white">
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Replace Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(o) => !o && setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Edit2 size={18} /> Replace Ingredient
            </DialogTitle>
            <DialogDescription>
              Replacing <strong>"{editDialog?.ingredient}"</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReplaceIngredient()}
            placeholder="New ingredient..."
            className="mt-2"
          />
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/user/alternatives", {
                  state: {
                    foodItem: editDialog?.ingredient,
                    replaceContext: { planId, day: dayKey, mealType, oldItem: editDialog?.ingredient },
                  },
                });
                setEditDialog(null);
              }}
              className="border-blue-300 text-blue-600"
            >
              <ExternalLink size={14} className="mr-1" /> Browse Alternatives
            </Button>
            <Button
              onClick={handleReplaceIngredient}
              disabled={!editValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle size={14} className="mr-1" /> Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Snack Dialog */}
      <Dialog open={snackDialog} onOpenChange={(o) => !o && setSnackDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Plus size={18} /> Add Snack
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Snack name (e.g. Apple)"
              value={snackForm.name}
              onChange={(e) => setSnackForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Calories (kcal)"
              value={snackForm.calories}
              onChange={(e) => setSnackForm((f) => ({ ...f, calories: e.target.value }))}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSnackDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddSnack}
              disabled={!snackForm.name.trim() || !snackForm.calories}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const DietView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentPlan, plans } = useSelector((s) => s.diet);

  // Resolve plan from redux
  const planDoc = useMemo(() => {
    if (currentPlan?._id === id) return currentPlan;
    return plans.find((p) => p._id === id) || null;
  }, [currentPlan, plans, id]);

  const [localPlan, setLocalPlan] = useState(planDoc);
  const [expandedMeals, setExpandedMeals] = useState({});
  const [activeDay, setActiveDay] = useState(null);
  const [deletePlanDialog, setDeletePlanDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  if (!planDoc) {
    return <LoadingSpinner />;
  }
  useEffect(() => {
    if (planDoc) {
      setLocalPlan(planDoc);
      if (!activeDay) setActiveDay(Object.keys(planDoc.plan?.weekly_plan || {})[0]);
    }
  }, [planDoc]);

  const onRefresh = useCallback((updatedDoc) => {
    setLocalPlan(updatedDoc);
    dispatch(updateCurrentPlanLocally(updatedDoc));
  }, [dispatch]);

  const toggleMeal = useCallback((day, mealType) => {
    setExpandedMeals((prev) => {
      const key = `${day}:${mealType}`;
      return { ...prev, [key]: !prev[key] };
    });
  }, []);

  const handleDeletePlan = async () => {
    setDeleting(true);
    const result = await dispatch(deleteDietPlan(id));
    setDeleting(false);
    if (deleteDietPlan.fulfilled.match(result)) {
      toast.success("Plan deleted");
      navigate("/user/diet/history");
    } else {
      toast.error("Failed to delete");
    }
  };

  const weeklyStats = useMemo(() => {
    if (!localPlan?.plan?.weekly_plan) return {};
    const days = Object.entries(localPlan.plan.weekly_plan);
    const totalKcal = days.reduce((s, [, m]) => s + calcDailyKcal(m), 0);
    const avgKcal = Math.round(totalKcal / days.length);
    const totalProtein = days.reduce(
      (s, [, m]) => s + MEALS.reduce((ss, mt) => ss + (m[mt]?.protein_g || 0), 0), 0
    );
    return { totalKcal, avgKcal, days: days.length, totalProtein };
  }, [localPlan]);

  if (!localPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-700 mb-2">Plan not found</h1>
          <Button onClick={() => navigate("/user/diet/history")} variant="outline">
            ← Back to History
          </Button>
        </div>
      </div>
    );
  }

  const weeklyPlan = localPlan.plan?.weekly_plan || {};
  const days = Object.keys(weeklyPlan);
  const currentDayMeals = activeDay ? weeklyPlan[activeDay] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Top Nav */}
<div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
    <button
      onClick={() => navigate("/user/diet/history")}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors"
    >
      <ArrowLeft size={18} /> Plans
    </button>
 
    <div className="text-center">
      <div className="font-black text-gray-900 text-lg capitalize">
        {localPlan.profile?.goal?.replace("_", " ")} Plan
      </div>
      <div className="text-xs text-gray-400">
        {new Date(localPlan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
    </div>
 
    <div className="flex items-center gap-2">
      {/* NEW: Progress Tracking Button */}
      <button
        onClick={() => navigate(`/user/diet/${id}/progress`)}
        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold text-sm px-3 py-1.5 rounded-xl hover:bg-green-50 transition-all border border-green-200"
      >
        <CheckCircle size={16} /> Track
      </button>
      
      <button
        onClick={() => setDeletePlanDialog(true)}
        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-semibold text-sm px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all"
      >
        <Trash2 size={16} /> Delete
      </button>
    </div>
  </div>
</div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Daily Target" value={localPlan.plan.daily_calories_target} unit="kcal" icon="🎯" color="orange" />
          <StatCard label="Avg/Day" value={weeklyStats.avgKcal} unit="kcal" icon="📊" color="blue" />
          <StatCard label="Water Daily" value={localPlan.plan.daily_water_intake_liters} unit="L" icon="💧" color="sky" />
          <StatCard label="Days Planned" value={weeklyStats.days} unit="days" icon="📅" color="green" />
        </div>
      </div>

      {/* Day Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => {
            const kcal = calcDailyKcal(weeklyPlan[day]);
            const target = localPlan.plan.daily_calories_target;
            const pct = Math.min(100, Math.round((kcal / target) * 100));
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[80px] ${
                  activeDay === day
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className={`text-xs font-black uppercase tracking-wide ${activeDay === day ? "text-orange-600" : "text-gray-500"}`}>
                  {day.slice(0, 3)}
                </span>
                <span className={`text-base font-black mt-0.5 ${activeDay === day ? "text-orange-700" : "text-gray-700"}`}>
                  {kcal}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">kcal</span>
                <div className="w-full h-1 rounded-full bg-gray-100 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 105 ? "bg-red-400" : pct > 90 ? "bg-green-400" : "bg-orange-300"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {activeDay && currentDayMeals && MEALS.map((mealType) => (
          <MealCard
            key={mealType}
            mealType={mealType}
            meal={currentDayMeals[mealType]}
            dayKey={activeDay}
            planId={id}
            isExpanded={expandedMeals[`${activeDay}:${mealType}`] || false}
            onToggle={() => toggleMeal(activeDay, mealType)}
            onRefresh={onRefresh}
          />
        ))}

        {/* Rationale Card */}
        {localPlan.plan.nutritional_rationale && (
          <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Nutritional Rationale</div>
            <p className="text-sm text-blue-800 leading-relaxed">{localPlan.plan.nutritional_rationale}</p>
          </div>
        )}
      </div>

      {/* Delete Plan Dialog */}
      <Dialog open={deletePlanDialog} onOpenChange={(o) => !o && setDeletePlanDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={18} /> Delete Plan
            </DialogTitle>
            <DialogDescription>
              This will permanently delete this diet plan. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePlanDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeletePlan}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatCard = ({ label, value, unit, icon, color }) => {
  const colors = {
    orange: "from-orange-50 to-amber-50 border-orange-100 text-orange-600",
    blue: "from-blue-50 to-indigo-50 border-blue-100 text-blue-600",
    sky: "from-sky-50 to-cyan-50 border-sky-100 text-sky-600",
    green: "from-green-50 to-emerald-50 border-green-100 text-green-600",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black">{value ?? "–"}</span>
        <span className="text-xs font-semibold opacity-60">{unit}</span>
      </div>
    </div>
  );
};

export default DietView;