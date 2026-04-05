import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Flame, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MEALS = ["breakfast", "lunch", "dinner"];

const MEAL_CONFIG = {
  breakfast: { label: "Breakfast", short: "B", bg: "bg-orange-500" },
  lunch:     { label: "Lunch",     short: "L", bg: "bg-orange-700" },
  dinner:    { label: "Dinner",    short: "D", bg: "bg-orange-900" },
};

/* ── Macro tile ─────────────────────────────────────────────────────────── */
const MacroTile = ({ label, value }) => (
  <div className="flex-1 flex flex-col items-center bg-orange-50 border border-orange-200 rounded-xl py-2 px-1">
    <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 mb-0.5">
      {label}
    </span>
    <span className="text-sm font-semibold text-black">{value}</span>
  </div>
);

/* ── Meal content ───────────────────────────────────────────────────────── */
const MealContent = ({ day, mealType, meal, onDeleteClick, onReplaceClick, onPortionChange }) => {
  if (!meal) return <p className="text-xs text-gray-400 px-1 py-2">No data available.</p>;

  return (
    <div className="space-y-4 px-1 pb-1">
      {/* Macros */}
      <div className="flex gap-2">
        <MacroTile label="Protein" value={`${meal.protein_g}g`} />
        <MacroTile label="Carbs"   value={`${meal.carbs_g}g`} />
        <MacroTile label="Fats"    value={`${meal.fats_g}g`} />
        <MacroTile label="Kcal"    value={meal.calories} />
      </div>

      {/* Ingredients */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">
          Ingredients
        </p>
        <div className="space-y-1.5">
          {meal.ingredients?.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 group transition-colors hover:bg-orange-100/60"
            >
              <span className="text-sm text-black">{item}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-orange-500 hover:bg-orange-200"
                  onClick={() => onReplaceClick(day, mealType, i, item)}
                >
                  <RefreshCw size={11} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-400 hover:bg-red-100"
                  onClick={() => onDeleteClick(day, mealType, i, item)}
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portions */}
      {Object.keys(meal.portion_sizes || {}).length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">
            Portions
          </p>
          <div className="space-y-2">
            {Object.entries(meal.portion_sizes).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-600 capitalize flex-1">{key}</span>
                <Input
                  value={value}
                  onChange={(e) => onPortionChange(day, mealType, key, e.target.value)}
                  className="h-7 w-20 text-xs text-right shrink-0 border-orange-200 focus-visible:ring-orange-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────────── */
const DietView = () => {
  const navigate = useNavigate();
  const { currentPlan } = useSelector((state) => state.diet);
  const [plan, setPlan] = useState(currentPlan?.plan);

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceName, setReplaceName]     = useState("");

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <div className="text-center space-y-3">
          <p className="text-black font-medium">No plan selected</p>
          <Button onClick={() => navigate(-1)} className="bg-orange-500 hover:bg-orange-600 text-white">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const openDeleteDialog  = (day, mealType, i, name) => setDeleteTarget({ day, mealType, itemIndex: i, itemName: name });
  const openReplaceDialog = (day, mealType, i, name) => { setReplaceTarget({ day, mealType, itemIndex: i, itemName: name }); setReplaceName(""); };

  const confirmDelete = () => {
    const { day, mealType, itemIndex } = deleteTarget;
    const updated = structuredClone(plan);
    updated.weekly_plan[day][mealType].ingredients.splice(itemIndex, 1);
    setPlan(updated);
    setDeleteTarget(null);
  };

  const confirmReplace = () => {
    if (!replaceName.trim()) return;
    const { day, mealType, itemIndex } = replaceTarget;
    const updated = structuredClone(plan);
    updated.weekly_plan[day][mealType].ingredients[itemIndex] = replaceName.trim();
    setPlan(updated);
    setReplaceTarget(null);
  };

  const goToAlternatives = () => {
    navigate("/user/alternatives", {
      state: { foodItem: replaceTarget.itemName, replaceContext: { day: replaceTarget.day, mealType: replaceTarget.mealType, itemIndex: replaceTarget.itemIndex } },
    });
    setReplaceTarget(null);
  };

  const handlePortionChange = (day, mealType, key, value) => {
    const updated = structuredClone(plan);
    updated.weekly_plan[day][mealType].portion_sizes[key] = value;
    setPlan(updated);
  };

  const days = Object.entries(plan.weekly_plan);

  return (
    <div className="min-h-screen bg-orange-50 px-5 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-black">Weekly Diet Plan</h1>
          <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs rounded-full">
            {days.length} days
          </Badge>
        </div>

        {/* Outer accordion — days */}
        <Accordion type="multiple" className="space-y-3">
          {days.map(([day, meals]) => {
            const totalKcal = MEALS.reduce((s, m) => s + (meals[m]?.calories || 0), 0);

            return (
              <AccordionItem
                key={day}
                value={day}
                className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-none"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-orange-50/60 transition-colors group [&>svg]:hidden">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {/* Colored dot */}
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400 group-data-[state=open]:bg-orange-600 transition-colors" />
                      <span className="text-base font-semibold text-black capitalize">{day}</span>
                    </div>
                    <div className="flex items-center gap-3 mr-1">
                      <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                        <Flame size={12} />
                        {totalKcal} kcal
                      </span>
                      {/* Custom chevron */}
                      <svg
                        className="w-4 h-4 text-orange-300 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  {/* Inner accordion — meals */}
                  <Accordion type="multiple" className="space-y-2 pt-2">
                    {MEALS.map((mealType) => {
                      const meal = meals[mealType];
                      const cfg  = MEAL_CONFIG[mealType];

                      return (
                        <AccordionItem
                          key={mealType}
                          value={mealType}
                          className="border border-orange-100 rounded-xl overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-orange-50 transition-colors group [&>svg]:hidden">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                {/* Meal icon badge */}
                                <span className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                                  {cfg.short}
                                </span>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-black leading-tight">{cfg.label}</p>
                                  {meal?.name && (
                                    <p className="text-xs text-orange-600 leading-tight mt-0.5 truncate max-w-[200px]">
                                      {meal.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mr-1">
                                {meal?.calories && (
                                  <span className="text-[11px] font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                                    {meal.calories} kcal
                                  </span>
                                )}
                                <svg
                                  className="w-3.5 h-3.5 text-orange-300 transition-transform duration-200 group-data-[state=open]:rotate-180"
                                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="px-4 pt-3 pb-2 bg-white">
                            <MealContent
                              day={day}
                              mealType={mealType}
                              meal={meal}
                              onDeleteClick={openDeleteDialog}
                              onReplaceClick={openReplaceDialog}
                              onPortionChange={handlePortionChange}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Remove ingredient?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-black">"{deleteTarget?.itemName}"</span> will be permanently removed from your plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Dialog */}
      <Dialog open={!!replaceTarget} onOpenChange={(o) => !o && setReplaceTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Replace ingredient</DialogTitle>
            <DialogDescription>
              Replacing <span className="font-semibold text-black">"{replaceTarget?.itemName}"</span>. Type a replacement or browse AI suggestions.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. Greek yogurt"
            value={replaceName}
            onChange={(e) => setReplaceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmReplace()}
            className="border-orange-200 focus-visible:ring-orange-400"
          />
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" onClick={goToAlternatives}>
              Browse alternatives
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled={!replaceName.trim()} onClick={confirmReplace}>
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DietView;