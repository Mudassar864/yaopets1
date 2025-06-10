import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SimplifiedPostFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SimplifiedPostForm({ onClose, onSuccess }: SimplifiedPostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Attention",
        description: "Please write something to post.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Attention",
        description: "You need to be logged in to post.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    // Simulate post submission (no backend interaction)
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "Your post was created (demo).",
      });
      setContent("");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      setIsSubmitting(false);
    }, 800);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          placeholder="What are you thinking?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full p-3 border rounded resize-none focus:ring focus:ring-purple-300 focus:outline-none"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button 
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-full bg-primary hover:bg-primary/90 text-white"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </div>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
}