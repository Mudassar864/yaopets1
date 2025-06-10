import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PawPrint, MapPin, ArrowLeft, X, Check } from "lucide-react";
import NativeBottomNavigation from "@/components/mobile/NativeBottomNavigation";

export default function NewPetPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [formSuccess, setFormSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Handle photo select
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Max image size is 10MB",
          variant: "destructive"
        });
        return;
      }
      // Check type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Unsupported format",
          description: "Please select images only",
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

  // Remove selected photo
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Save pet to localStorage
  const savePetLocally = (petObj: any) => {
    let pets = [];
    const petsRaw = localStorage.getItem("yaopets_local_pets");
    if (petsRaw) {
      try {
        pets = JSON.parse(petsRaw);
      } catch {
        pets = [];
      }
    }
    pets.unshift(petObj);
    localStorage.setItem("yaopets_local_pets", JSON.stringify(pets.slice(0, 20)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Pet data
      const petName = formData.get('petName') as string || 'Pet for adoption';
      const petDescription = formData.get('petDescription') as string || '';
      const petUsefulInfo = formData.get('petUsefulInfo') as string || '';
      const petSpecies = formData.get('petSpecies') as string || 'dog';
      const petSize = formData.get('petSize') as string || 'medium';
      const petAge = formData.get('petAge') as string || 'adult';
      const petLocation = formData.get('petLocation') as string || 'Not informed';
      const contactPhone = formData.get('contactPhone') as string || '';

      // Translations
      const speciesTranslation: Record<string, string> = {
        'dog': 'Dog',
        'cat': 'Cat',
        'other': 'Other'
      };
      const sizeTranslation: Record<string, string> = {
        'small': 'Small',
        'medium': 'Medium',
        'large': 'Large'
      };
      const ageTranslation: Record<string, string> = {
        'puppy': 'Puppy',
        'young': 'Young',
        'adult': 'Adult',
        'senior': 'Senior'
      };

      const petSpeciesDisplay = speciesTranslation[petSpecies] || petSpecies;
      const petSizeDisplay = sizeTranslation[petSize] || petSize;
      const petAgeDisplay = ageTranslation[petAge] || petAge;

      // Compose content
      let content = petDescription && petDescription.trim() !== ''
        ? petDescription
        : `${petName} for adoption`;
      if (petUsefulInfo && petUsefulInfo.trim() !== '') {
        content += '\n\nUseful info:\n' + petUsefulInfo;
      }

      // Prepare pet object for local storage
      const petObj = {
        id: Date.now(),
        petName,
        petSpecies,
        petSpeciesDisplay,
        petSize,
        petSizeDisplay,
        petAge,
        petAgeDisplay,
        petLocation,
        contactPhone,
        content,
        description: petDescription,
        usefulInfo: petUsefulInfo,
        createdAt: new Date().toISOString(),
        status: "adoption",
        photo: photoPreview || null,
      };

      savePetLocally(petObj);

      setFormSuccess(true);
      toast({
        title: 'Pet registered successfully',
        description: 'Your pet is now available for adoption!',
      });

      setTimeout(() => {
        navigate('/pets');
      }, 2000);
    } catch (error) {
      console.error('Error registering pet:', error);
      toast({
        title: 'Error registering pet',
        description: 'There was an error registering the pet. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next step
  const goToNextStep = () => {
    setFormStep(2);
    window.scrollTo(0, 0);
  };

  // Previous step
  const goToPreviousStep = () => {
    setFormStep(1);
    window.scrollTo(0, 0);
  };

  // Render success screen
  if (formSuccess) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-green-700">
              <Check className="h-16 w-16 mx-auto mb-2 text-green-500" />
              Registration successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-600 mb-4">
              Your pet has been added for adoption and is now available.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to pets page...
            </p>
          </CardContent>
        </Card>
        <NativeBottomNavigation />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pb-20">
      <div className="flex items-center py-4 mb-2">
        <Button
          variant="ghost"
          className="mr-2 px-0"
          onClick={() => navigate('/donations')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Register pet for adoption</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <PawPrint className="h-5 w-5 mr-2 text-pink-500" />
            {formStep === 1 ? "Basic information" : "Pet details"}
          </CardTitle>
          <CardDescription>
            {formStep === 1 
              ? "Fill in your pet's basic info"
              : "Add more details and a photo"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formStep === 1 ? (
              // Step 1: Basic info
              <>
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
                      placeholder="Ex: South Zone" 
                      required 
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  className="w-full bg-pink-500 hover:bg-pink-600 mt-4"
                  onClick={goToNextStep}
                >
                  Continue
                </Button>
              </>
            ) : (
              // Step 2: Pet details, photo
              <>
                <div className="space-y-2">
                  <Label htmlFor="petDescription" className="flex items-center">
                    <span>Pet description *</span>
                    <span className="ml-2 text-xs text-neutral-500">(main characteristics)</span>
                  </Label>
                  <Textarea 
                    id="petDescription" 
                    name="petDescription"
                    placeholder="Describe main characteristics, temperament, behavior, etc."
                    rows={4}
                    defaultValue="Pet for adoption"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petUsefulInfo" className="flex items-center">
                    <span>Useful information</span>
                    <span className="ml-2 text-xs text-neutral-500">(optional)</span>
                  </Label>
                  <Textarea 
                    id="petUsefulInfo" 
                    name="petUsefulInfo"
                    placeholder="Give details like vaccines, special care, feeding, other info."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petPhoto" className="flex items-center">
                    <span>Pet image</span>
                    <span className="ml-2 text-xs text-pink-500 font-medium">(important for adoption)</span>
                  </Label>
                  <div 
                    className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center cursor-pointer hover:bg-pink-50 transition-colors"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {!photoPreview ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <PawPrint className="h-10 w-10 text-neutral-400" />
                        <p className="text-sm text-neutral-500">
                          Click to add a pet photo
                        </p>
                        <p className="text-xs text-neutral-400">
                          Supported formats: JPG, PNG, WEBP (Max. 10MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative h-48 w-full overflow-hidden rounded-md">
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
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Finish registration'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
      <NativeBottomNavigation />
    </div>
  );
}