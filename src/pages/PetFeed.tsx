import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  MoreHorizontal,
  MessageCircle,
  Send,
  Bookmark,
  Trash2
} from 'lucide-react';
import { FaPaw } from 'react-icons/fa';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CommentsModal from "@/components/comments/CommentsModal";
import CommentSection from "@/components/comments/CommentSection";
import Header from "../components/layout/Header";
import { generateInitials } from "@/lib/utils";
import OptimizedImage from "@/components/media/OptimizedImage";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string | number;
  username: string;
  profileImage?: string;
}

interface Post {
  id: string | number;
  userId: string | number;
  content: string;
  mediaUrls: string[];
  mediaType: 'image' | 'gif' | 'video';
  location: { address?: string; lat?: number; lng?: number } | null;
  visibilityType: 'public' | 'followers' | 'private';
  postType: 'regular' | 'event' | 'question' | 'story';
  isStory: boolean;
  expiresAt?: Date | null;
  user: {
    id: string | number;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface Comment {
  id: string | number;
  content: string;
  username: string;
  userPhotoUrl?: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  userId: string | number;
}

// Fetch posts from backend
const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await api.post.getPosts();
  const postsArray = Array.isArray(data) ? data : data?.posts || [];
  return postsArray.map((post: any) => ({
    id: post._id || post.id,
    userId: post.userId,
    content: post.content || '',
    mediaUrls: Array.isArray(post.mediaUrls) ? post.mediaUrls : [],
    mediaType: post.mediaType || 'image',
    location: post.location || null,
    visibilityType: post.visibilityType || 'public',
    postType: post.postType || 'regular',
    isStory: post.isStory || false,
    expiresAt: post.expiresAt ? new Date(post.expiresAt) : null,
    user: {
      id: post.user?.id || post.userId,
      username: post.user?.username || 'User',
      profileImage: post.user?.profileImage || '',
    },
    createdAt: post.createdAt || new Date().toISOString(),
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    isLiked: post.isLiked || false,
    isSaved: post.isSaved || false,
  }));
};

export default function PetFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedPostId, setSelectedPostId] = useState<string | number | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [postMenuId, setPostMenuId] = useState<string | number | null>(null); // For MoreHorizontal popup
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null); // For delete confirmation
  const queryClient = useQueryClient();

  // Fetch posts using TanStack Query
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  // Optimistic Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string | number, isLiked: boolean }) => {
      if (isLiked) {
        const { data } = await api.post.unlikePost(postId as string);
        return { isLiked: false, likesCount: data.likesCount ?? 0 };
      } else {
        const { data } = await api.post.likePost(postId as string);
        return { isLiked: true, likesCount: data.likesCount ?? 0 };
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries(['posts']);
      const prevPosts = queryClient.getQueryData<Post[]>(['posts']);
      queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) =>
        oldPosts?.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !isLiked,
                likesCount: post.likesCount + (isLiked ? -1 : 1),
              }
            : post
        )
      );
      return { prevPosts };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['posts'], context?.prevPosts);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  // Optimistic Save/Unsave mutation
  const saveMutation = useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string | number, isSaved: boolean }) => {
      if (isSaved) {
        const { data } = await api.post.unsavePost(postId as string);
        return { isSaved: false };
      } else {
        const { data } = await api.post.savePost(postId as string);
        return { isSaved: true };
      }
    },
    onMutate: async ({ postId, isSaved }) => {
      await queryClient.cancelQueries(['posts']);
      const prevPosts = queryClient.getQueryData<Post[]>(['posts']);
      queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) =>
        oldPosts?.map(post =>
          post.id === postId
            ? { ...post, isSaved: !isSaved }
            : post
        )
      );
      return { prevPosts };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['posts'], context?.prevPosts);
      toast({
        title: "Error",
        description: "Failed to update saved state. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  // Optimistic Delete Post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string | number) => {
      await api.post.deletePost(postId as string);
      return postId;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries(['posts']);
      const prevPosts = queryClient.getQueryData<Post[]>(['posts']);
      queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) =>
        oldPosts?.filter(post => post.id !== postId)
      );
      return { prevPosts };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['posts'], context?.prevPosts);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post was deleted successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  const handleToggleLike = (postId: string | number, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Login to like posts",
        variant: "destructive",
      });
      setLocation("/auth/login");
      return;
    }
    likeMutation.mutate({ postId, isLiked });
  };

  const handleToggleSave = (postId: string | number, isSaved: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Login to save posts",
        variant: "destructive",
      });
      setLocation("/auth/login");
      return;
    }
    saveMutation.mutate({ postId, isSaved });
  };

  const handleDelete = (postId: string | number) => {
    setDeleteConfirmId(postId);
    setPostMenuId(null);
  };

  const confirmDelete = (postId: string | number) => {
    deleteMutation.mutate(postId);
    setDeleteConfirmId(null);
    setPostMenuId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
    setPostMenuId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-14">
      <Header title="YaoPets" showFilters={true} />
      <main className="flex-1 max-w-md mx-auto w-full">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Error loading posts: {(error as Error).message}</p>
            <button
              onClick={() => queryClient.invalidateQueries(['posts'])}
              className="px-4 py-2 bg-orange-500 text-white rounded-full"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No posts available right now.</p>
            <Link href="/create-post">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-full">
                Create a post
              </button>
            </Link>
          </div>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="mb-6 border-0 shadow-none relative">
              {/* Post header */}
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar
                    className="h-8 w-8 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => post.user.id && setLocation(`/profile/${post.user.id}`)}
                  >
                    {post.user.profileImage ? (
                      <AvatarImage src={post.user.profileImage} alt={post.user.username} />
                    ) : (
                      <AvatarFallback>{generateInitials(post.user.username)}</AvatarFallback>
                    )}
                  </Avatar>
                  <span
                    className="font-medium text-sm cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => post.user.id && setLocation(`/profile/${post.user.id}`)}
                  >
                    {post.user.username}
                  </span>
                </div>
                {/* MoreHorizontal for post owner */}
                {user && (user.id === post.userId || user.id === post.user?.id) ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPostMenuId(postMenuId === post.id ? null : post.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreHorizontal size={20} className="text-gray-500" />
                    </button>
                    {postMenuId === post.id && (
                      <div className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md z-10 min-w-[140px]">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 size={16} className="mr-2" /> Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <MoreHorizontal size={20} className="text-gray-500" />
                )}
              </div>
              {/* Delete confirmation dialog */}
              {deleteConfirmId === post.id && (
                <div className="absolute inset-0 bg-black bg-opacity-30 z-20 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center w-8/12">
                    <p className="mb-4 text-center text-red-700 font-semibold">
                      Are you sure you want to delete this post? This action cannot be undone.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmDelete(post.id)}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Post content - image or video */}
              {post.mediaUrls.length > 0 && post.mediaUrls[0] ? (
                <div className="w-full">
                  {post.mediaType === "video" ? (
                    <video
                      src={post.mediaUrls[0]}
                      controls
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <OptimizedImage
                      src={post.mediaUrls[0]}
                      alt="Post content"
                      className="w-full h-auto object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50">
                  <p className="text-lg">{post.content}</p>
                </div>
              )}
              {/* Post actions */}
              <div className="p-3">
                <div className="flex justify-between mb-2">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleToggleLike(post.id, post.isLiked)}
                      aria-label={post.isLiked ? "Unlike" : "Like"}
                      disabled={likeMutation.isLoading && likeMutation.variables?.postId === post.id}
                    >
                      <FaPaw
                        className={`h-6 w-6 ${post.isLiked ? 'text-orange-500' : 'text-black'}`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setIsCommentsModalOpen(true);
                      }}
                    >
                      <MessageCircle size={24} className="fill-black" />
                    </button>
                    <button>
                      <Send size={24} className="fill-black" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleSave(post.id, post.isSaved)}
                    aria-label={post.isSaved ? "Unsave" : "Save"}
                    disabled={saveMutation.isLoading && saveMutation.variables?.postId === post.id}
                  >
                    <Bookmark
                      size={24}
                      className={`transition-colors ${
                        post.isSaved
                          ? 'text-orange-500 fill-orange-500'
                          : 'text-black'
                      }`}
                    />
                  </button>
                </div>
                {/* Likes count */}
                <div className="font-semibold text-sm mb-1">{post.likesCount} likes</div>
                {/* Caption */}
                <div className="mb-1">
                  <span className="font-medium text-sm mr-1">{post.user.username}</span>
                  <span className="text-sm">{post.content}</span>
                </div>
                {/* Post date */}
                <div className="text-gray-400 text-xs mb-2">
                  {(() => {
                    const parsedDate = new Date(post.createdAt);
                    return isNaN(parsedDate.getTime())
                      ? 'Unknown date'
                      : formatDistanceToNow(parsedDate, { locale: ptBR, addSuffix: true });
                  })()}
                </div>
                {/* Comments section */}
                <CommentSection
                  postId={post.id}
                  commentsCount={post.commentsCount}
                  onCommentsCountChange={(count) => {
                    queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) =>
                      oldPosts?.map(p =>
                        p.id === post.id ? { ...p, commentsCount: count } : p
                      )
                    );
                  }}
                  initialComments={[]}
                />
              </div>
            </Card>
          ))
        )}
      </main>
      {/* Comments modal */}
      {selectedPostId && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          postId={selectedPostId}
          commentsCount={posts.find(p => p.id === selectedPostId)?.commentsCount || 0}
          onCommentsCountChange={(count: number) => {
            queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) =>
              oldPosts?.map(p =>
                p.id === selectedPostId ? { ...p, commentsCount: count } : p
              )
            );
          }}
          initialComments={[]}
        />
      )}
    </div>
  );
}