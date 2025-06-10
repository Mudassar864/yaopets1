import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Image, X, Heart } from "lucide-react";
import NativeBottomNavigation from "@/components/mobile/NativeBottomNavigation";
import api from "@/lib/api";

// Enum values from your Mongoose schema
const CATEGORY_ENUM = [
  { value: "food", label: "Food" },
  { value: "accessory", label: "Accessory" },
  { value: "toy", label: "Toy" },
  { value: "medicine", label: "Medicine" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];
const CONDITION_ENUM = [
  { value: "new", label: "New" },
  { value: "almost new", label: "Almost New" },
  { value: "used - good", label: "Used - Good" },
  { value: "used - worn", label: "Used - Worn" },
];

interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  image?: string;
  donorName: string;
  donorId: string;
}

export default function DonationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Donation items from backend
  const [donationItems, setDonationItems] = useState<DonationItem[]>([]);

  // States for item donation form
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    location: ""
  });

  // Photo selection
  const [itemPhoto, setItemPhoto] = useState<File | null>(null);
  const [itemPhotoPreview, setItemPhotoPreview] = useState<string | null>(null);
  const itemPhotoInputRef = useRef<HTMLInputElement>(null);

  // Load donation items from API
  useEffect(() => {
    setIsLoading(true);
    async function fetchDonations() {
      try {
        const { data } = await api.donation.getDonations();
        const arr: DonationItem[] = Array.isArray(data)
          ? data
          : data?.donations || [];
        setDonationItems(
          arr.map((item) => ({
            id: item._id || item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            condition: item.condition,
            location:
              typeof item.location === "string"
                ? item.location
                : (item.location && item.location.address) || "",
            image: item.photos?.[0] || item.image,
            donorName: item.donorName || (item.user && (item.user.username || item.user.name)) || "Anonymous",
            donorId: item.donorId || (item.user && item.user._id) || "",
          }))
        );
      } catch (e: any) {
        toast({
          title: "Error loading donations",
          description: e?.response?.data?.message || e.message,
          variant: "destructive",
        });
        setDonationItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDonations();
    // eslint-disable-next-line
  }, []);

  // Add item for donation
  const handleAddItem = () => {
    setItemForm({
      title: "",
      description: "",
      category: "",
      condition: "",
      location: ""
    });
    setItemPhoto(null);
    setItemPhotoPreview(null);
    setItemFormOpen(true);
  };

  // Select item photo
  const handleItemPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setItemPhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setItemPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Register new donation item using API
  const handleRegisterItem = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to donate an item.",
        variant: "destructive",
      });
      return;
    }
    if (!itemForm.title || !itemForm.category || !itemForm.condition || !itemForm.location || !itemForm.description) {
      toast({
        title: "Fill all fields",
        description: "Please fill all item fields.",
        variant: "destructive",
      });
      return;
    }

    // Prepare location as object for mongoose schema
    const formData = new FormData();
    formData.append("title", itemForm.title);
    formData.append("description", itemForm.description);
    formData.append("category", itemForm.category); // backend expects lowercase
    formData.append("condition", itemForm.condition); // backend expects lowercase
    formData.append("location[address]", itemForm.location); // send as location.address for mongoose nested object
    if (itemPhoto) formData.append("photos", itemPhoto); // field name must match backend

    try {
      const { data } = await api.donation.createDonation(formData);
      setDonationItems((prev) => [
        {
          id: data._id || data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          condition: data.condition,
          location:
            typeof data.location === "string"
              ? data.location
              : (data.location && data.location.address) || "",
          image: data.photos?.[0] || data.image,
          donorName: data.donorName || (data.user && (data.user.username || data.user.name)) || "Anonymous",
          donorId: data.donorId || (data.user && data.user._id) || "",
        },
        ...prev,
      ]);
      toast({
        title: "Item registered successfully!",
        description: "Your item is now available for donation."
      });
      setItemFormOpen(false);
    } catch (e: any) {
      toast({
        title: "Error registering item",
        description: e?.response?.data?.message || e.message,
        variant: "destructive",
      });
    }
  };

  // Express interest in an item (start chat or send request)
  const handleItemInterest = (item: DonationItem) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to express interest.",
        variant: "destructive",
      });
      return;
    }
    if (user.id === item.donorId) {
      toast({
        title: "Notice",
        description: "You cannot show interest in your own item.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Interest sent!",
      description: `A conversation was started with ${item.donorName} about "${item.title}".`
    });
    navigate(`/chat/0`);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Donations</h1>

      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-xl text-[#F5821D]">inventory_2</span>
            <h2 className="text-xl font-semibold">Items for Donation</h2>
          </div>
          <Button
            onClick={handleAddItem}
            className="bg-gradient-to-r from-[#F5821D] to-[#CE97E8] hover:from-[#CE97E8] hover:to-[#F5821D] text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Donate item
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5821D]"></div>
          </div>
        ) : donationItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-[#F5821D]/10 p-6 rounded-lg inline-flex flex-col items-center">
              <Gift className="h-12 w-12 text-[#F5821D] mb-3" />
              <h3 className="text-lg font-medium mb-2">No items for donation</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                There are no items available for donation at the moment. You can register a donation item by clicking the button above.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donationItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-48 bg-amber-100 relative overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#F5821D]/30 to-[#CE97E8]/30">
                        <Gift className="h-16 w-16 text-[#F5821D]" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-[#F5821D] to-[#CE97E8] capitalize">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium capitalize">{item.condition}</span>
                      <span className="text-sm text-gray-600">{item.location}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#F5821D] text-[#F5821D] hover:bg-[#F5821D]/10"
                        onClick={() => handleItemInterest(item)}
                      >
                        <Heart className="mr-2 h-4 w-4" /> I'm interested
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog for item donation */}
      <Dialog open={itemFormOpen} onOpenChange={setItemFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Donate an Item</DialogTitle>
            <DialogDescription>
              Fill in the details of the item you want to donate.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                placeholder="Ex: Adult cat food"
              />
            </div>

            <div>
              <Label htmlFor="item-category">Category</Label>
              <Select
                value={itemForm.category}
                onValueChange={(value) => setItemForm({ ...itemForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ENUM.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-condition">Condition</Label>
              <Select
                value={itemForm.condition}
                onValueChange={(value) => setItemForm({ ...itemForm, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_ENUM.map((cond) => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-location">Location</Label>
              <Input
                id="item-location"
                value={itemForm.location}
                onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Describe details about the item, such as brand, size, quantity, etc."
                rows={3}
              />
            </div>

            <div>
              <Label className="block mb-2">Item Photo</Label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={itemPhotoInputRef}
                onChange={handleItemPhotoSelect}
              />

              {itemPhotoPreview ? (
                <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={itemPhotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                    onClick={() => {
                      setItemPhoto(null);
                      setItemPhotoPreview(null);
                    }}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#F5821D] transition-colors"
                  onClick={() => itemPhotoInputRef.current?.click()}
                >
                  <Image className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to add a photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (max. 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#F5821D] to-[#CE97E8]"
              onClick={handleRegisterItem}
            >
              Register Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NativeBottomNavigation />
    </div>
  );
}