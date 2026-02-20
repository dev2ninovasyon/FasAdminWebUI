import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DynamicMenuItem {
  id: number;
  name: string;
  parentName?: string;
  children?: DynamicMenuItem[];
  href?: string;
  category?: string;
}

interface DynamicMenuState {
  maddiDogrulamaItems: DynamicMenuItem[];
  loading: boolean;
  error: string | null;
}

const initialState: DynamicMenuState = {
  maddiDogrulamaItems: [],
  loading: false,
  error: null,
};

const DynamicMenuSlice = createSlice({
  name: "dynamicMenu",
  initialState,
  reducers: {
    setMaddiDogrulamaItems: (state, action: PayloadAction<DynamicMenuItem[]>) => {
      state.maddiDogrulamaItems = action.payload;
      state.error = null;
    },
    addMaddiDogrulamaItems: (state, action: PayloadAction<DynamicMenuItem[]>) => {
      state.maddiDogrulamaItems = [...state.maddiDogrulamaItems, ...action.payload];
    },
    clearMaddiDogrulamaItems: (state) => {
      state.maddiDogrulamaItems = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMaddiDogrulamaItems,
  addMaddiDogrulamaItems,
  clearMaddiDogrulamaItems,
  setLoading,
  setError,
} = DynamicMenuSlice.actions;

export default DynamicMenuSlice.reducer;

