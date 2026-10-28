"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import AuthLogin from "./auth/authForms/AuthLogin";
import AuthPageShell from "./auth/AuthPageShell";

export default function Page() {
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  useEffect(() => {
    if (user?.token) {
      router.push("/Anasayfa");
    }
  }, [user?.token, router]);

  useEffect(() => {
    router.prefetch("/Anasayfa");
  }, [router]);

  return (
    <AuthPageShell
      title="Hos Geldiniz"
      description="Devam etmek icin lutfen giris yapin. Admin"
      pageTitle="Giris"
      pageDescription="Giris Yap"
    >
      <AuthLogin />
    </AuthPageShell>
  );
}

Page.layout = "Blank";
