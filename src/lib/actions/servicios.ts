/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Servicio } from "@/types/servicios";
import api from "../axios-custom";

export const crearServicio = async (data: Omit<Servicio, "id">) => {
  const response = await api.post("/servicios", data);
  return response.data;
};

export const actualizarServicio = async (id: string, data:  Omit<Servicio, "id">) => {
  try {
    const response = await api.patch(`/servicios/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error al actualizar servicio:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const eliminarServicio = async (id: string) => {
  const response = await api.delete(`/servicios/${id}`);
  return response.data;
};

export const obtenerServicios = async (): Promise<Servicio[]> => {
  const response = await api.get("/servicios");
  return response.data;
};
