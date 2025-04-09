"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { startTransition, useEffect, useOptimistic, useState } from "react";
import { Servicio, ServicioInput } from "@/types/servicios";
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  obtenerServicios,
} from "@/lib/actions/servicios";
import { ServicioDrawer } from "./components/servicio-drawer";
import { useAuthStore } from "@/lib/store/store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ServiciosView() {
  const { user } = useAuthStore();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [optimisticServicios, addOptimisticServicio] = useOptimistic(
    servicios,
    (state, updated: Servicio) =>
      state.map((s) => (s.id === updated.id ? updated : s))
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentServicio, setCurrentServicio] = useState<Servicio | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchServicios() {
      const data = await obtenerServicios();
      setServicios(data);
    }
    fetchServicios();
  }, []);

  // Filtrar servicios basados en el término de búsqueda
  const filteredServicios = optimisticServicios.filter(
    (servicio) =>
      servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para crear un nuevo servicio
  const handleCreate = async (servicio: ServicioInput) => {
    const tempId = Date.now().toString();
    const nuevoServicio: Servicio = { ...servicio, id: tempId };
    // Actualizamos la UI inmediatamente
    startTransition(() => {
      addOptimisticServicio(nuevoServicio);
    });
    
    try {
      console.log(servicio);
      const nuevoSave: ServicioInput = {
        ...servicio,
        peluqueria_id: Number(user?.peluqueria_id),
      };

      const creado = await crearServicio(nuevoSave);
      setServicios((prev) => [...prev, creado]);
    } catch (error) {
      console.error("Error al crear", error);
      setServicios((prev) => prev.filter((s) => s.id !== tempId));
    }
    setIsCreateOpen(false);
  };

  // Función para actualizar un servicio existente
  const handleUpdate = async (updatedServicio: Servicio) => {
    const { id, ...resto } = updatedServicio;

    addOptimisticServicio(updatedServicio);
    setIsEditOpen(false);
    setCurrentServicio(null);

    try {
      const nuevoSave: ServicioInput = {
        ...resto,
        peluqueria_id: Number(user?.peluqueria_id),
      };
      await actualizarServicio(id, nuevoSave);

      setServicios((prev) =>
        prev.map((servicio) =>
          servicio.id === updatedServicio.id ? updatedServicio : servicio
        )
      );
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  // Función para eliminar un servicio
  const handleDelete = async (id: string) => {
    setServicios((prev) => prev.filter((s) => s.id !== id));

    try {
      await eliminarServicio(id);
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // Función para abrir el drawer de edición
  const openEditDrawer = (servicio: Servicio) => {
    setCurrentServicio(servicio);
    setIsEditOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>
              <h2 className="text-2xl font-bold">Servicios</h2>
            </CardTitle>
            <CardDescription>
              Administra los servicios ofrecidos por tu barbería
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Descripción
                  </TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Duración (min)
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServicios.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No se encontraron servicios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServicios.map((servicio) => (
                    <TableRow key={servicio.id}>
                      <TableCell className="font-medium">
                        {servicio.nombre}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {servicio.descripcion}
                      </TableCell>
                      <TableCell>${servicio.precio}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {servicio.duracion_min}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDrawer(servicio)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setServicioAEliminar(servicio)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {servicioAEliminar && (
        <ConfirmDialog
          title="¿Eliminar servicio?"
          description="Esta acción eliminará el servicio permanentemente."
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => {
            handleDelete(servicioAEliminar.id);
            setServicioAEliminar(null);
          }}
          onCancel={() => setServicioAEliminar(null)}
          open={!!servicioAEliminar}
        />
      )}

      <ServicioDrawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        title="Crear Nuevo Servicio"
      />

      {isEditOpen && currentServicio && (
        <ServicioDrawer
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleUpdate}
          title="Editar Servicio"
          servicio={currentServicio}
        />
      )}
    </div>
  );
}
