/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { User } from "@/types/user";
import api from "../axios-custom";

export const crearUsuario = async (data: Omit<User, "id">) => {
  const response = await api.post("/usuarios", data);
  return response.data;
};

export const actualizarUsuario = async (id: string, data: Omit<User, "id">) => {
  try {
    const response = await api.patch(`/usuarios/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error al actualizar usuario:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const eliminarUsuario = async (id: string) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

export const obtenerUsuarios = async (id: string) => {
  const response = await api.get(`/usuarios/peluqueria/${id}`);
  return response.data;
};
