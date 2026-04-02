"use client";
import { configureStore } from "@reduxjs/toolkit";
//import AsyncStorage from "@react-native-async-storage/async-storage";
//import storage from "redux-persist/lib/storage";
import { rootReducer } from "./store";
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import {
  clearStoredAuthTokens,
  setStoredAuthTokens,
} from "@/utils/authStorage";

export function createPersistStore() {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return {
      getItem() {
        return Promise.resolve(null);
      },
      setItem() {
        return Promise.resolve();
      },
      removeItem() {
        return Promise.resolve();
      },
    };
  }
  return createWebStorage("local");
}
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createPersistStore();

const userAuthTransform = createTransform(
  (inboundState: any) => {
    if (!inboundState) {
      return inboundState;
    }

    const { token, refreshToken, ...rest } = inboundState;
    return rest;
  },
  (outboundState: any) => outboundState,
  { whitelist: ["userReducer"] }
);

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["userReducer", "customizer"],
  transforms: [userAuthTransform],
};
const persistedReducer = persistReducer(persistConfig as any, rootReducer as any);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

let previousToken = "";
let previousRefreshToken = "";

store.subscribe(() => {
  const state: any = store.getState();
  const currentToken = state?.userReducer?.token || "";
  const currentRefreshToken = state?.userReducer?.refreshToken || "";

  if (
    currentToken === previousToken &&
    currentRefreshToken === previousRefreshToken
  ) {
    return;
  }

  previousToken = currentToken;
  previousRefreshToken = currentRefreshToken;

  if (!currentToken && !currentRefreshToken) {
    clearStoredAuthTokens();
    return;
  }

  setStoredAuthTokens(currentToken, currentRefreshToken);
});

