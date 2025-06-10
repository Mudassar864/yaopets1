import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/media/ImageUploader";

interface OptimizedPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function OptimizedPostModal({ 
  open, 
  onOpenChange,
  onSuccess 
}: OptimizedPostModalProps) {
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const resetForm = () => {
    setDescription("");
    setIsPublic(true);
    setLocation("");
    setMediaUrl("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      toast({
        title: "Attention",
        description: "You must add a photo to publish.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    // Backend interaction removed: simulate post creation
    setTimeout(() => {
      toast({
        title: "Demo Post Created",
        description: "This is a demo. No post was sent to a server.",
      });
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
      setIsSubmitting(false);
    }, 1000);
  };

  // Check session state
  useEffect(() => {
    if (open) {
      if (!isAuthenticated) {
        toast({
          title: "Not authenticated",
          description: "You must be logged in to create a post.",
          variant: "destructive",
        });
        onOpenChange(false);
      }
    }
  }, [open, isAuthenticated, onOpenChange, toast]);

  const handleImageUploaded = (imageUrl: string) => {
    setMediaUrl(imageUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-secondary">Create new post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Visibility options */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPublic(true)}
                className={`flex-1 border rounded-full transition-all text-sm ${isPublic ? 'bg-purple-bg border-purple-light text-secondary' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1.5" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 4.41 3.58 8 8 8 4.41 0 8-3.59 8-8 0-4.42-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                  <path d="M8 3.9a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2zm0 7.2a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2z"/>
                </svg>
                Public
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPublic(false)}
                className={`flex-1 border rounded-full transition-all text-sm ${!isPublic ? 'bg-purple-bg border-purple-light text-secondary' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1.5" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
                Private
              </Button>
            </div>
          </div>

          {/* Optimized image upload */}
          <div className="space-y-2 mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Choose a photo</label>
              <span className="text-xs text-primary font-medium">* Required</span>
            </div>
            
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              maxImages={1}
              showPreview={true}
              previewSize={180}
              buttonText="Choose photo"
              className="w-full"
            />
          </div>

          {/* Location field */}
          <div className="space-y-2 mb-2">
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add your location"
                className="pl-9 border-purple-light focus:border-secondary focus:ring-secondary rounded-full py-2"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              placeholder="Share something about your post..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-purple-light focus:border-secondary focus:ring-secondary rounded-lg resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="rounded-full border-purple-light hover:bg-purple-bg w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !mediaUrl} 
              className="rounded-full bg-primary hover:bg-primary/90 text-white transition-colors w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}