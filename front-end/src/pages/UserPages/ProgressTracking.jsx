import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle, Circle, ArrowLeft, TrendingUp, Droplets, Flame,
  Calendar, Edit2, Save, X, FileText, Award, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  toggleMealCompletion,
  updateMealProgress,
  updateDayProgress,
  fetchProgressStats,
  updateCurrentPlanLocally,
} from "../../store/diet";
import { toast } from "sonner";

const MEALS = ["breakfast", "lunch", "dinner"];
const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };

// ─── Helper Functions ─────────────────────────────────────────────────────────

const getDayProgress = (plan, day) => {
  if (!plan?.progress) return null;
  // Handle both Map object and plain object
  if (plan.progress instanceof Map) {
    return plan.progress.get(day);
  } else if (typeof plan.progress === 'object') {
    return plan.progress[day];
  }
  return null;
};

const getMealProgress = (dayProgress, mealType) => {
  if (!dayProgress || !dayProgress[mealType]) {
    return { completed: false, actualCalories: null, notes: "", completedAt: null };
  }
  return dayProgress[mealType];
};

const calcDailyActual = (dayProgress) => {
  if (!dayProgress) return 0;
  return MEALS.reduce((sum, meal) => {
    const mealData = dayProgress[meal];
    return sum + (mealData?.actualCalories || 0);
  }, 0);
};

const calcDailyTarget = (weeklyPlan, day) => {
  if (!weeklyPlan || !weeklyPlan[day]) return 0;
  return MEALS.reduce((sum, meal) => {
    return sum + (weeklyPlan[day][meal]?.calories || 0);
  }, 0);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProgressRing = ({ percentage, size = 120 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 90) return "#10b981"; // green
    if (percentage >= 70) return "#f59e0b"; // orange
    return "#6366f1"; // indigo
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-black text-gray-900">{percentage}%</div>
          <div className="text-xs text-gray-500 font-semibold">Complete</div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, unit, color = "blue", subtitle }) => {
  const colors = {
    blue: "from-blue-50 to-indigo-50 border-blue-100 text-blue-600",
    green: "from-green-50 to-emerald-50 border-green-100 text-green-600",
    orange: "from-orange-50 to-amber-50 border-orange-100 text-orange-600",
    purple: "from-purple-50 to-pink-50 border-purple-100 text-purple-600",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-white/50">
          <Icon size={20} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black">{value ?? "–"}</span>
        <span className="text-sm font-semibold opacity-60">{unit}</span>
      </div>
      {subtitle && <div className="text-xs mt-1 opacity-60 font-medium">{subtitle}</div>}
    </div>
  );
};

