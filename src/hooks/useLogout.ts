"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/store";

export function useLogout() {
  const router = useRouter();

  const logoutUser = async () => {
    const { logout } = useAuthStore.getState();

    await supabase.auth.signOut();       // Cierra sesión en Supabase
    logout();                            // Limpia Zustand + localStorage
    router.push("/");               // Redirige
  };

  return logoutUser;
}
