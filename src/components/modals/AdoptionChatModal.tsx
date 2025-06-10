import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

interface AdoptionChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: number;
    name: string;
  };
  pet?: {
    id: number;
    name: string;
    description: string;
    location: string;
  };
  item?: {
    id: number;
    title: string;
    description: string;
    location: string;
  };
}

export default function AdoptionChatModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  pet, 
  item 
}: AdoptionChatModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  // Prefill the message based on type (pet or item)
  React.useEffect(() => {
    if (pet) {
      setMessage(`Hello! I'm interested in adopting the pet ${pet.name}.
Location: ${pet.location}
Description: ${pet.description}

Can we talk more about the adoption process?`);
    } else if (item) {
      setMessage(`Hello! I'm interested in the item "${item.title}".
Location: ${item.location}
Description: ${item.description}

Is the item still available?`);
    } else {
      setMessage(`Hi ${targetUser.name}! 

I would like to talk with you about pet adoption or other topics related to the platform.

Looking forward to your reply!`);
    }
  }, [pet, item, targetUser.name]);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "You need to be logged in",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Backend interaction removed
    setTimeout(() => {
      toast({
        title: "Message sent (demo)",
        description: `Your message to ${targetUser.name} would be sent here.`,
      });
      onClose();
      setIsSending(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {pet 
              ? `Adopt ${pet.name}` 
              : item 
              ? `Interested in ${item.title}`
              : "Start conversation"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <p className="text-sm text-neutral-500 mb-2">
            Your message to {targetUser.name}:
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[120px] mb-4"
          />
          
          <p className="text-xs text-neutral-400">
            By sending this message, you will start a conversation with {targetUser.name}.
            (This is a demo – no real message will be sent.)
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {isSending ? "Sending..." : "Send message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}