const MealProgressCard = ({ mealType, meal, dayKey, planId, dayProgress, onRefresh }) => {
  const dispatch = useDispatch();
  const mealProgress = getMealProgress(dayProgress, mealType);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    actualCalories: mealProgress.actualCalories || meal?.calories || "",
    notes: mealProgress.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    const result = await dispatch(toggleMealCompletion({
      planId,
      day: dayKey,
      mealType,
      actualCalories: mealProgress.completed ? null : (meal?.calories || 0),
      notes: mealProgress.notes || "",
    }));
    setSaving(false);
    if (toggleMealCompletion.fulfilled.match(result)) {
      toast.success(mealProgress.completed ? "Meal unmarked" : "Meal completed!");
      onRefresh(result.payload);
    } else {
      toast.error("Failed to update");
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const result = await dispatch(updateMealProgress({
      planId,
      day: dayKey,
      mealType,
      actualCalories: Number(editForm.actualCalories) || null,
      notes: editForm.notes,
      completed: true,
    }));
    setSaving(false);
    if (updateMealProgress.fulfilled.match(result)) {
      toast.success("Progress updated");
      onRefresh(result.payload);
      setEditDialog(false);
    } else {
      toast.error("Failed to save");
    }
  };

  const isCompleted = mealProgress.completed;
  const targetCal = meal?.calories || 0;
  const actualCal = mealProgress.actualCalories || 0;
  const variance = actualCal - targetCal;

  return (
    <>
      <div
        className={`rounded-2xl border-2 transition-all ${
          isCompleted
            ? "border-green-400 bg-green-50/50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{MEAL_ICONS[mealType]}</span>
              <div>
                <div className="font-bold text-gray-900 capitalize">{mealType}</div>
                {meal?.name && <div className="text-xs text-gray-500">{meal.name}</div>}
              </div>
            </div>
            <button
              onClick={handleToggle}
              disabled={saving}
              className={`p-2 rounded-xl transition-all ${
                isCompleted
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              }`}
            >
              {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
            </button>
          </div>

          {isCompleted && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-green-200">
                  <div className="text-xs text-gray-500 font-semibold mb-1">Target</div>
                  <div className="text-lg font-black text-gray-900">{targetCal} <span className="text-xs text-gray-400">kcal</span></div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-green-200">
                  <div className="text-xs text-gray-500 font-semibold mb-1">Actual</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-lg font-black text-gray-900">{actualCal} <span className="text-xs text-gray-400">kcal</span></div>
                    {variance !== 0 && (
                      <span className={`text-xs font-bold ${variance > 0 ? "text-orange-500" : "text-green-500"}`}>
                        ({variance > 0 ? "+" : ""}{variance})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {mealProgress.notes && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={12} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Notes</span>
                  </div>
                  <p className="text-sm text-blue-800">{mealProgress.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    actualCalories: mealProgress.actualCalories || meal?.calories || "",
                    notes: mealProgress.notes || "",
                  });
                  setEditDialog(true);
                }}
                className="w-full text-xs"
              >
                <Edit2 size={12} className="mr-1" /> Edit Details
              </Button>
            </div>
          )}

          {!isCompleted && (
            <div className="text-center py-3">
              <div className="text-sm text-gray-500 mb-2">
                Target: <span className="font-bold text-gray-700">{targetCal} kcal</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    actualCalories: meal?.calories || "",
                    notes: "",
                  });
                  setEditDialog(true);
                }}
                className="text-xs"
              >
                Add Details & Complete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={(o) => !o && setEditDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Edit2 size={18} /> Edit {mealType} Progress
            </DialogTitle>
            <DialogDescription>
              Update actual calories consumed and add notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Actual Calories (kcal)
              </label>
              <Input
                type="number"
                value={editForm.actualCalories}
                onChange={(e) => setEditForm({ ...editForm, actualCalories: e.target.value })}
                placeholder={`Target: ${targetCal} kcal`}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Any modifications, feelings, or observations..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.actualCalories}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save size={14} className="mr-1" /> Save & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const DayProgressCard = ({ dayKey, weeklyPlan, plan, onRefresh }) => {
  const dispatch = useDispatch();
  const [editWater, setEditWater] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [waterValue, setWaterValue] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [saving, setSaving] = useState(false);

  const dayProgress = getDayProgress(plan, dayKey);
  const dayMeals = weeklyPlan[dayKey];
  const targetCal = calcDailyTarget(weeklyPlan, dayKey);
  const actualCal = calcDailyActual(dayProgress);
  const targetWater = plan.plan?.daily_water_intake_liters || 2;
  const actualWater = dayProgress?.actualWaterIntake || 0;

  const completedMeals = MEALS.filter(m => getMealProgress(dayProgress, m).completed).length;
  const isDayComplete = completedMeals === 3;

  const handleSaveWater = async () => {
    setSaving(true);
    const result = await dispatch(updateDayProgress({
      planId: plan._id,
      day: dayKey,
      actualWaterIntake: Number(waterValue) || 0,
    }));
    setSaving(false);
    if (updateDayProgress.fulfilled.match(result)) {
      toast.success("Water intake updated");
      onRefresh(result.payload);
      setEditWater(false);
    } else {
      toast.error("Failed to update");
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    const result = await dispatch(updateDayProgress({
      planId: plan._id,
      day: dayKey,
      dailyNotes: notesValue,
    }));
    setSaving(false);
    if (updateDayProgress.fulfilled.match(result)) {
      toast.success("Notes saved");
      onRefresh(result.payload);
      setEditNotes(false);
    } else {
      toast.error("Failed to save");
    }
  };

  return (
    <>
      <div className={`rounded-2xl border-2 p-5 ${
        isDayComplete ? "border-green-400 bg-green-50/30" : "border-gray-200 bg-white"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDayComplete ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {isDayComplete ? <CheckCircle size={20} /> : <Calendar size={20} />}
            </div>
            <div>
              <div className="font-black text-gray-900 capitalize">{dayKey}</div>
              <div className="text-xs text-gray-500">{completedMeals}/3 meals completed</div>
            </div>
          </div>
          {isDayComplete && (
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              ✓ Day Complete
            </div>
          )}
        </div>

        {/* Meals Progress */}
        <div className="grid gap-3 mb-4">
          {MEALS.map(mealType => (
            <MealProgressCard
              key={mealType}
              mealType={mealType}
              meal={dayMeals?.[mealType]}
              dayKey={dayKey}
              planId={plan._id}
              dayProgress={dayProgress}
              onRefresh={onRefresh}
            />
          ))}
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Calories</span>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {actualCal} <span className="text-sm text-gray-500">/ {targetCal}</span>
            </div>
            <div className="text-xs text-orange-600 font-semibold mt-1">
              {targetCal > 0 ? Math.round((actualCal / targetCal) * 100) : 0}% of target
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-sky-600" />
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">Water</span>
              </div>
              <button
                onClick={() => {
                  setWaterValue(actualWater || "");
                  setEditWater(true);
                }}
                className="p-1 hover:bg-sky-100 rounded-lg transition-colors"
              >
                <Edit2 size={12} className="text-sky-600" />
              </button>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {actualWater} <span className="text-sm text-gray-500">/ {targetWater} L</span>
            </div>
            <div className="text-xs text-sky-600 font-semibold mt-1">
              {targetWater > 0 ? Math.round((actualWater / targetWater) * 100) : 0}% of target
            </div>
          </div>
        </div>

        {/* Daily Notes */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-gray-600" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Daily Notes</span>
            </div>
            <button
              onClick={() => {
                setNotesValue(dayProgress?.dailyNotes || "");
                setEditNotes(true);
              }}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Edit2 size={12} className="text-gray-600" />
            </button>
          </div>
          {dayProgress?.dailyNotes ? (
            <p className="text-sm text-gray-700">{dayProgress.dailyNotes}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">No notes added yet</p>
          )}
        </div>
      </div>

      {/* Water Edit Dialog */}
      <Dialog open={editWater} onOpenChange={(o) => !o && setEditWater(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sky-600">
              <Droplets size={18} /> Update Water Intake
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              step="0.1"
              value={waterValue}
              onChange={(e) => setWaterValue(e.target.value)}
              placeholder={`Target: ${targetWater} L`}
              className="text-lg"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWater(false)}>Cancel</Button>
            <Button
              onClick={handleSaveWater}
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Save size={14} className="mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Edit Dialog */}
      <Dialog open={editNotes} onOpenChange={(o) => !o && setEditNotes(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-700">
              <FileText size={18} /> Daily Notes
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="How did you feel? Any observations or modifications..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNotes(false)}>Cancel</Button>
            <Button
              onClick={handleSaveNotes}
              disabled={saving}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              <Save size={14} className="mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProgressTracking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentPlan, plans, progressStats, progressLoading } = useSelector((s) => s.diet);

  const planDoc = useMemo(() => {
    if (currentPlan?._id === id) return currentPlan;
    return plans.find((p) => p._id === id) || null;
  }, [currentPlan, plans, id]);

  const [localPlan, setLocalPlan] = useState(planDoc);

  useEffect(() => {
    if (planDoc) {
      setLocalPlan(planDoc);
    }
  }, [planDoc]);

  useEffect(() => {
    if (id) {
      dispatch(fetchProgressStats(id));
    }
  }, [id, dispatch]);

  const onRefresh = (updatedDoc) => {
    setLocalPlan(updatedDoc);
    dispatch(updateCurrentPlanLocally(updatedDoc));
    dispatch(fetchProgressStats(id));
  };

  const weeklyPlan = localPlan?.plan?.weekly_plan || {};
  const days = Object.keys(weeklyPlan);

  // Calculate stats
  const totalMeals = days.length * 3;
  const completedMeals = days.reduce((sum, day) => {
    const dayProgress = getDayProgress(localPlan, day);
    return sum + MEALS.filter(m => getMealProgress(dayProgress, m).completed).length;
  }, 0);
  const completionPct = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  const totalCalTarget = progressStats?.totalCaloriesTarget || 0;
  const totalCalActual = progressStats?.totalCaloriesActual || 0;
  const calAdherence = progressStats?.calorieAdherence || 0;

  const totalWaterTarget = progressStats?.totalWaterTarget || 0;
  const totalWaterActual = progressStats?.totalWaterActual || 0;
  const waterAdherence = progressStats?.waterAdherence || 0;

  if (!localPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Plan not found</p>
          <Button onClick={() => navigate("/user/diet/history")} className="mt-4">
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/user/diet/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              <ArrowLeft size={18} /> Back to Plan
            </button>
            <div className="text-center">
              <div className="font-black text-gray-900 text-lg">Progress Tracking</div>
              <div className="text-xs text-gray-500 capitalize">
                {localPlan.profile?.goal?.replace("_", " ")} Plan
              </div>
            </div>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="col-span-1 flex justify-center">
            <ProgressRing percentage={completionPct} />
          </div>
          <StatCard
            icon={Target}
            label="Meals"
            value={completedMeals}
            unit={`/ ${totalMeals}`}
            color="blue"
            subtitle={`${completionPct}% complete`}
          />
          <StatCard
            icon={Flame}
            label="Calories"
            value={totalCalActual}
            unit={`/ ${totalCalTarget}`}
            color="orange"
            subtitle={`${calAdherence}% adherence`}
          />
          <StatCard
            icon={Droplets}
            label="Water"
            value={totalWaterActual.toFixed(1)}
            unit={`/ ${totalWaterTarget} L`}
            color="green"
            subtitle={`${waterAdherence}% adherence`}
          />
        </div>

        {/* Achievement Banner */}
        {completionPct === 100 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Award size={32} />
              </div>
              <div>
                <div className="text-2xl font-black mb-1">🎉 Congratulations!</div>
                <div className="text-green-100">You've completed your entire diet plan!</div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Progress Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-gray-400" size={20} />
            <h2 className="text-xl font-black text-gray-900">Daily Progress</h2>
          </div>
          {days.map(day => (
            <DayProgressCard
              key={day}
              dayKey={day}
              weeklyPlan={weeklyPlan}
              plan={localPlan}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;