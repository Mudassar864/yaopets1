import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Image, X } from "lucide-react";

export default function SimplifiedPostCreator() {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 10MB max
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum image size is 10MB",
          variant: "destructive"
        });
        return;
      }

      // Only images
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Unsupported format",
          description: "Please select only images",
          variant: "destructive"
        });
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit post (demo, no backend)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to post.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim() && !selectedImage) {
      toast({
        title: "Empty post",
        description: "Add text or an image to post.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);

      toast({
        title: "Post created",
        description: "Your post was shared successfully! (demo only)"
      });

      setIsSubmitting(false);
    }, 900);
  };

  return (
    <Card className="p-4 mb-6 shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Textarea
            placeholder="What do you want to share?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded resize-none"
            rows={3}
          />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mb-4">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-64 object-cover rounded-md"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1"
              onClick={removeImage}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="mr-2"
            >
              <Image size={16} className="mr-2" />
              Add image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
              accept="image/*"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || (!content.trim() && !selectedImage)}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}