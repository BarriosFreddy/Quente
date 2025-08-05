import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/ApiService";
export const getDashboardStats = createAsyncThunk(
  "dashboard/getStats",
  async (startDate, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(
        `/dashboard?startDate=${startDate}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
