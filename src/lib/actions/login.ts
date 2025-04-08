"use server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";
import { useAuthStore } from "@/lib/store/store";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginUser(formData: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  const data = {
    email: formData.email,
    password: formData.password,
  };

  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { success: false, error: "Error al iniciar sesión" };
  }

  if (!session || !session.user) {
    return {
      success: false,
      error: "No se pudo obtener la sesión del usuario",
    };
  }

  const supabaseUser = session.user;

  // 🔍 Obtener perfil_usuarios relacionado al user.id
  const { data: perfil, error: perfilError } = await supabase
    .from("perfil_usuarios")
    .select("*")
    .eq("id", supabaseUser.id)
    .single();

  if (perfilError || !perfil) {
    return { success: false, error: "No se encontró el perfil del usuario" };
  }

  // 🔍 Obtener peluqueria user.id
  const { data: peluqueria, error: peluqueriaError } = await supabase
    .from("peluquerias")
    .select("*")
    .eq("id", perfil.peluqueria_id)
    .single();

  console.log(perfil);
  console.log(peluqueria);

  if (peluqueriaError || !peluqueria) {
    return { success: false, error: "No se encontró peluqueria del usuario" };
  }

  const user: User = {
    id: session.user.id,
    email: session.user.email,
    token: session.session?.access_token,
    ...perfil,
    peluqueria: peluqueria.nombre
  };

  return { success: true, user };
}


export async function logoutUser() {
  const { logout } = useAuthStore.getState();

  await supabase.auth.signOut(); // 🔐 Cierra sesión en Supabase

  logout(); // 🧠 Limpia Zustand + LocalStorage
}