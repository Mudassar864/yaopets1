import { useState, useRef } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { PawPrint, ArrowLeft, X } from "lucide-react";

interface PetDonationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: any) => void;
}

export default function PetDonationForm({ open, onOpenChange, onSuccess }: PetDonationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Max size 10MB (for demo only, no toast)
      if (file.size > 10 * 1024 * 1024) return;

      // Type must be image
      if (!file.type.startsWith('image/')) return;

      setSelectedPhoto(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected photo
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Local-only submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Simulate data structure
    const petData = {
      name: formData.get("petName"),
      species: formData.get("petSpecies"),
      size: formData.get("petSize"),
      age: formData.get("petAge"),
      location: formData.get("petLocation"),
      description: formData.get("petDescription"),
      photo: photoPreview,
      contactPhone: formData.get("contactPhone"),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form
      form.reset();
      setPhotoPreview(null);
      setSelectedPhoto(null);
      onOpenChange(false);
      if (onSuccess) onSuccess(petData);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="p-0 mb-4">
          <DialogTitle className="text-xl">Cadastrar pet para doação</DialogTitle>
          <DialogDescription>
            Preencha os campos para cadastrar um pet para adoção.
          </DialogDescription>
        </DialogHeader>
        
        <form className="overflow-y-auto space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="petName">Nome do pet *</Label>
            <Input 
              id="petName" 
              name="petName"
              placeholder="Ex: Rex" 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="petSpecies">Espécie *</Label>
              <Select name="petSpecies" defaultValue="dog">
                <SelectTrigger id="petSpecies">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="petSize">Porte *</Label>
              <Select name="petSize" defaultValue="medium">
                <SelectTrigger id="petSize">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="petAge">Idade *</Label>
              <Select name="petAge" defaultValue="adult">
                <SelectTrigger id="petAge">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Filhote</SelectItem>
                  <SelectItem value="adult">Adulto</SelectItem>
                  <SelectItem value="senior">Idoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="petLocation">Localização *</Label>
              <Input 
                id="petLocation" 
                name="petLocation"
                placeholder="Ex: Zona Sul" 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petDescription">Descrição *</Label>
            <Textarea 
              id="petDescription" 
              name="petDescription"
              placeholder="Descreva características do pet, temperamento, vacinas, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petPhoto">Imagem do pet</Label>
            <div 
              className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
              onClick={() => photoInputRef.current?.click()}
            >
              {!photoPreview ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <PawPrint className="h-10 w-10 text-neutral-400" />
                  <p className="text-sm text-neutral-500">
                    Clique para adicionar uma foto do pet
                  </p>
                  <p className="text-xs text-neutral-400">
                    Formatos suportados: JPG, PNG, WEBP (Máx. 10MB)
                  </p>
                </div>
              ) : (
                <div className="relative h-40 w-full overflow-hidden rounded-md">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="h-full w-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto();
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90"
                    aria-label="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <Input 
                id="petPhoto" 
                name="petPhoto" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoSelect}
                ref={photoInputRef}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefone para contato (opcional)</Label>
            <Input 
              id="contactPhone" 
              name="contactPhone"
              placeholder="Ex: 11999999999 (apenas números)" 
            />
          </div>
        
          <div className="flex flex-col sm:flex-row justify-between sm:justify-end gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              type="submit" 
              className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}