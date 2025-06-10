import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PawPrint, ArrowLeft, X, Heart, Search, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function NewPetPageReplacement() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("adoption");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [petName, setPetName] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Max image size is 10MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Unsupported format",
          description: "Please select only images",
          variant: "destructive",
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
      photoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!isAuthenticated || !user) {
        throw new Error("You must be logged in to register a pet");
      }

      const form = e.currentTarget;
      const formData = new FormData(form);
      const petName = formData.get("petName") as string || "Pet";
      const petDescription = formData.get("petDescription") as string || "";
      const petSpecies = formData.get("petSpecies") as string || "dog";
      const petSize = formData.get("petSize") as string || "medium";
      const petAge = formData.get("petAge") as string || "adult";
      const petBreed = formData.get("petBreed") as string || "";
      const petEyeColor = formData.get("petEyeColor") as string || "";
      const petLocation = formData.get("petLocation") as string || "Not informed";
      const adoptionInfo = formData.get("adoptionInfo") as string || "";
      const contactPhone = formData.get("contactPhone") as string || "";

      let content = "";
      switch (activeTab) {
        case "lost":
          content = petDescription.trim() !== ""
            ? petDescription
            : `${petName} - Lost pet, please help find`;
          break;
        case "found":
          content = petDescription.trim() !== ""
            ? petDescription
            : `Pet found in ${petLocation}, help find the owner`;
          break;
        default:
          content = petDescription.trim() !== ""
            ? petDescription
            : `${petName} available for adoption`;
      }

      // Prepare API payload
      const apiFormData = new FormData();
      apiFormData.append("name", petName);
      apiFormData.append("description", petDescription);
      apiFormData.append("species", petSpecies);
      apiFormData.append("size", petSize);
      apiFormData.append("age", petAge);
      apiFormData.append("breed", petBreed);
      apiFormData.append("eyeColor", petEyeColor);
      apiFormData.append("address", petLocation);
      apiFormData.append("adoptionInfo", adoptionInfo);
      apiFormData.append("contactPhone", contactPhone);
      apiFormData.append("status", activeTab);
      apiFormData.append("content", content);

      // *** IMPORTANT: Use field name "photos" for backend compatibility ***
      if (selectedPhoto) {
        apiFormData.append("photos", selectedPhoto);
      }

      await api.pet.createPet(apiFormData);

      setFormSuccess(true);
      let toastTitle = "";
      let toastMessage = "";
      switch (activeTab) {
        case "lost":
          toastTitle = "Lost pet registered successfully";
          toastMessage = "Your lost pet info is now public. We hope it's found soon!";
          break;
        case "found":
          toastTitle = "Found pet registered successfully";
          toastMessage = "Thank you for registering the found pet. This will help the owner find it.";
          break;
        default:
          toastTitle = "Pet registered for adoption";
          toastMessage = "Your pet is now available for adoption. Thank you for helping!";
      }
      toast({
        title: toastTitle,
        description: toastMessage,
      });

      setTimeout(() => {
        navigate("/pets");
      }, 2000);
    } catch (error) {
      console.error("Error registering pet:", error);
      toast({
        title: "Error registering pet",
        description: error instanceof Error ? error.message : "There was an error registering the pet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-md p-4 h-screen flex flex-col items-center justify-center">
        <Card className="w-full p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-neutral-600">Please wait while we load your session.</p>
        </Card>
      </div>
    );
  }

  if (formSuccess) {
    let successTitle = "";
    let successMessage = "";
    switch (activeTab) {
      case "lost":
        successTitle = "Lost pet registered!";
        successMessage = "The info about your lost pet is now visible to help find it.";
        break;
      case "found":
        successTitle = "Found pet registered!";
        successMessage = "Thank you for registering this found pet. This will help the owner locate it.";
        break;
      default:
        successTitle = "Pet registered!";
        successMessage = "Your pet is now available for adoption on our platform.";
    }
    return (
      <div className="container mx-auto max-w-md p-4 h-screen flex flex-col items-center justify-center">
        <Card className="w-full p-6 text-center space-y-4">
          <div className="mx-auto bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center">
            <PawPrint className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">{successTitle}</h1>
          <p className="text-neutral-600">{successMessage}</p>
          <Button
            className="bg-primary hover:bg-primary/90 w-full mt-4"
            onClick={() => navigate("/pets")}
          >
            See all pets
          </Button>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-md p-4 h-screen flex flex-col items-center justify-center">
        <Card className="w-full p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">Please Log In</h1>
          <p className="text-neutral-600">
            You need to be logged in to register a pet.
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 w-full mt-4"
            onClick={() => navigate("/auth/login")}
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4 pb-20">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-2 flex items-center text-neutral-600"
          onClick={() => navigate("/pets")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-2 mb-1">
          <PawPrint className="h-5 w-5 text-pink-600" />
          <h1 className="text-2xl font-bold">Register pet</h1>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger
            value="adoption"
            className="flex items-center justify-center py-3"
          >
            <div className="flex flex-col items-center space-y-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Adoption</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="lost"
            className="flex items-center justify-center py-3"
          >
            <div className="flex flex-col items-center space-y-1">
              <Search className="h-4 w-4" />
              <span className="text-xs">Lost</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="found"
            className="flex items-center justify-center py-3"
          >
            <div className="flex flex-col items-center space-y-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Found</span>
            </div>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2 mb-1">
          {activeTab === "adoption" && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-0 px-2.5 py-0.5">
              Available for adoption
            </Badge>
          )}
          {activeTab === "lost" && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-0 px-2.5 py-0.5">
              Lost pet
            </Badge>
          )}
          {activeTab === "found" && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0 px-2.5 py-0.5">
              Found pet
            </Badge>
          )}
        </div>
        <p className="text-neutral-600 my-3">
          {activeTab === "adoption" &&
            "Fill out the info of the pet you want to put up for adoption. The more info you provide, the higher the chances of finding a loving home."}
          {activeTab === "lost" &&
            "Enter the details of your lost pet. This will help the community find and return it to you."}
          {activeTab === "found" &&
            "Register info about a pet you found. This will help the owner find and rescue it."}
        </p>
      </Tabs>
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="petStatus" value={activeTab} />
            <div className="space-y-2">
              <Label htmlFor="petName">Pet name *</Label>
              <Input
                id="petName"
                name="petName"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
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
                <Label htmlFor="petBreed">Breed</Label>
                <Input
                  id="petBreed"
                  name="petBreed"
                  placeholder="Ex: Labrador, Mixed, Persian"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petEyeColor">Eye color</Label>
                <Select name="petEyeColor">
                  <SelectTrigger id="petEyeColor">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="heterochromia">Heterochromia (different colors)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
            <div className="space-y-2">
              <Label htmlFor="petDescription">
                {activeTab === "adoption"
                  ? `About ${petName || "the pet"} for adoption *`
                  : "Description *"}
              </Label>
              <Textarea
                id="petDescription"
                name="petDescription"
                placeholder={
                  activeTab === "adoption"
                    ? "Tell about personality, temperament, favorite play, is it sociable with other pets and kids, health/vaccine history..."
                    : activeTab === "lost"
                    ? "Describe the lost pet: where last seen, physical traits, behavior, collar/accessories..."
                    : "Describe the found pet: where found, health, behavior, collar/chip..."
                }
                required
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adoptionInfo">
                {activeTab === "adoption" ? "Adoption info" : "Useful info"}
              </Label>
              <Textarea
                id="adoptionInfo"
                name="adoptionInfo"
                placeholder={
                  activeTab === "adoption"
                    ? "Adoption requirements, interview process, if neutered/vaccinated, special care, ID chip..."
                    : activeTab === "lost"
                    ? "Info to help identify: known commands, favorite toys, habits, fears, favorite foods..."
                    : "Info for owner to recognize: how the pet reacted when found, hungry/thirsty, injuries, behavior..."
                }
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="petPhoto">Pet photo</Label>
              <div
                className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => photoInputRef.current?.click()}
              >
                {!photoPreview ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <PawPrint className="h-10 w-10 text-pink-400" />
                    <p className="text-sm text-neutral-500">
                      Click to add a pet photo
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
            <Button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 ${
                activeTab === "adoption"
                  ? "bg-pink-500 hover:bg-pink-600"
                  : activeTab === "lost"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={isSubmitting}
            >
              {activeTab === "adoption" && <Heart className="h-4 w-4" />}
              {activeTab === "lost" && <Search className="h-4 w-4" />}
              {activeTab === "found" && <MapPin className="h-4 w-4" />}
              {isSubmitting
                ? "Registering..."
                : activeTab === "adoption"
                ? "Register pet for adoption"
                : activeTab === "lost"
                ? "Register lost pet"
                : "Register found pet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}