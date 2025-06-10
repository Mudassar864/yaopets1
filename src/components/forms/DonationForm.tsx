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

type DonationFormProps = {
  onSuccess: (donation: any) => void;
};

export default function DonationForm({ onSuccess }: DonationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { getCurrentPosition, position, loading } = useGeoLocation();

  // Define form schema
  const donationSchema = z.object({
    type: z.string().min(1, "Tipo de doação é obrigatório"),
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
    location: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().min(1, "Localização é obrigatória")
    }),
    photos: z.array(z.string())
  });

  // Initialize form
  const form = useForm<z.infer<typeof donationSchema>>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      type: "food",
      title: "",
      description: "",
      location: {
        address: ""
      },
      photos: []
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

  const handleLocationUpdate = () => {
    getCurrentPosition();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a storage service
      // For this demo, we'll create a data URL
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

  const [isPending, setIsPending] = useState(false);

  const onSubmit = (data: z.infer<typeof donationSchema>) => {
    setIsPending(true);

    // If no photo was provided, add a default one
    if (data.photos.length === 0) {
      if (data.type === "pet") {
        data.photos = ["https://images.unsplash.com/photo-1529429617124-95b109e86bb8"];
      } else {
        data.photos = ["https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd"];
      }
    }

    // Simulate local success
    setTimeout(() => {
      setIsPending(false);
      onSuccess(data);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Cadastrar Doação</h3>

      <div>
        <Label htmlFor="donation-photo" className="block text-sm font-medium text-neutral-700 mb-1">
          Foto do Item
        </Label>
        <div
          className="border-2 border-dashed border-neutral-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => document.getElementById('donation-photo')?.click()}
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
            id="donation-photo"
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Doação</FormLabel>
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
                    <SelectItem value="pet">Animal para adoção</SelectItem>
                    <SelectItem value="food">Ração</SelectItem>
                    <SelectItem value="toy">Brinquedos</SelectItem>
                    <SelectItem value="accessory">Acessórios</SelectItem>
                    <SelectItem value="medicine">Medicamentos</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ração para cães filhotes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização para retirada</FormLabel>
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
                    placeholder="Descreva os itens que está doando, quantidade, condições, etc."
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