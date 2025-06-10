import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGeoLocation } from "@/hooks/useGeoLocation";

type PetFormProps = {
  type: "lost" | "found" | "adoption";
  onSuccess: (data: any) => void;
};

export default function PetForm({ type, onSuccess }: PetFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { getCurrentPosition, position, loading } = useGeoLocation();

  // Define form schema based on pet type
  const petSchema = z.object({
    name: type === "found" ? z.string().optional() : z.string().min(1, "Nome do pet é obrigatório"),
    type: z.string().min(1, "Tipo de pet é obrigatório"),
    breed: z.string().optional(),
    color: z.string().min(1, "Cor do pet é obrigatório"),
    size: z.string().min(1, "Porte do pet é obrigatório"),
    description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
    lastLocation: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().min(1, "Localização é obrigatória")
    }),
    behavior: z.string().optional(),
    photos: z.array(z.string()),
    status: z.string()
  });

  // Initialize form
  const form = useForm<z.infer<typeof petSchema>>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      type: "dog",
      breed: "",
      color: "",
      size: "medium",
      description: "",
      lastLocation: {
        address: ""
      },
      behavior: "",
      photos: [],
      status: type
    }
  });

  // Use location when available
  if (position && !form.getValues().lastLocation.address) {
    form.setValue("lastLocation", {
      lat: position.lat,
      lng: position.lng,
      address: position.address || ""
    });
  }

  const [isPending, setIsPending] = useState(false);

  const handleLocationUpdate = () => {
    getCurrentPosition();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoPreview(result);

        // Update form value (simulated URL for demo)
        const photos = form.getValues().photos || [];
        form.setValue("photos", [...photos, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: z.infer<typeof petSchema>) => {
    setIsPending(true);

    // If no photo was provided, add a default one
    if (data.photos.length === 0) {
      data.photos = [
        "https://images.unsplash.com/photo-1583512603834-01a3a1e56241"
      ];
    }

    // Simulate local success
    setTimeout(() => {
      setIsPending(false);
      onSuccess(data);
    }, 500);
  };

  const getFormTitle = () => {
    switch (type) {
      case "lost":
        return "Reportar Pet Perdido";
      case "found":
        return "Reportar Pet Encontrado";
      case "adoption":
        return "Cadastrar Pet para Adoção";
      default:
        return "Cadastro de Pet";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{getFormTitle()}</h3>

      <div>
        <Label htmlFor="pet-photo" className="block text-sm font-medium text-neutral-700 mb-1">
          Foto do Pet
        </Label>
        <div 
          className="border-2 border-dashed border-neutral-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => document.getElementById('pet-photo')?.click()}
        >
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt="Preview" 
              className="h-40 w-auto object-contain"
            />
          ) : (
            <>
              <span className="material-icons text-4xl text-neutral-400">add_photo_alternate</span>
              <span className="text-sm text-neutral-500 mt-2">Clique para adicionar foto</span>
            </>
          )}
          <input 
            type="file" 
            id="pet-photo" 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {type !== "found" && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Pet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dog">Cachorro</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Golden Retriever" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Dourado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porte</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="lastLocation.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{type === "lost" ? "Última localização" : "Localização"}</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input 
                      placeholder="Ex: Av. Paulista, 1000" 
                      {...field} 
                      className="rounded-r-none"
                    />
                  </FormControl>
                  <Button 
                    type="button"
                    className="rounded-l-none"
                    onClick={handleLocationUpdate}
                    disabled={loading}
                  >
                    <span className="material-icons text-neutral-600">my_location</span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={
                      type === "lost" 
                        ? "Descreva características importantes, comportamento e quando/como o pet se perdeu" 
                        : type === "found"
                        ? "Descreva onde encontrou o pet, seu comportamento e características marcantes"
                        : "Descreva o comportamento do pet, necessidades especiais e requisitos para adoção"
                    }
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <span className="animate-spin mr-2">
                <span className="material-icons">refresh</span>
              </span>
            ) : null}
            Publicar
          </Button>
        </form>
      </Form>
    </div>
  );
}