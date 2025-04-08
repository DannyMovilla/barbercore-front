"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { useAuthStore } from "@/lib/store/store";

export function useAuth() {
  const { user, hydrated } = useAuthStore();
  const [userData, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    console.log(user)
    setUser(user);
    setLoading(false);
  }, [hydrated,user]);

  return { userData, loading };
}
