import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/diet";
const ALT_API = "http://localhost:5000/api/alternatives";

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const generateDiet = createAsyncThunk(
  "diet/generate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/generate`, data, { withCredentials: true });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchDietHistory = createAsyncThunk(
  "diet/history",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/history`, { withCredentials: true });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchAlternatives = createAsyncThunk(
  "diet/alternatives",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${ALT_API}/suggest`, payload, { withCredentials: true });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateMeal = createAsyncThunk(
  "diet/updateMeal",
  async ({ planId, day, mealType, newMeal }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/update-meal`,
        { day, mealType, newMeal },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const replaceItem = createAsyncThunk(
  "diet/replaceItem",
  async ({ planId, day, mealType, oldItem, newItem }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/replace-item`,
        { day, mealType, oldItem, newItem },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const removeItem = createAsyncThunk(
  "diet/removeItem",
  async ({ planId, day, mealType, item }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/remove-item`,
        { day, mealType, item },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const addSnack = createAsyncThunk(
  "diet/addSnack",
  async ({ planId, day, snack }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/add-snack`,
        { day, snack },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const deleteDietPlan = createAsyncThunk(
  "diet/delete",
  async (planId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/${planId}`, { withCredentials: true });
      return planId;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ─── PROGRESS TRACKING THUNKS ─────────────────────────────────────────────────

export const toggleMealCompletion = createAsyncThunk(
  "diet/toggleMealCompletion",
  async ({ planId, day, mealType, actualCalories, notes }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/progress/toggle-meal`,
        { day, mealType, actualCalories, notes },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateMealProgress = createAsyncThunk(
  "diet/updateMealProgress",
  async ({ planId, day, mealType, actualCalories, notes, completed }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/progress/update-meal`,
        { day, mealType, actualCalories, notes, completed },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateDayProgress = createAsyncThunk(
  "diet/updateDayProgress",
  async ({ planId, day, actualWaterIntake, dailyNotes }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API}/${planId}/progress/update-day`,
        { day, actualWaterIntake, dailyNotes },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchProgressStats = createAsyncThunk(
  "diet/fetchProgressStats",
  async (planId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/${planId}/progress/stats`, { withCredentials: true });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const dietSlice = createSlice({
  name: "diet",
  initialState: {
    plans: [],
    currentPlan: null,
    alternatives: [],
    alternativesOriginal: null,
    progressStats: null,
    loading: false,
    altLoading: false,
    progressLoading: false,
    error: null,
  },
  reducers: {
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },
    clearAlternatives: (state) => {
      state.alternatives = [];
      state.alternativesOriginal = null;
    },
    updateCurrentPlanLocally: (state, action) => {
      state.currentPlan = action.payload;
      const idx = state.plans.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.plans[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // generate
      .addCase(generateDiet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(generateDiet.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
        state.plans.unshift(action.payload);
      })
      .addCase(generateDiet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // history
      .addCase(fetchDietHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchDietHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchDietHistory.rejected, (state) => { state.loading = false; })
      // alternatives
      .addCase(fetchAlternatives.pending, (state) => { state.altLoading = true; })
      .addCase(fetchAlternatives.fulfilled, (state, action) => {
        state.altLoading = false;
        state.alternatives = action.payload?.alternatives || [];
        state.alternativesOriginal = action.payload?.original_food || null;
      })
      .addCase(fetchAlternatives.rejected, (state) => { state.altLoading = false; })
      // mutations — sync currentPlan & plans list
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(replaceItem.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(addSnack.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      // delete
      .addCase(deleteDietPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p._id !== action.payload);
        if (state.currentPlan?._id === action.payload) state.currentPlan = null;
      })
      // Progress tracking
      .addCase(toggleMealCompletion.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(updateMealProgress.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(updateDayProgress.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(fetchProgressStats.pending, (state) => { state.progressLoading = true; })
      .addCase(fetchProgressStats.fulfilled, (state, action) => {
        state.progressLoading = false;
        state.progressStats = action.payload;
      })
      .addCase(fetchProgressStats.rejected, (state) => { state.progressLoading = false; });
  },
});

export const { setCurrentPlan, clearAlternatives, updateCurrentPlanLocally } = dietSlice.actions;
export default dietSlice.reducer;