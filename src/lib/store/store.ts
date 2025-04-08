import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "@/types/user";
import CryptoJS from "crypto-js";

const SECRET_KEY = "85eew2_'9*//";

type AuthState = {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem("auth-storage");
      },      
    }),
    {
      name: "auth-storage",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => ({
              getItem: (name) => {
                const encrypted = localStorage.getItem(name);
                if (!encrypted) return null;

                try {
                  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
                  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                  return JSON.parse(decrypted);
                } catch (error) {
                  console.error("Error al desencriptar:", error);
                  return null;
                }
              },
              setItem: (name, value) => {
                const stringified = JSON.stringify(value);
                const encrypted = CryptoJS.AES.encrypt(
                  stringified,
                  SECRET_KEY
                ).toString();
                localStorage.setItem(name, encrypted);
              },
              removeItem: (name) => localStorage.removeItem(name),
            }))
          : undefined, 
      onRehydrateStorage: () => () => {
        setTimeout(() => {
          useAuthStore.setState({ hydrated: true });
        }, 0);
      },
    }
  )
);
