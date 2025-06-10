import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PetCard from "@/components/cards/PetCard";
import DonationCard from "@/components/cards/DonationCard";
import VetHelpCard from "@/components/cards/VetHelpCard";
import CreatePostModal from "@/components/modals/CreatePostModal";
import { useGeoLocation } from "@/hooks/useGeoLocation";

// Dummy/mock data for offline search
const mockPets = [
  {
    id: 1,
    name: "Luna",
    breed: "Persian",
    color: "Gray",
    description: "Playful, vaccinated, spayed, perfect for families.",
    lastLocation: { address: "Av. Paulista, 1000" },
    ownerId: 1,
  },
  {
    id: 2,
    name: "Thor",
    breed: "Golden Retriever",
    color: "Golden",
    description: "Energetic, loves walks. Looking for an active owner.",
    lastLocation: { address: "Rua Augusta, 200" },
    ownerId: 2,
  },
];
const mockDonations = [
  {
    id: 10,
    title: "Dog Food Donation",
    description: "Premium dry food, unopened.",
    location: { address: "Centro - Rua das Flores, 45" },
    donorId: 3,
  },
  {
    id: 11,
    title: "Cat Litter Bags",
    description: "Several bags available for donation.",
    location: { address: "Av. Brasil, 300" },
    donorId: 1,
  },
];
const mockVetHelps = [
  {
    id: 100,
    title: "Help for injured stray",
    description: "Dog found with injured paw, needs vet care.",
    location: { address: "Praça da Sé" },
    requesterId: 4,
  },
];

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { getCurrentPosition } = useGeoLocation();

  // No backend/API calls, just use local mock data
  useEffect(() => {
    getCurrentPosition();
  }, []);

  // Filter data based on search query and active tab
  const filterArray = (arr: any[], fields: string[]) =>
    arr.filter(item =>
      !searchQuery
        ? true
        : fields.some(field =>
            (item[field] &&
              item[field].toLowerCase().includes(searchQuery.toLowerCase()))
          )
    );
  const filteredPets = filterArray(mockPets, [
    "name",
    "breed",
    "color",
    "description",
    "lastLocation.address",
  ]);
  const filteredDonations = filterArray(mockDonations, [
    "title",
    "description",
    "location.address",
  ]);
  const filteredVetHelps = filterArray(mockVetHelps, [
    "title",
    "description",
    "location.address",
  ]);

  const handleClearSearch = () => setSearchQuery("");

  const handleMessageClick = (item: any) => {
    const userId =
      item.ownerId || item.foundById || item.donorId || item.requesterId;
    if (userId) setLocation(`/chat/${userId}`);
  };

  const handleMapClick = () => setLocation("/map");

  const handleDonateClick = (vetHelp: any) => {
    alert(`Donate to: ${vetHelp.title}`);
  };

  const getResultsCount = () =>
    (filteredPets?.length || 0) +
    (filteredDonations?.length || 0) +
    (filteredVetHelps?.length || 0);

  return (
    <div className="app-container">
      {/* Header */}
      <Header title="Search" showFilters={false} />

      {/* Main Content */}
      <main className="pb-16">
        {/* Search Box */}
        <div className="p-4 bg-white border-b border-neutral-200">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <span className="material-icons text-xl">search</span>
            </span>
            <Input
              type="text"
              placeholder="Search pets, donations, vet help..."
              className="pl-10 pr-12 py-2 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 px-3 py-0 h-full"
                onClick={handleClearSearch}
              >
                <span className="material-icons">close</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-neutral-200">
            <TabsList className="p-0 h-12 bg-transparent w-full grid grid-cols-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                All
              </TabsTrigger>
              <TabsTrigger value="pets" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Pets
              </TabsTrigger>
              <TabsTrigger value="donations" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Donations
              </TabsTrigger>
              <TabsTrigger value="vet-help" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Vet Help
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <>
              <div className="px-4 py-2 text-sm text-neutral-600 bg-neutral-50 border-b border-neutral-200">
                {searchQuery ? (
                  <p>
                    {getResultsCount()} results for "{searchQuery}"
                  </p>
                ) : (
                  <p>Type to search</p>
                )}
              </div>
              <div className="divide-y divide-neutral-200">
                {filteredPets.map(pet => (
                  <PetCard
                    key={`pet-${pet.id}`}
                    pet={pet}
                    onMessageClick={() => handleMessageClick(pet)}
                    onMapClick={() => handleMapClick(pet)}
                  />
                ))}
                {filteredDonations.map(donation => (
                  <DonationCard
                    key={`donation-${donation.id}`}
                    donation={donation}
                    onMessageClick={() => handleMessageClick(donation)}
                  />
                ))}
                {filteredVetHelps.map(vetHelp => (
                  <VetHelpCard
                    key={`vethelp-${vetHelp.id}`}
                    vetHelp={vetHelp}
                    onDonateClick={() => handleDonateClick(vetHelp)}
                  />
                ))}
                {searchQuery &&
                  getResultsCount() === 0 && (
                    <div className="p-8 text-center">
                      <span className="material-icons text-4xl text-neutral-400 mb-2">search_off</span>
                      <p className="text-neutral-600">No results found</p>
                      <p className="text-neutral-500 text-sm mt-1">
                        Try other search terms
                      </p>
                    </div>
                  )}
                {!searchQuery && (
                  <div className="p-8 text-center">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">search</span>
                    <p className="text-neutral-600">What are you looking for?</p>
                    <p className="text-neutral-500 text-sm mt-1">
                      Type something above to search
                    </p>
                  </div>
                )}
              </div>
            </>
          </TabsContent>

          <TabsContent value="pets" className="mt-0">
            <>
              <div className="px-4 py-2 text-sm text-neutral-600 bg-neutral-50 border-b border-neutral-200">
                {searchQuery ? (
                  <p>
                    {filteredPets.length} pets found for "{searchQuery}"
                  </p>
                ) : (
                  <p>All pets</p>
                )}
              </div>
              <div className="divide-y divide-neutral-200">
                {filteredPets.map(pet => (
                  <PetCard
                    key={`pet-${pet.id}`}
                    pet={pet}
                    onMessageClick={() => handleMessageClick(pet)}
                    onMapClick={() => handleMapClick(pet)}
                  />
                ))}
                {searchQuery && filteredPets.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">pets</span>
                    <p className="text-neutral-600">No pets found</p>
                    <p className="text-neutral-500 text-sm mt-1">
                      Try other search terms
                    </p>
                  </div>
                )}
              </div>
            </>
          </TabsContent>

          <TabsContent value="donations" className="mt-0">
            <>
              <div className="px-4 py-2 text-sm text-neutral-600 bg-neutral-50 border-b border-neutral-200">
                {searchQuery ? (
                  <p>
                    {filteredDonations.length} donations found for "{searchQuery}"
                  </p>
                ) : (
                  <p>All donations</p>
                )}
              </div>
              <div className="divide-y divide-neutral-200">
                {filteredDonations.map(donation => (
                  <DonationCard
                    key={`donation-${donation.id}`}
                    donation={donation}
                    onMessageClick={() => handleMessageClick(donation)}
                  />
                ))}
                {searchQuery && filteredDonations.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">volunteer_activism</span>
                    <p className="text-neutral-600">No donations found</p>
                    <p className="text-neutral-500 text-sm mt-1">
                      Try other search terms
                    </p>
                  </div>
                )}
              </div>
            </>
          </TabsContent>

          <TabsContent value="vet-help" className="mt-0">
            <>
              <div className="px-4 py-2 text-sm text-neutral-600 bg-neutral-50 border-b border-neutral-200">
                {searchQuery ? (
                  <p>
                    {filteredVetHelps.length} vet helps found for "{searchQuery}"
                  </p>
                ) : (
                  <p>All vet help</p>
                )}
              </div>
              <div className="divide-y divide-neutral-200">
                {filteredVetHelps.map(vetHelp => (
                  <VetHelpCard
                    key={`vethelp-${vetHelp.id}`}
                    vetHelp={vetHelp}
                    onDonateClick={() => handleDonateClick(vetHelp)}
                  />
                ))}
                {searchQuery && filteredVetHelps.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">medical_services</span>
                    <p className="text-neutral-600">No vet help found</p>
                    <p className="text-neutral-500 text-sm mt-1">
                      Try other search terms
                    </p>
                  </div>
                )}
              </div>
            </>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNavigation onNewPostClick={() => setCreatePostModalOpen(true)} />
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} />
    </div>
  );
}