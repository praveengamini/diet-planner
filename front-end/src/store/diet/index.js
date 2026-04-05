import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/diet";

export const generateDiet = createAsyncThunk(
  "diet/generate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/generate`, data, {
        withCredentials: true,
      });
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
      const res = await axios.get(`${API}/history`, {
        withCredentials: true,
      });
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
      const res = await axios.post(
        "http://localhost:5000/api/alternatives/suggest",
        payload,
        { withCredentials: true }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
const dietSlice = createSlice({
  name: "diet",
 initialState: {
  plans: [],
  currentPlan: null,
  alternatives: [],
  loading: false,
},
  reducers: {
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateDiet.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateDiet.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(fetchDietHistory.fulfilled, (state, action) => {
        state.plans = action.payload;
      }).addCase(fetchAlternatives.fulfilled, (state, action) => {
  state.alternatives = action.payload.alternatives;
});
  },
});

export const { setCurrentPlan } = dietSlice.actions;
export default dietSlice.reducer;