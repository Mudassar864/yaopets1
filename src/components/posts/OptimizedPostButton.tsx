import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import OptimizedPostModal from '@/components/modals/OptimizedPostModal';

interface OptimizedPostButtonProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  onPostCreated?: () => void;
}

export default function OptimizedPostButton({
  className = '',
  style,
  label = "New Post",
  onPostCreated
}: OptimizedPostButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePostSuccess = () => {
    if (onPostCreated) {
      onPostCreated();
    }
  };

  return (
    <>
      <Button
        className={`rounded-full flex items-center gap-2 ${className}`}
        style={style}
        onClick={() => setIsModalOpen(true)}
      >
        <Plus size={18} />
        {label}
      </Button>

      <OptimizedPostModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handlePostSuccess}
      />
    </>
  );
}