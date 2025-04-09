"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/hooks/use-auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userData) {
      router.push("/login"); // Redirige si no está autenticado
    }
  }, [userData, loading, router]);

  if (loading) return  <LoadingSpinner />; // Puedes mejorar esto con un spinner

  return userData ? <>{children}</> : null;
}
