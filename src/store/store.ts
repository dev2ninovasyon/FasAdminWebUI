import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import CustomizerReducer from "./customizer/CustomizerSlice";
import UserReducer from "./user/UserSlice";
import DynamicMenuReducer from "./dynamicMenu/DynamicMenuSlice";

export const store = configureStore({
  reducer: {
    customizer: CustomizerReducer,
    userReducer: UserReducer,
    dynamicMenu: DynamicMenuReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export const rootReducer = combineReducers({
  customizer: CustomizerReducer,
  userReducer: UserReducer,
  dynamicMenu: DynamicMenuReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof rootReducer>;

