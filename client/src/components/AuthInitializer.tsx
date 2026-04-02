"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { setAuth, setAuthLoading } from "../store/slices/authSlice";
import { getMe } from "../services/auth.service";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await getMe();
        if (data && data.success) {
          console.log(
            "[Auth Initializer] Session restored for:",
            data.data._id,
          );
          dispatch(setAuth(data.data));
        } else {
          dispatch(setAuth(null));
        }
      } catch (error) {
        console.log("[Auth Initializer] No active session found or errored");
        dispatch(setAuth(null));
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    verifySession();
  }, [dispatch]);

  return <>{children}</>;
}
