import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import CommentsModal from "./CommentsModal";

type Comment = {
  id: number;
  content: string;
  username: string;
  userPhotoUrl?: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  userId: number;
};

type CommentSectionProps = {
  postId: number;
  commentsCount?: number;
  onCommentsCountChange?: (count: number) => void;
  initialComments?: Comment[];
};

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  commentsCount = 0,
  onCommentsCountChange,
  initialComments = [],
}) => {
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  return (
    <div className="mt-2">
      <p
        onClick={() => setIsCommentsModalOpen(true)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <MessageSquare size={18} className="mr-1" />
        {`View ${commentsCount} comments`}
      </p>

      {/* Modal */}
      {isCommentsModalOpen && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          postId={postId}
          commentsCount={commentsCount}
          onCommentsCountChange={onCommentsCountChange}
          initialComments={initialComments}
        />
      )}
    </div>
  );
};

export default CommentSection;