/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Esquema de validación para el formulario
const servicioSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().min(5, {
    message: "La descripción debe tener al menos 5 caracteres.",
  }),
  precio: z.coerce.number().positive({
    message: "El precio debe ser un número positivo.",
  }),
  duracion_min: z.coerce.number().int().positive({
    message: "La duración debe ser un número entero positivo.",
  }),
})

type ServicioFormValues = z.infer<typeof servicioSchema>

interface ServicioDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: any) => void
  title: string
  servicio?: {
    id: string
    nombre: string
    descripcion: string
    precio: number
    duracion_min: number
  } | null
}

export function ServicioDrawer({ open, onOpenChange, onSubmit, title, servicio }: ServicioDrawerProps) {
  // Detectar si estamos en móvil para cambiar entre Drawer y Dialog
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Configurar el formulario con react-hook-form y zod
  const form = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: 0,
      duracion_min: 0,
    },
  })

  // Actualizar valores del formulario cuando se edita un servicio existente
  useEffect(() => {
    if (servicio) {
      form.reset({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: servicio.precio,
        duracion_min: servicio.duracion_min,
      })
    } else {
      form.reset({
        nombre: "",
        descripcion: "",
        precio: 0,
        duracion_min: 0,
      })
    }
  }, [servicio, form])

  // Manejar el envío del formulario
  const handleSubmit = (values: ServicioFormValues) => {
    if (servicio) {
      // Si estamos editando, incluir el ID
      onSubmit({ ...values, id: servicio.id })
    } else {
      // Si estamos creando
      onSubmit(values)
    }
    form.reset()
  }

  // Contenido del formulario
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Corte de cabello" {...field} />
              </FormControl>
              <FormDescription>Nombre del servicio que ofreces.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe el servicio..." {...field} rows={3} />
              </FormControl>
              <FormDescription>Una breve descripción del servicio.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duracion_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )

  // Renderizar Drawer en móvil y Dialog en desktop
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Completa el formulario para {servicio ? "actualizar" : "crear"} un servicio.
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter className="pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
              {servicio ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            Completa el formulario para {servicio ? "actualizar" : "crear"} un servicio.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2">{formContent}</div>
        <DrawerFooter className="pt-2">
          <Button onClick={form.handleSubmit(handleSubmit)}>{servicio ? "Actualizar" : "Crear"}</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
