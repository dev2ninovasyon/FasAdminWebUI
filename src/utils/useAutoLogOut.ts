import { useDispatch, useSelector } from "@/store/hooks";
import { resetToNull, setToken } from "@/store/user/UserSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { AppState } from "@/store/store";
import { url } from "@/api/apiBase";

const STORAGE_KEY = "user";
const TIMEOUT_KEY = "user_expiry";

export default function useAutoLogout(
  idleTimeout: number = 45 * 60 * 1000, // kullanıcı inaktifse logout süresi
  refreshInterval: number = 40 * 60 * 1000 // token yenileme süresi
) {
  const dispatch = useDispatch();
  const router = useRouter();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
    dispatch(resetToNull(""));
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, [router, dispatch]);

  // idle timer reset
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    const expiry = Date.now() + idleTimeout;
    localStorage.setItem(TIMEOUT_KEY, expiry.toString());
    idleTimerRef.current = setTimeout(logout, idleTimeout);
  }, [logout, idleTimeout]);

  // refresh token
  const refreshToken = useCallback(async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${url}/Auth/refresh`, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: user.token || "" }),
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(setToken(data.token));
        console.log("Refresh token yenilendi");
      }
    } catch (err) {
      console.error("Refresh token yenilenemedi:", err);
      logout();
    }
  }, [user, logout]);

  useEffect(() => {
    if (!user?.token) return;

    // event listener sadece idle timer için
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    // refresh interval kullanıcı aktif değilse de çalışacak
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, []);

  return null;
}
