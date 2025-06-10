import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Eye } from "lucide-react";
import NativeBottomNavigation from "@/components/mobile/NativeBottomNavigation";

// Pet interface definition
interface Pet {
  id: number;
  name: string;
  species: string;
  size: string;
  age: string;
  location: string;
  description: string;
  status: string;
  contactPhone: string;
}

export default function AdoptionPage() {
  const [adoptionFormOpen, setAdoptionFormOpen] = useState(false);

  // Pets for adoption (in a real app, this data would come from an API)
  const adoptionPets: Pet[] = [
    {
      id: 1,
      name: "Thor",
      species: "Dog",
      size: "Medium",
      age: "Puppy",
      location: "South Zone",
      description: "Docile and playful puppy, vaccinated and dewormed.",
      status: "Available",
      contactPhone: "5511999999999"
    },
    {
      id: 2,
      name: "Luna",
      species: "Cat",
      size: "Small",
      age: "Adult",
      location: "West Zone",
      description: "Calm and affectionate cat, neutered and vaccinated.",
      status: "Available",
      contactPhone: "5511988888888"
    },
    {
      id: 3,
      name: "Max",
      species: "Dog",
      size: "Large",
      age: "Adult",
      location: "North Zone",
      description: "Protective and friendly dog, ideal for homes with a yard.",
      status: "Available",
      contactPhone: "5511977777777"
    }
  ];
  
  const handleAdoptPet = (pet: Pet): void => {
    // Formats the WhatsApp message
    const message = encodeURIComponent(`I want this beautiful pet! 🐾
Name: ${pet.name}
Description: ${pet.description}
Location: ${pet.location}`);
    
    // Opens WhatsApp with the pre-formatted message
    window.open(`https://wa.me/${pet.contactPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="pb-16">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pet Adoption</h1>
          <p className="text-neutral-600 mt-1">
            Find a new friend for your family
          </p>
        </div>

        {/* Responsible adoption animals section */}
        <div className="bg-pink-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center">
            <span className="mr-2">🐾</span>
            Animals for responsible adoption
          </h2>
          <p className="text-sm text-neutral-700 mb-3">
            Find pets who need a new home or register an animal for adoption.
          </p>
          
          {/* Button to register pet for adoption */}
          <Dialog open={adoptionFormOpen} onOpenChange={setAdoptionFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Register pet for adoption
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register pet for adoption</DialogTitle>
                <DialogDescription>
                  Fill in all required fields to register a pet for adoption.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="petName">Pet name *</Label>
                    <Input id="petName" placeholder="Ex: Thor" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="petSpecies">Species *</Label>
                    <Select defaultValue="dog">
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="petSize">Size *</Label>
                    <Select defaultValue="medium">
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
                  <div className="space-y-2">
                    <Label htmlFor="petAge">Age *</Label>
                    <Select defaultValue="puppy">
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="petLocation">Location *</Label>
                  <Input 
                    id="petLocation" 
                    placeholder="Ex: South Zone" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="petDescription">Description *</Label>
                  <Textarea 
                    id="petDescription" 
                    placeholder="Describe pet characteristics, temperament, vaccines, etc."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="petPhoto">Photo</Label>
                  <Input id="petPhoto" type="file" accept="image/*" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact phone/WhatsApp *</Label>
                  <Input 
                    id="contactPhone" 
                    placeholder="Ex: 11999999999 (numbers only)" 
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Register</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Adoption pets list */}
        <div className="grid grid-cols-1 gap-4">
          {adoptionPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Pet image area */}
                <div className="h-48 bg-neutral-200 flex items-center justify-center">
                  <span className="material-icons text-neutral-400 text-4xl">pets</span>
                </div>
                
                {/* Pet info */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{pet.name}</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                      {pet.status}
                    </Badge>
                  </div>
                  
                  {/* Pet details in grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 text-sm mr-1">pets</span>
                      <span className="text-neutral-700">{pet.species}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 text-sm mr-1">straighten</span>
                      <span className="text-neutral-700">{pet.size}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 text-sm mr-1">child_care</span>
                      <span className="text-neutral-700">{pet.age}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 text-sm mr-1">location_on</span>
                      <span className="text-neutral-700">{pet.location}</span>
                    </div>
                  </div>
                  
                  {/* Pet description */}
                  <p className="text-sm text-neutral-600 mb-3">
                    {pet.description}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View details
                    </Button>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600" onClick={() => handleAdoptPet(pet)}>
                      Adopt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <NativeBottomNavigation />
    </div>
  );
}