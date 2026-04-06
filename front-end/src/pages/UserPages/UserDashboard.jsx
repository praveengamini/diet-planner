import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDietHistory, setCurrentPlan } from "../../store/diet";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Flame, Droplets, TrendingUp, Calendar, Plus, ChevronRight } from "lucide-react";

const MEALS = ["breakfast", "lunch", "dinner"];

const calcDayKcal = (meals) =>
  MEALS.reduce((s, m) => s + (meals?.[m]?.calories || 0), 0) +
  (meals?.snacks || []).reduce((s, sn) => s + (sn.calories || 0), 0);

const MACRO_COLORS = {
  protein: "#3b82f6",
  carbs: "#f97316",
  fats: "#a855f7",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1 capitalize">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name === "calories" ? " kcal" : "g"}
        </p>
      ))}
    </div>
  );
};

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, loading } = useSelector((s) => s.diet);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchDietHistory());
  }, []);

  // Most recent plan
  const latestPlan = plans[0] || null;
  const weeklyPlan = latestPlan?.plan?.weekly_plan || {};
  const days = Object.keys(weeklyPlan);

  // Build chart data from latest plan
  const weeklyCaloriesData = useMemo(() =>
    days.map((day) => ({
      day: day.slice(0, 3),
      calories: calcDayKcal(weeklyPlan[day]),
      target: latestPlan?.plan?.daily_calories_target || 0,
    })),
    [weeklyPlan]
  );

  const macroData = useMemo(() =>
    days.map((day) => ({
      day: day.slice(0, 3),
      protein: MEALS.reduce((s, m) => s + (weeklyPlan[day]?.[m]?.protein_g || 0), 0),
      carbs: MEALS.reduce((s, m) => s + (weeklyPlan[day]?.[m]?.carbs_g || 0), 0),
      fats: MEALS.reduce((s, m) => s + (weeklyPlan[day]?.[m]?.fats_g || 0), 0),
    })),
    [weeklyPlan]
  );

  const goalDist = useMemo(() => {
    const counts = {};
    plans.forEach((p) => {
      const g = p.profile?.goal || "maintenance";
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [plans]);

  const GOAL_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7"];

  const avgKcal = useMemo(() => {
    if (!weeklyCaloriesData.length) return 0;
    return Math.round(weeklyCaloriesData.reduce((s, d) => s + d.calories, 0) / weeklyCaloriesData.length);
  }, [weeklyCaloriesData]);

  const adherence = useMemo(() => {
    if (!weeklyCaloriesData.length || !latestPlan?.plan?.daily_calories_target) return 0;
    const target = latestPlan.plan.daily_calories_target;
    const within = weeklyCaloriesData.filter((d) => Math.abs(d.calories - target) / target <= 0.1).length;
    return Math.round((within / weeklyCaloriesData.length) * 100);
  }, [weeklyCaloriesData, latestPlan]);

  if (loading && !plans.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's your nutrition overview</p>
          </div>
          <button
            onClick={() => navigate("/user/diet")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-all"
          >
            <Plus size={18} /> New Plan
          </button>
        </div>

        {/* No plan state */}
        {!latestPlan && (
          <div className="bg-white rounded-3xl border border-dashed border-orange-200 p-12 text-center">
            <div className="text-5xl mb-4">🥗</div>
            <h2 className="text-xl font-black text-gray-800 mb-2">No Plans Yet</h2>
            <p className="text-gray-400 mb-6">Generate your first AI-powered diet plan to see insights here</p>
            <button
              onClick={() => navigate("/user/diet")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              Generate Your First Plan →
            </button>
          </div>
        )}

        {latestPlan && (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KPICard icon={<Flame size={20} className="text-orange-500" />} label="Daily Target" value={latestPlan.plan.daily_calories_target} unit="kcal" bg="orange" />
              <KPICard icon={<TrendingUp size={20} className="text-blue-500" />} label="Avg / Day" value={avgKcal} unit="kcal" bg="blue" />
              <KPICard icon={<Droplets size={20} className="text-sky-500" />} label="Water/Day" value={latestPlan.plan.daily_water_intake_liters} unit="L" bg="sky" />
              <KPICard icon={<Calendar size={20} className="text-green-500" />} label="Total Plans" value={plans.length} unit="plans" bg="green" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Weekly Calories — spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-gray-900">Weekly Calories</h3>
                    <p className="text-xs text-gray-400 mt-0.5">vs daily target</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    adherence >= 70 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {adherence}% on target
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={weeklyCaloriesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="target" stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth={2} fill="none" name="target" />
                    <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} fill="url(#calGrad)" name="calories" dot={{ fill: "#f97316", r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Goal Distribution */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-6">Plan Goals</h3>
                {goalDist.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={goalDist}>
                        <RadialBar dataKey="value" cornerRadius={8}>
                          {goalDist.map((_, i) => (
                            <Cell key={i} fill={GOAL_COLORS[i % GOAL_COLORS.length]} />
                          ))}
                        </RadialBar>
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                      {goalDist.map((g, i) => (
                        <div key={g.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: GOAL_COLORS[i % GOAL_COLORS.length] }} />
                            <span className="text-gray-600 capitalize font-medium">{g.name.replace("_", " ")}</span>
                          </div>
                          <span className="font-bold text-gray-800">{g.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-8 text-sm">No data yet</div>
                )}
              </div>
            </div>

            {/* Macro chart */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-gray-900">Weekly Macros</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Protein · Carbs · Fats (g/day)</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={macroData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs font-bold capitalize text-gray-600">{v}</span>} />
                  <Bar dataKey="protein" fill={MACRO_COLORS.protein} radius={[4, 4, 0, 0]} name="protein" />
                  <Bar dataKey="carbs" fill={MACRO_COLORS.carbs} radius={[4, 4, 0, 0]} name="carbs" />
                  <Bar dataKey="fats" fill={MACRO_COLORS.fats} radius={[4, 4, 0, 0]} name="fats" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Plans */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900">Recent Plans</h3>
                <button
                  onClick={() => navigate("/user/diet/history")}
                  className="text-orange-500 hover:text-orange-600 text-sm font-bold flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {plans.slice(0, 4).map((plan) => {
                  const wp = plan.plan?.weekly_plan || {};
                  const avgCal = Object.keys(wp).length
                    ? Math.round(Object.values(wp).reduce((s, m) => s + calcDayKcal(m), 0) / Object.keys(wp).length)
                    : 0;
                  return (
                    <button
                      key={plan._id}
                      onClick={() => { dispatch(setCurrentPlan(plan)); navigate(`/user/diet/${plan._id}`); }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all text-left"
                    >
                      <div>
                        <div className="font-bold text-gray-800 capitalize">
                          {plan.profile?.goal?.replace("_", " ")} · {plan.dietType}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          &nbsp;·&nbsp;~{avgCal} kcal/day
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const KPICard = ({ icon, label, value, unit, bg }) => {
  const bgs = {
    orange: "from-orange-50 to-amber-50 border-orange-100",
    blue: "from-blue-50 to-indigo-50 border-blue-100",
    sky: "from-sky-50 to-cyan-50 border-sky-100",
    green: "from-green-50 to-emerald-50 border-green-100",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${bgs[bg]}`}>
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span></div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-gray-900">{value ?? "–"}</span>
        <span className="text-xs font-semibold text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

export default UserDashboard;