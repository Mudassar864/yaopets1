import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import CreateVetFundraiserModal from '@/components/modals/CreateVetFundraiserModal';
import VetHelpDonationModal from '@/components/modals/VetHelpDonationModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function VetHelpPage() {
  const [activeTab, setActiveTab] = useState('messages');
  const [, setLocation] = useLocation();
  const [fundraisers, setFundraisers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all fundraisers from API on mount
  useEffect(() => {
    setLoading(true);
    async function fetchFundraisers() {
      try {
        const { data } = await api.vetHelp.getVetHelp();
         const arr = Array.isArray(data?.vetHelp) ? data.vetHelp : [];
        // REMOVE FILTER: show all campaigns
        setFundraisers(
          arr.map((f:any) => ({
            id: f._id || f.id,  
            title: f.title,
            description: f.description,
            image: f.photos?.[0] || f.image,
            amount: f.targetAmount || f.amount,
            currentAmount: f.currentAmount || f.raised || 0,
            percentComplete: Math.min(
              100,
              Math.round(
                ((f.currentAmount || f.raised || 0) / ((f.targetAmount || f.amount || 1))) * 100
              )
            ),
            daysRemaining: f.daysRemaining || 30, // backend should provide this ideally
            status: f.status || 'active',
          }))
        );
        console.log('Fundraisers loaded:', data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load fundraisers. Please try again.',
          variant: 'destructive',
        });
        setFundraisers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFundraisers();
    // eslint-disable-next-line
  }, []);

  // Handle fundraiser creation success
  const handleFundraiserCreated = async () => {
    setLoading(true);
    try {
      const { data } = await api.vetHelp.getVetHelp();
      const arr = Array.isArray(data) ? data : data?.vetHelps || [];
      setFundraisers(
        arr.map((f) => ({
          id: f._id || f.id,
          title: f.title,
          description: f.description,
          image: f.photos?.[0] || f.image,
          amount: f.targetAmount || f.amount,
          currentAmount: f.currentAmount || f.raised || 0,
          percentComplete: Math.min(
            100,
            Math.round(
              ((f.currentAmount || f.raised || 0) / ((f.targetAmount || f.amount || 1))) * 100
            )
          ),
          daysRemaining: f.daysRemaining || 30,
          status: f.status || 'active',
        }))
      );
      toast({
        title: 'Success',
        description: 'Fundraiser created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh fundraisers.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Dummy vet list (unchanged)
  const vetList = [
    {
      id: 1,
      userId: 35,
      name: 'Dr. Amanda Silva',
      specialty: 'Small Animal Specialist',
      rating: 4.8,
      reviews: 156,
      distance: '2.4 km',
      isOnline: true,
      profilePic: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200',
    },
    {
      id: 2,
      userId: 36,
      name: 'Dr. Carlos Mendes',
      specialty: 'Veterinary Surgeon',
      rating: 4.5,
      reviews: 120,
      distance: '3.7 km',
      isOnline: true,
      profilePic: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200',
    },
    {
      id: 3,
      userId: 37,
      name: 'Dr. Marina Santos',
      specialty: 'Exotic and Wild Animals',
      rating: 4.9,
      reviews: 98,
      distance: '4.1 km',
      isOnline: false,
      profilePic: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200',
    },
  ];

  // Dummy chat function (unchanged)
  const handleStartChat = (vetUserId: number) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to start a conversation.',
        variant: 'destructive',
      });
      return;
    }
    setLocation(`/chat/${vetUserId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vet Help</h1>
        <p className="text-neutral-600 mt-1">
          Consult with veterinarians online or help support fundraising campaigns for pet treatments.
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="flex w-full mb-6 p-1 bg-gradient-to-r from-[#CE97E8]/20 to-[#AA7DC7]/20 rounded-2xl">
          <TabsTrigger
            value="messages"
            className="flex-1 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#CE97E8] data-[state=active]:to-[#AA7DC7] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="material-icons text-sm">medical_services</span>
              <span>Veterinarians</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="donations"
            className="flex-1 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#CE97E8] data-[state=active]:to-[#AA7DC7] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="material-icons text-sm">volunteer_activism</span>
              <span>Contribute</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <div className="bg-gradient-to-r from-[#CE97E8]/20 to-[#0BDEC2]/20 p-6 rounded-xl mb-6 shadow-sm border border-[#CE97E8]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-4">
              <span className="material-icons text-[120px] text-[#CE97E8]">pets</span>
            </div>
            <div className="relative z-10">
              <h2 className="font-bold text-xl mb-3 text-gray-800 flex items-center">
                <span className="material-icons mr-2 text-[#CE97E8]">medical_services</span>
                Ask questions to veterinarians
              </h2>
              <p className="text-gray-700 mb-4 max-w-2xl">
                Our network of volunteer veterinarians is available to help with simple pet health questions in real time.
              </p>
              <Button
                className="bg-gradient-to-r from-[#CE97E8] to-[#AA7DC7] hover:from-[#CE97E8]/90 hover:to-[#AA7DC7]/90 text-white rounded-xl py-6 px-6 w-full md:w-auto shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => setLocation('/chat/500')}
              >
                <span className="material-icons">chat</span>
                Start chat with a veterinarian
              </Button>
            </div>
          </div>

          <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
            <span className="material-icons mr-2 text-[#0BDEC2]">group</span>
            Available Veterinarians
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vetList.map((vet) => (
              <Card
                key={vet.id}
                className="overflow-hidden border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <CardContent className="p-0">
                  <div className="relative h-24 overflow-hidden bg-gradient-to-r from-[#CE97E8]/30 to-[#0BDEC2]/30">
                    <div className="absolute top-0 right-0 mt-3 mr-3 z-10">
                      {vet.isOnline ? (
                        <div className="flex items-center bg-white px-2 py-1 rounded-full shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                          <span className="text-xs font-medium text-green-800">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center bg-white/80 px-2 py-1 rounded-full">
                          <span className="h-2 w-2 rounded-full bg-gray-400 mr-1.5"></span>
                          <span className="text-xs font-medium text-gray-700">Offline</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-24 text-white">
                      <h3 className="font-bold drop-shadow-sm">{vet.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 pt-3 flex">
                    <div className="relative -mt-12 mr-4">
                      <div className="h-20 w-20 rounded-xl overflow-hidden border-4 border-white shadow-md">
                        {vet.profilePic ? (
                          <img
                            src={vet.profilePic}
                            alt={vet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#CE97E8] to-[#0BDEC2] flex items-center justify-center text-white text-xl font-bold">
                            {vet.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 mt-2">
                      <p className="text-gray-600 text-sm">{vet.specialty}</p>
                      <div className="flex items-center mt-2 justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg mr-2">
                            <span className="material-icons text-yellow-500 text-sm">star</span>
                            <span className="text-xs font-medium ml-1 text-yellow-700">{vet.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">({vet.reviews})</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="material-icons text-[#CE97E8] text-sm mr-1">location_on</span>
                          <span>{vet.distance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl border-[#CE97E8]/30 text-[#CE97E8] hover:bg-[#CE97E8]/10 hover:text-[#CE97E8] transition-colors"
                      onClick={() => setLocation(`/vet-profile/${vet.userId}`)}
                    >
                      <span className="material-icons text-sm mr-1">person</span>
                      View profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#CE97E8] to-[#AA7DC7] hover:from-[#CE97E8]/90 hover:to-[#AA7DC7]/90 text-white transition-all duration-300"
                      onClick={() => handleStartChat(vet.userId)}
                    >
                      <span className="material-icons text-sm mr-1">chat</span>
                      Start chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <div className="bg-gradient-to-br from-[#CE97E8]/20 to-[#AA7DC7]/30 rounded-xl p-6 mb-6 shadow-sm border border-[#CE97E8]/30 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 opacity-10">
              <span className="material-icons text-[150px] text-[#CE97E8]">favorite</span>
            </div>
            <div className="relative z-10">
              <h2 className="font-bold text-xl mb-3 text-gray-800 flex items-center">
                <span className="material-icons mr-2 text-[#CE97E8]">volunteer_activism</span>
                Contribute to Veterinary Treatments
              </h2>
              <p className="text-gray-700 mb-4 max-w-2xl">
                Help needy or abandoned pets receive the care they need by donating to specific treatment campaigns. Every contribution makes a difference in a pet's life.
              </p>
              <CreateVetFundraiserModal onSuccess={handleFundraiserCreated} />
            </div>
          </div>

          <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
            <span className="material-icons mr-2 text-[#CE97E8]">campaign</span>
            Active Fundraising Campaigns
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#CE97E8]/30 to-[#0BDEC2]/30 flex items-center justify-center mb-4">
                  <div className="animate-spin">
                    <span className="material-icons text-4xl text-[#CE97E8]">refresh</span>
                  </div>
                </div>
                <span className="text-gray-600 font-medium">Loading campaigns...</span>
              </div>
            ) : fundraisers.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[#CE97E8]/20 to-[#0BDEC2]/20 flex items-center justify-center mb-5">
                  <span className="material-icons text-5xl text-[#CE97E8]">pets</span>
                </div>
                <h4 className="text-xl font-bold text-gray-700 mb-2">No active campaigns</h4>
                <p className="text-center text-gray-600 max-w-md">
                  There are no fundraisers at the moment.<br />
                  Be the first to create one and help an animal in need!
                </p>
              </div>
            ) : (
              fundraisers.map((fundraiser) => (
                <Card
                  key={fundraiser.id}
                  className="overflow-hidden border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={fundraiser.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                        alt={fundraiser.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <div className="px-3 py-1 rounded-full bg-white/90 text-[#CE97E8] text-xs font-bold shadow-sm inline-flex items-center">
                          <span className="material-icons text-xs mr-1">volunteer_activism</span>
                          Active campaign
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-[#CE97E8] transition-colors">{fundraiser.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{fundraiser.description}</p>
                      <div className="mb-4 bg-gray-50 p-3 rounded-xl">
                        <div className="flex justify-between text-sm mb-2">
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Raised</span>
                            <span className="font-bold text-[#CE97E8]">${fundraiser?.currentAmount}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-gray-500 text-xs">Goal</span>
                            <span className="font-bold text-gray-700">${fundraiser.amount}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#CE97E8] to-[#AA7DC7] h-3 rounded-full"
                            style={{ width: `${fundraiser.percentComplete}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-medium text-gray-700">{fundraiser.percentComplete}% complete</span>
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="material-icons text-xs mr-1 text-[#0BDEC2]">schedule</span>
                            <span>{fundraiser.daysRemaining} days left</span>
                          </div>
                        </div>
                      </div>
                      <VetHelpDonationModal
                        fundraiserId={fundraiser.id}
                        title={fundraiser.title}
                        trigger={
                          <Button
                            className="w-full bg-gradient-to-r from-[#CE97E8] to-[#AA7DC7] hover:from-[#CE97E8]/90 hover:to-[#AA7DC7]/90 text-white rounded-xl py-5 shadow-sm transition-all duration-300"
                          >
                            <span className="material-icons text-sm mr-2">favorite</span>
                            Contribute now
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}