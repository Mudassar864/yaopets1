import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum image size is 10MB",
          variant: "destructive"
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Unsupported format",
          description: "Please select only images",
          variant: "destructive"
        });
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate post submission without backend interaction
    setTimeout(() => {
      toast({
        title: 'Pet registered (demo)',
        description: 'Your pet would be registered for donation here.',
      });
      const form = e.currentTarget;
      form.reset();
      setPhotoPreview(null);
      setSelectedPhoto(null);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess({
          status: "success",
          petName: form.petName.value,
        });
      }
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="p-0 mb-4">
          <DialogTitle className="text-xl">Register a pet for donation</DialogTitle>
          <DialogDescription>
            Fill in all required fields to register a pet for adoption.
          </DialogDescription>
        </DialogHeader>
        <form className="overflow-y-auto space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="petName">Pet name *</Label>
            <Input 
              id="petName" 
              name="petName"
              placeholder="Ex: Rex" 
              required 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="petSpecies">Species *</Label>
              <Select name="petSpecies" defaultValue="dog">
                <SelectTrigger id="petSpecies">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="petSize">Size *</Label>
              <Select name="petSize" defaultValue="medium">
                <SelectTrigger id="petSize">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="petAge">Age *</Label>
              <Select name="petAge" defaultValue="adult">
                <SelectTrigger id="petAge">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Puppy</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="petLocation">Location *</Label>
              <Input 
                id="petLocation" 
                name="petLocation"
                placeholder="Ex: Downtown" 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="petDescription">Description *</Label>
            <Textarea 
              id="petDescription" 
              name="petDescription"
              placeholder="Describe the pet's features, temperament, vaccinations, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="petPhoto">Pet image</Label>
            <div 
              className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
              onClick={() => photoInputRef.current?.click()}
            >
              {!photoPreview ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <PawPrint className="h-10 w-10 text-neutral-400" />
                  <p className="text-sm text-neutral-500">
                    Click to add a photo of the pet
                  </p>
                  <p className="text-xs text-neutral-400">
                    Supported formats: JPG, PNG, WEBP (Max. 10MB)
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
                    aria-label="Remove image"
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
            <Label htmlFor="contactPhone">Contact phone (optional)</Label>
            <Input 
              id="contactPhone" 
              name="contactPhone"
              placeholder="Ex: 11999999999 (numbers only)" 
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
              Back
            </Button>
            <Button 
              type="submit" 
              className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}