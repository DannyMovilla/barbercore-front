/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Esquema de validación para el formulario
const usuarioSchema = z
  .object({
    nombre: z.string().min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Ingresa un email válido.",
    }),
    telefono: z.string().min(7, {
      message: "Ingresa un número de teléfono válido.",
    }),
    password: z
      .string()
      .min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
      })
      .optional()
      .or(z.literal("")),
    rol: z.enum(["cliente", "barbero", "admin"], {
      message: "Selecciona un rol válido.",
    }),
  })
  .refine(
    (data) => {
      // Si el rol no es cliente, la contraseña es obligatoria para nuevos usuarios
      if (data.rol !== "cliente") {
        return !!data.password;
      }
      return true;
    },
    {
      message: "La contraseña es obligatoria para barberos y administradores",
      path: ["password"],
    }
  );

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface UsuarioDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  title: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    rol: "cliente" | "barbero" | "admin";
  } | null;
}

export function UsuarioDrawer({
  open,
  onOpenChange,
  onSubmit,
  title,
  usuario,
}: UsuarioDrawerProps) {
  // Detectar si estamos en móvil para cambiar entre Drawer y Dialog
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Configurar el formulario con react-hook-form y zod
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      password: "",
      rol: "cliente",
    },
  });

  // Actualizar valores del formulario cuando se edita un usuario existente
  useEffect(() => {
    if (usuario) {
      form.reset({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        password: "", // No mostramos la contraseña actual por seguridad
        rol: usuario.rol,
      });
    } else {
      form.reset({
        nombre: "",
        email: "",
        telefono: "",
        password: "",
        rol: "cliente",
      });
    }
  }, [usuario, form]);

  // Manejar el envío del formulario
  const handleSubmit = (values: UsuarioFormValues) => {
    // Para clientes, aseguramos que la contraseña sea una cadena vacía
    const finalValues = {
      ...values,
      password: values.rol === "cliente" ? "" : values.password,
    };

    if (usuario) {
      // Si estamos editando y no se ingresó una nueva contraseña, mantener la anterior
      if (!finalValues.password && values.rol !== "cliente") {
        const { password: _password, ...restValues } = finalValues;
        onSubmit({
          ...restValues,
          id: usuario.id,
        });
      } else {
        onSubmit({
          ...finalValues,
          id: usuario.id,
        });
      }
    } else {
      // Si estamos creando
      onSubmit(finalValues);
    }
    form.reset();
  };

  // Contenido del formulario
  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 px-2"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("rol") !== "cliente" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
                </FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                {usuario && (
                  <FormDescription>
                    Deja en blanco para mantener la contraseña actual.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="barbero">Barbero</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                El rol determina los permisos del usuario en el sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  // Renderizar Drawer en móvil y Dialog en desktop
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Completa el formulario para {usuario ? "actualizar" : "crear"} un
              usuario.
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter className="pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
              {usuario ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            Completa el formulario para {usuario ? "actualizar" : "crear"} un
            usuario.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2">{formContent}</div>
        <DrawerFooter className="pt-2">
          <Button onClick={form.handleSubmit(handleSubmit)}>
            {usuario ? "Actualizar" : "Crear"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
