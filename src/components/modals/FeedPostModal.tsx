import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Camera, Gift, Video, MapPin, Lock, Globe, ImageIcon } from "lucide-react";

interface FeedPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function FeedPostModal({ open, onOpenChange, onSuccess }: FeedPostModalProps) {
  const [mediaType, setMediaType] = useState<"image" | "gif" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const resetForm = () => {
    setMediaType("image");
    setFile(null);
    setPreviewUrl(null);
    setDescription("");
    setIsPublic(true);
    setLocation("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Attention",
        description: "You need to add an image or GIF to post.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    // Backend interaction removed
    setTimeout(() => {
      toast({
        title: "Demo Post Created",
        description: "This is a demo. No post was sent to a server.",
      });
      handleClose();
      setIsSubmitting(false);
    }, 1200);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-secondary">New Feed Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* ...UI elements as before... */}
          <DialogFooter className="sm:justify-between gap-2 mt-6 flex items-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="rounded-full border-purple-light hover:bg-purple-bg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !file} 
              className="rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}