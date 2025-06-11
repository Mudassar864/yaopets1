import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useAuth } from "@/context/AuthContext";
import NativeBottomNavigation from "@/components/mobile/NativeBottomNavigation";
import { MapPin } from "lucide-react";
import api from "@/lib/api";

// Pet type from backend
type Pet = {
  id: string | number;
  name: string;
  species: string;
  breed: string;
  color?: string;
  size: string;
  age: string;
  status: "lost" | "found" | "adoption";
  eyeColor?: string;
  address: string;
  description: string;
  ownerId: string | number;
  ownerName?: string;
  lat?: number;
  lng?: number;
  photos?: string[]; // Backend stores array of photo URLs
  imageUrl?: string; // For display (first photo)
};

function PetCard({ pet, onContact, onMap }: { 
  pet: Pet, 
  onContact: (pet: Pet) => void,
  onMap: (pet: Pet) => void
}) {
  const [, navigate] = useLocation();
  const goToDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/pet-details/${pet.id}`);
  };

  // Display first photo if available, else fallback
  const displayImage = pet.photos?.[0] || pet.imageUrl || "";

  return (
    <Card 
      key={pet.id} 
      className="overflow-hidden border-0 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={goToDetails}
    >
      <CardContent className="p-0">
        <div className="h-48 bg-gradient-to-r from-emerald-500 to-emerald-600 relative overflow-hidden">
          {displayImage ? (
            <img src={displayImage} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-icons text-white/30 text-8xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">pets</span>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={`${
              pet.status === "lost"
                ? "bg-orange-100 text-orange-800 border-0" 
                : pet.status === "found"
                  ? "bg-blue-100 text-blue-800 border-0"
                  : "bg-green-100 text-green-800 border-0"
              } px-2 py-1 text-xs font-medium`}
            >
              {pet.status === "lost" 
                ? "Lost" 
                : pet.status === "found" 
                  ? "Found" 
                  : "Available"}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full w-8 h-8"
            onClick={(e) => {
              e.stopPropagation();
              onMap(pet);
            }}
          >
            <MapPin className="h-4 w-4 text-neutral-700" />
          </Button>
        </div>
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{pet.address}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <span className="block text-xs font-medium text-gray-600">Species</span>
              <span className="block text-sm font-semibold text-gray-800">{pet.species}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <span className="block text-xs font-medium text-gray-600">Size</span>
              <span className="block text-sm font-semibold text-gray-800">{pet.size}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <span className="block text-xs font-medium text-gray-600">Breed</span>
              <span className="block text-sm font-semibold text-gray-800">{pet.breed}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {pet.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PetsPage() {
  const [activeTab, setActiveTab] = useState<"adoption" | "lost" | "found">("adoption");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { getCurrentPosition } = useGeoLocation();
  const { toast } = useToast();

  // Backend: use API to fetch pets
  const [petsData, setPetsData] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentPosition();
  }, []);

  useEffect(() => {
    const fetchPets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.pet.getPets();
        // If the backend is paginated, adapt as needed
        const arr = Array.isArray(data) ? data : data?.pets || [];
        setPetsData(arr);
      } catch (err: any) {
        setError("Unable to fetch pets. " + (err?.response?.data?.message || err.message));
        setPetsData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPets();
  }, []);

  // Filtered pets per tab
  const filteredPets = petsData.filter(pet => {
    if (activeTab === "lost") {
      return pet.status === "lost";
    } else if (activeTab === "found") {
      return pet.status === "found";
    } else if (activeTab === "adoption") {
      return pet.status === "adoption";
    }
    return false;
  });

  // Contact owner (demo: alert)
  const handleContactOwner = (pet: Pet) => {
    alert(`Contacting the owner of ${pet.name}${pet.ownerName ? " (" + pet.ownerName + ")" : ""}`);
  };

  // Open map
  const handleOpenMap = (pet: Pet) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pet.address)}`;
    window.open(mapUrl, '_blank');
    toast({
      title: "Opening map",
      description: `Navigating to ${pet.address}`,
    });
  };

  const goToAdoption = () => {
    setLocation("/donations");
  };

  return (
    <div className="pb-16">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pets</h1>
          <p className="text-neutral-600 mt-1">
            Lost, found, and for adoption
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-black to-secondary rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-medium text-white mb-1">Saw a lost animal or found a pet?</h3>
              <p className="text-white/90 text-sm">
                Help the community by registering lost or found animals so they can be reunited with their families.
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 flex items-center"
              onClick={() => setLocation('/new-pet')}
            >
              <span className="material-icons text-sm mr-1">add</span>
              Register pet
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={tab => setActiveTab(tab as "adoption" | "lost" | "found")}>
          <TabsList className="flex w-full mb-6 p-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
            <TabsTrigger 
              value="adoption" 
              className="flex-1 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="material-icons text-sm">favorite</span>
                <span>For Adoption</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="lost" 
              className="flex-1 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="material-icons text-sm">search</span>
                <span>Lost</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="found" 
              className="flex-1 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="material-icons text-sm">pets</span>
                <span>Found</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-500">Loading pets...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 text-center">
              <p className="mb-2 font-medium">Could not load pets</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              <TabsContent value="lost" className="mt-0">
                {filteredPets.length === 0 ? (
                  <div className="bg-red-50 rounded-lg p-6 text-center">
                    <div className="text-red-500 flex justify-center mb-3">
                      <span className="material-icons text-4xl">search</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No lost pets found</h3>
                    <p className="text-gray-600">
                      There are no lost pets registered at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPets.map(pet => (
                      <PetCard 
                        key={pet.id} 
                        pet={pet} 
                        onContact={handleContactOwner}
                        onMap={handleOpenMap}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="found" className="mt-0">
                {filteredPets.length === 0 ? (
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-blue-500 flex justify-center mb-3">
                      <span className="material-icons text-4xl">pets</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No found pets registered</h3>
                    <p className="text-gray-600">
                      There are no found pets at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPets.map(pet => (
                      <PetCard 
                        key={pet.id} 
                        pet={pet} 
                        onContact={handleContactOwner}
                        onMap={handleOpenMap}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="adoption" className="mt-0">
                {filteredPets.length === 0 ? (
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-green-500 flex justify-center mb-3">
                      <span className="material-icons text-4xl">favorite</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No pets for adoption</h3>
                    <p className="text-gray-600 mb-4">
                      There are no pets available for adoption at the moment. Use the "Register pet" button to add a pet for adoption.
                    </p>
                    
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPets.map(pet => (
                      <PetCard 
                        key={pet.id} 
                        pet={pet} 
                        onContact={handleContactOwner}
                        onMap={handleOpenMap}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <NativeBottomNavigation />
    </div>
  );
}