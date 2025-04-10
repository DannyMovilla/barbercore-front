"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/user";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { UsuarioDrawer } from "./components/usuario-drawer";
import { obtenerUsuarios } from "@/lib/actions/users";
import { useAuthStore } from "@/lib/store/store";

export function UsuariosView() {
  const { user } = useAuthStore();

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("todos");

  useEffect(() => {
    async function fetchServicios() {
      const data = await obtenerUsuarios(user?.peluqueria_id ?? "");
      setUsuarios(data);
    }
    fetchServicios();
  }, [user?.peluqueria_id]);

  // Filtrar usuarios basados en el término de búsqueda y la pestaña activa
  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!usuario) return false;

    const coincideRol = activeTab === "todos" || usuario.rol === activeTab;

    const coincideBusqueda =
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.telefono?.includes(searchTerm);

    return coincideRol && coincideBusqueda;
  });

  // Función para crear un nuevo usuario
  const handleCreate = (usuario: Omit<User, "id" | "fechaRegistro">) => {
    const newUsuario = {
      ...usuario,
      id: Date.now().toString(),
      fechaRegistro: new Date(),
      // Aseguramos que los clientes no tengan contraseña almacenada
      password: usuario.rol === "cliente" ? undefined : usuario.password,
    };
    setUsuarios([...usuarios, newUsuario]);
    setIsCreateOpen(false);
  };

  // Función para actualizar un usuario existente
  const handleUpdate = (updatedUsuario: User) => {
    // Si el rol cambia a cliente, eliminamos la contraseña
    if (updatedUsuario.rol === "cliente") {
      updatedUsuario.password = undefined;
    }

    setUsuarios(
      usuarios.map((u) => (u.id === updatedUsuario.id ? updatedUsuario : u))
    );
    setIsEditOpen(false);
    setCurrentUsuario(null);
  };

  // Función para eliminar un usuario
  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  // Función para abrir el drawer de edición
  const openEditDrawer = (usuario: User) => {
    setCurrentUsuario(usuario);
    setIsEditOpen(true);
  };

  // Obtener las iniciales del nombre para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Obtener color de badge según el rol
  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case "admin":
        return "destructive";
      case "barbero":
        return "default";
      case "cliente":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Contar usuarios por rol
  const countByRole = {
    todos: usuarios.length,
    cliente: usuarios.filter((u) => u.rol === "cliente").length,
    barbero: usuarios.filter((u) => u.rol === "barbero").length,
    admin: usuarios.filter((u) => u.rol === "admin").length,
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>
              <h2 className="text-2xl font-bold">Usuarios</h2>
            </CardTitle>
            <CardDescription>
              Administra los usuarios de tu barbería
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Tabs
              defaultValue="todos"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="todos">
                  Todos
                  <Badge variant="outline" className="ml-2">
                    {countByRole.todos}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="cliente">
                  Clientes
                  <Badge variant="outline" className="ml-2">
                    {countByRole.cliente}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="barbero">
                  Barberos
                  <Badge variant="outline" className="ml-2">
                    {countByRole.barbero}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="admin">
                  Admins
                  <Badge variant="outline" className="ml-2">
                    {countByRole.admin}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[250px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Teléfono
                  </TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Fecha Registro
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario: User) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium">
                              {getInitials(usuario.nombre || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{usuario.nombre}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {usuario.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {usuario.telefono}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(usuario.rol!)}
                          className="capitalize"
                        >
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {usuario.created_at && new Date(usuario.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDrawer(usuario)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(usuario.id!)}
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

      {/* Drawer para crear usuario */}
      <UsuarioDrawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        title="Crear Nuevo Usuario"
      />

      {/* Drawer para editar usuario */}
      {isEditOpen && currentUsuario && (
        <UsuarioDrawer
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleUpdate}
          title="Editar Usuario"
          usuario={
            currentUsuario?.id &&
            currentUsuario?.nombre &&
            currentUsuario?.email &&
            currentUsuario?.telefono &&
            (currentUsuario?.rol === "cliente" ||
              currentUsuario?.rol === "barbero" ||
              currentUsuario?.rol === "admin")
              ? {
                  id: currentUsuario.id,
                  nombre: currentUsuario.nombre,
                  email: currentUsuario.email,
                  telefono: currentUsuario.telefono,
                  rol: currentUsuario.rol,
                }
              : null
          }
        />
      )}
    </div>
  );
}
