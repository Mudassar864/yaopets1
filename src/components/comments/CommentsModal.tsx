import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CommentItem from "./CommentItem";
import api from "@/lib/api";

// Client-side comment interface
type Comment = {
  id: string | number;
  content: string;
  username: string;
  userPhotoUrl?: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  userId: string | number;
};

type CommentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postId: string | number;
  commentsCount: number;
  onCommentsCountChange?: (count: number) => void;
  initialComments?: Comment[];
};

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  postId,
  commentsCount: initialCommentsCount = 0,
  onCommentsCountChange,
  initialComments = [],
}) => {
  const { user } = useAuth();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(
    initialComments.length || initialCommentsCount
  );
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Fetch comments from backend (api.ts)
  useEffect(() => {
    let ignore = false;
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const { data } = await api.post.getComments(postId as string);
        if (!ignore) {
          setComments(
            (Array.isArray(data) ? data : data?.comments || []).map((comment: any) => ({
              id: comment._id || comment.id,
              content: comment.content,
              username: comment.user?.username || "User",
              userPhotoUrl: comment.user?.profileImage || "",
              createdAt: comment.createdAt,
              likesCount: comment.likesCount || 0,
              isLiked: comment.isLiked ?? false,
              userId: comment.user?._id || comment.userId,
            }))
          );
          setCommentsCount(data?.total || (Array.isArray(data) ? data.length : data?.comments?.length || 0));
        }
      } catch (error) {
        // Optionally handle error
      } finally {
        setIsLoadingComments(false);
      }
    };
    if (isOpen) fetchComments();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [postId, isOpen]);

  // Close modal on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Focus the comment input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 300);
    }
  }, [isOpen, postId]);

  // Submit comment using api.ts
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const response = await api.post.addComment(postId as string, { content: newComment.trim() });
      const comment = response.data;
      const newCommentObj: Comment = {
        id: comment._id || comment.id,
        content: comment.content,
        username: comment.user?.username || user.username || user.name || "You",
        userPhotoUrl: comment.user?.profileImage || user.profileImage || "",
        createdAt: comment.createdAt,
        likesCount: 0,
        isLiked: false,
        userId: comment.user?._id || comment.userId || user.id,
      };
      setComments((prev) => [newCommentObj, ...prev]);
      setCommentsCount((prev) => prev + 1);
      if (onCommentsCountChange) {
        onCommentsCountChange(commentsCount + 1);
      }
      setNewComment("");
      // Scroll to top to show the new comment
      if (commentsContainerRef.current) {
        commentsContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (error) {
      // Optionally show error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like/unlike comment using api.ts
  const handleLikeToggle = async (commentId: string | number, isLiked: boolean) => {
    if (!user) return;
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likesCount: comment.likesCount + (comment.isLiked ? -1 : 1),
          };
        }
        return comment;
      })
    );
    try {
      if (!isLiked) {
        await api.post.likeComment(commentId as string);
      } else {
        await api.post.unlikeComment(commentId as string);
      }
    } catch (error) {
      // Optionally show error, revert UI if necessary
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: isLiked,
              likesCount: comment.likesCount + (isLiked ? 1 : -1),
            };
          }
          return comment;
        })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-[384px] h-[60vh] max-h-[400px] flex flex-col animate-slide-up overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 border-b bg-white shrink-0">
          <h2 className="text-lg font-semibold">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments list */}
        <div
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-white comments-scrollable"
        >
          {isLoadingComments ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 size={28} className="animate-spin mb-2" />
              <p>Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  id={comment.id}
                  content={comment.content}
                  username={comment.username}
                  userPhotoUrl={comment.userPhotoUrl}
                  createdAt={comment.createdAt}
                  likesCount={comment.likesCount}
                  isLiked={comment.isLiked}
                  userId={comment.userId}
                  onLikeToggle={() => handleLikeToggle(comment.id, comment.isLiked)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare size={48} className="mb-2" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* New comment form */}
        <div className="border-t p-4 bg-white shrink-0">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user?.profileImage || ""} />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase() ||
                  user?.name?.charAt(0).toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 relative">
              <Textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[40px] py-2 resize-none rounded-xl pr-20"
              />

              <Button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || isSubmitting || !user}
                className="absolute right-2 bottom-2 h-7 px-2 rounded-full"
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;