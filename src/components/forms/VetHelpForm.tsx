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

type VetHelpFormProps = {
  onSuccess: (data: any) => void;
  pets?: any[]; // pass pets as prop if needed
};

export default function VetHelpForm({ onSuccess, pets = [] }: VetHelpFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { getCurrentPosition, position, loading } = useGeoLocation();

  // Define form schema
  const vetHelpSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
    location: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().min(1, "Localização é obrigatória")
    }),
    targetAmount: z.coerce.number().min(1, "Valor é obrigatório"),
    petId: z.coerce.number().optional(),
    photos: z.array(z.string()),
    status: z.string()
  });

  // Initialize form
  const form = useForm<z.infer<typeof vetHelpSchema>>({
    resolver: zodResolver(vetHelpSchema),
    defaultValues: {
      title: "",
      description: "",
      location: {
        address: ""
      },
      targetAmount: 0,
      petId: undefined,
      photos: [],
      status: "pending"
    }
  });

  // Use location when available
  if (position && !form.getValues().location.address) {
    form.setValue("location", {
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
      // Demo: create data URL
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

  const onSubmit = (data: z.infer<typeof vetHelpSchema>) => {
    setIsPending(true);

    // If no photo was provided, add a default one
    if (data.photos.length === 0) {
      data.photos = ["https://pixabay.com/get/g3f192631675023c15dcff2dd2be76dd7363861a4652855d73b8c3184fb64562d1417b91b73ea9e88d8b249fba34d7b82e15285e62c33ca89ffeec185da7e9b75_1280.jpg"];
    }

    // Simulate local-only submit
    setTimeout(() => {
      setIsPending(false);
      onSuccess(data);
    }, 500);
  };

  // Format currency input
  const formatCurrency = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Convert to number and format
    const amount = parseInt(digits) || 0;
    return amount;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Solicitar Ajuda Veterinária</h3>
      
      <div>
        <Label htmlFor="vet-help-photo" className="block text-sm font-medium text-neutral-700 mb-1">
          Foto do Animal
        </Label>
        <div 
          className="border-2 border-dashed border-neutral-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => document.getElementById('vet-help-photo')?.click()}
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
            id="vet-help-photo" 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Cirurgia urgente para gato atropelado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {pets.length > 0 && (
            <FormField
              control={form.control}
              name="petId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione o Pet (opcional)</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => field.onChange(parseInt(value) || undefined)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pet cadastrado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pets.map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          {pet.name || `${pet.type} ${pet.color}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização</FormLabel>
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
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor necessário (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 1000" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(formatCurrency(e.target.value));
                    }}
                  />
                </FormControl>
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
                    placeholder="Descreva o caso, o que aconteceu com o animal, que tipo de ajuda é necessária, etc."
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