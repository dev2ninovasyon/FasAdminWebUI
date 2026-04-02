"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { setRefreshToken, setToken } from "@/store/user/UserSlice";
import {
  getStoredAuthTokens,
  sanitizePersistedAuthState,
  setStoredAuthTokens,
} from "@/utils/authStorage";

export default function AuthSessionBootstrap() {
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.userReducer);

  useEffect(() => {
    sanitizePersistedAuthState();

    const storedTokens = getStoredAuthTokens();
    const effectiveToken = storedTokens.token || user.token || "";
    const effectiveRefreshToken =
      storedTokens.refreshToken || user.refreshToken || "";

    if (
      effectiveToken &&
      (effectiveToken !== storedTokens.token ||
        effectiveRefreshToken !== storedTokens.refreshToken)
    ) {
      setStoredAuthTokens(effectiveToken, effectiveRefreshToken);
    }

    if (effectiveToken !== (user.token || "")) {
      dispatch(setToken(effectiveToken));
    }

    if (effectiveRefreshToken !== (user.refreshToken || "")) {
      dispatch(setRefreshToken(effectiveRefreshToken));
    }
  }, [dispatch, user.refreshToken, user.token]);

  return null;
}
