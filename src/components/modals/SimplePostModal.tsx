import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SimplifiedPostForm from "./SimplifiedPostForm";

interface SimplePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function SimplePostModal({ 
  open, 
  onOpenChange,
  onSuccess 
}: SimplePostModalProps) {

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-secondary">Quick New Post</DialogTitle>
        </DialogHeader>
        <SimplifiedPostForm 
          onClose={handleClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}