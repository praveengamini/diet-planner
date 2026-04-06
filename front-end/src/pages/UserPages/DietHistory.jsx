import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDietHistory, setCurrentPlan, deleteDietPlan } from "../../store/diet";
import { useNavigate } from "react-router-dom";
import { Trash2, Calendar, Flame, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MEALS = ["breakfast", "lunch", "dinner"];
const calcDayKcal = (meals) =>
  MEALS.reduce((s, m) => s + (meals?.[m]?.calories || 0), 0) +
  (meals?.snacks || []).reduce((s, sn) => s + (sn.calories || 0), 0);

const GOAL_COLORS = {
  weight_loss: "bg-blue-100 text-blue-700",
  weight_gain: "bg-green-100 text-green-700",
  maintenance: "bg-orange-100 text-orange-700",
  muscle_gain: "bg-purple-100 text-purple-700",
};

const GOAL_ICONS = {
  weight_loss: "📉",
  weight_gain: "📈",
  maintenance: "⚖️",
  muscle_gain: "💪",
};

const DietHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, loading } = useSelector((s) => s.diet);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchDietHistory());
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteDietPlan(deleteTarget._id));
    setDeleting(false);
    if (deleteDietPlan.fulfilled.match(result)) {
      toast.success("Plan deleted");
    } else {
      toast.error("Failed to delete");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Your Plans</h1>
            <p className="text-gray-400 mt-1 text-sm">{plans.length} plans generated</p>
          </div>
          <button
            onClick={() => navigate("/user/diet")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all text-sm"
          >
            <Plus size={16} /> New Plan
          </button>
        </div>

        {/* Loading */}
        {loading && !plans.length && (
          <div className="flex justify-center py-12">
            <RefreshCw size={24} className="animate-spin text-orange-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && plans.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-black text-gray-700 mb-2">No plans yet</h2>
            <p className="text-gray-400 mb-6">Create your first AI-powered diet plan</p>
            <button
              onClick={() => navigate("/user/diet")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl"
            >
              Create Plan →
            </button>
          </div>
        )}

        {/* Plan Cards */}
        <div className="space-y-3">
          {plans.map((plan) => {
            const wp = plan.plan?.weekly_plan || {};
            const daysCount = Object.keys(wp).length;
            const avgKcal = daysCount
              ? Math.round(Object.values(wp).reduce((s, m) => s + calcDayKcal(m), 0) / daysCount)
              : plan.plan?.daily_calories_target || 0;
            const goal = plan.profile?.goal || plan.goal || "maintenance";

            return (
              <div
                key={plan._id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Goal badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${GOAL_COLORS[goal]?.split(" ")[0] || "bg-gray-100"}`}>
                    {GOAL_ICONS[goal] || "🥗"}
                  </div>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => { dispatch(setCurrentPlan(plan)); navigate(`/user/diet/${plan._id}`); }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-gray-900 capitalize">
                        {goal.replace("_", " ")}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${GOAL_COLORS[goal] || "bg-gray-100 text-gray-600"}`}>
                        {plan.dietType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame size={11} className="text-orange-400" /> ~{avgKcal} kcal/day
                      </span>
                      <span>{daysCount} days</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(plan); }}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => { dispatch(setCurrentPlan(plan)); navigate(`/user/diet/${plan._id}`); }}
                      className="p-2 rounded-xl text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} className='bg-white'>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={18} /> Delete Plan
            </DialogTitle>
            <DialogDescription>
              Delete the <strong className="capitalize">{deleteTarget?.profile?.goal?.replace("_", " ")}</strong> plan from{" "}
              {deleteTarget && new Date(deleteTarget.createdAt).toLocaleDateString()}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DietHistory;