import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, MapPin, ArrowLeft, Globe, Lock, Camera, Image, Video, X } from "lucide-react";
import { useLocation } from "wouter";
import MediaCaptureModal from "@/components/modals/MediaCaptureModal";
import OptimizedImage from "@/components/media/OptimizedImage";
import api from "@/lib/api"; // Import your API module

export default function CreatePostPage() {
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "gif" | "video">("image");
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  const goBack = () => {
    navigate("/");
  };

  const handleMediaSelected = async (url: string, type: "image" | "gif" | "video") => {
    // This is for media captured from camera/modal, not file input. You can expand this if your modal supports file objects.
    setMediaPreviewUrl(url);
    setMediaType(type);
    setMediaFile(null); // Make sure to clear file input
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
      if (file.type.startsWith("image/")) {
        setMediaType(file.type === "image/gif" ? "gif" : "image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file.",
          variant: "destructive",
        });
        setMediaFile(null);
        setMediaPreviewUrl(null);
      }
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mediaFile) {
      toast({
        title: "Attention",
        description: "You need to add a photo or video to publish.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("media", mediaFile);
      formData.append("content", description);
      formData.append("mediaType", mediaType);
      formData.append("visibilityType", isPublic ? "public" : "private");
      formData.append("postType", "regular");
      formData.append("isStory", "false");
      if (location) {
        formData.append("location", location);
      }

      // Submit post using the API
      await api.post.createPost(formData);

      toast({
        title: "Post created",
        description: "Your post was created successfully!",
      });

      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack} 
            className="rounded-full hover:bg-orange-50 text-orange-600"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-gray-800">New Post</h1>
        </div>
        <Button 
          disabled={isSubmitting || !mediaFile} 
          onClick={handleSubmit}
          variant="default"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 rounded-full shadow-sm transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Publishing</span>
            </div>
          ) : "Publish"}
        </Button>
      </header>

      <div className="max-w-2xl mx-auto w-full p-4 md:pt-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 flex items-center border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mr-3 shadow-sm">
              {user?.profileImage ? (
                <OptimizedImage 
                  src={user.profileImage} 
                  alt={user.username || "Profile"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.username || "User"}</p>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center text-xs font-medium mt-0.5 transition-colors"
                style={{color: isPublic ? '#059669' : '#4B5563'}}
              >
                {isPublic ? (
                  <>
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    <span>Private</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            {mediaPreviewUrl ? (
              <div className="relative bg-black/5">
                {mediaType === "video" ? (
                  <div className="relative aspect-square">
                    <video 
                      src={mediaPreviewUrl} 
                      className="w-full h-full object-contain bg-black/5"
                      controls
                    />
                    <button 
                      onClick={removeMedia}
                      className="absolute top-3 right-3 z-10 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Remove media"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-square">
                    <OptimizedImage 
                      src={mediaPreviewUrl} 
                      alt="Post preview" 
                      className="w-full h-full object-contain bg-gray-50"
                    />
                    <button 
                      onClick={removeMedia}
                      className="absolute top-3 right-3 z-10 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Remove media"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={handleGalleryClick}
                className="aspect-square flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white cursor-pointer hover:from-orange-100/50 transition-all duration-300"
              >
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-3 shadow-sm">
                    <Camera size={32} className="text-orange-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
                    <Image size={16} className="text-orange-600" />
                  </div>
                </div>
                <p className="text-gray-800 font-semibold text-base">Add Photo or Video</p>
                <p className="text-gray-500 text-sm mt-1">Tap to capture or select from gallery</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="mb-4">
              <Textarea
                placeholder="Write a caption for your post..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-orange-400 text-gray-800 transition-colors bg-white/80 placeholder-gray-400 h-24"
              />
            </div>
            
            <div className="flex items-center rounded-xl border border-gray-200 px-3 py-2.5 mb-4 hover:border-orange-400 transition-colors focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
              <MapPin className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="border-0 p-0 focus-visible:ring-0 text-gray-800 bg-transparent w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`rounded-xl transition-all h-12 ${
                  isPublic 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-transparent' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-orange-50'
                }`}
              >
                <Globe className={`h-4 w-4 mr-2 ${isPublic ? 'text-white' : 'text-gray-500'}`} />
                <span>Public</span>
              </Button>
              
              <Button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`rounded-xl transition-all h-12 ${
                  !isPublic 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-transparent' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-orange-50'
                }`}
              >
                <Lock className={`h-4 w-4 mr-2 ${!isPublic ? 'text-white' : 'text-gray-500'}`} />
                <span>Private</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your post will be visible to {isPublic ? 'all users' : 'only your followers'}</p>
        </div>
      </div>

      <MediaCaptureModal
        open={isCaptureModalOpen}
        onOpenChange={setIsCaptureModalOpen}
        onMediaSelected={handleMediaSelected}
      />
    </div>
  );
}