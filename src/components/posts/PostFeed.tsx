import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import UserLevelBadge from '@/components/user/UserLevelBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: number;
  userId: number;
  username: string;
  userName?: string;
  userPhotoUrl?: string;
  userLevel?: string;
  content: string;
  mediaUrls?: string[];
  location?: any;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFavorite?: boolean;
  likes?: number;
  comments?: number;
}

interface PostFeedProps {
  limit?: number;
  userId?: number;
  showUserInfo?: boolean;
  className?: string;
}

export default function PostFeed({ 
  limit = 10, 
  userId, 
  showUserInfo = true,
  className = ""
}: PostFeedProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // Query for posts (simulate/demo: no backend interaction)
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/posts', { page, limit, userId }],
    enabled: false, // Disable auto-fetch, simulate data
    queryFn: async () => {
      // Simulate demo data
      return {
        data: [
          {
            id: 1,
            userId: 1,
            username: "johndoe",
            userName: "John Doe",
            userPhotoUrl: "",
            userLevel: "Beginner",
            content: "This is a demo post.",
            mediaUrls: [],
            location: { address: "New York, NY" },
            likesCount: 5,
            commentsCount: 2,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            isLiked: false,
            isSaved: false,
            isFavorite: false,
            likes: 5,
            comments: 2,
          }
        ],
        pagination: {
          page,
          pages: 1,
        }
      };
    }
  });

  // Like a post (demo only)
  const likePost = (postId: number) => {
    if (!user) {
      toast({
        title: "Restricted action",
        description: "Please sign in to like this post.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Liked post (demo)",
      description: "You liked this post (demo only)."
    });
    // In a real app, update state here
  };

  // Go to user profile
  const goToUserProfile = (userId: number) => {
    setLocation(`/profile/${userId}`);
  };

  // Get main image URL of post
  const getPostImageUrl = (post: Post): string => {
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      const url = post.mediaUrls[0];
      return url;
    }
    return 'https://via.placeholder.com/800x800?text=No+image';
  };

  // Format location
  const formatLocation = (location: any): string => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (location.address) return location.address;
    return '';
  };

  // Format post date (English, relative)
  const formatPostDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay > 0) {
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    } else if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    } else {
      return 'just now';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
            <Skeleton className="h-[300px] w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-500">Error loading posts</p>
        <p className="text-sm text-gray-500">{String(error)}</p>
        <button 
          className="mt-3 px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  // No posts
  if (!data?.data || data.data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No posts found</p>
        {user && (
          <p className="text-sm text-primary mt-2">
            Be the first to share something!
          </p>
        )}
      </div>
    );
  }

  // Render post list
  return (
    <div className={`space-y-6 pt-2 ${className}`}>
      {data.data.map((post: Post) => (
        <Card key={post.id} className="border-0 shadow-sm overflow-hidden">
          {/* Post header */}
          {showUserInfo && (
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar 
                  className="h-10 w-10 mr-3 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => goToUserProfile(post.userId)}
                >
                  <AvatarImage 
                    src={post.userPhotoUrl || `https://i.pravatar.cc/150?img=${post.userId}`} 
                    alt={post.userName || post.username || 'User'} 
                  />
                  <AvatarFallback>
                    {(post.userName || post.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="font-medium cursor-pointer hover:text-primary transition-colors" 
                      onClick={() => goToUserProfile(post.userId)}
                    >
                      {post.userName || post.username || 'User'}
                    </span>
                    <UserLevelBadge level={post.userLevel || "Beginner"} compact={true} />
                  </div>
                  {post.location && (
                    <div className="text-xs text-gray-500">
                      {formatLocation(post.location)}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatPostDate(post.createdAt)}
              </div>
            </div>
          )}

          {/* Post image */}
          <div className="w-full max-h-[500px] overflow-hidden">
            <img 
              src={getPostImageUrl(post)}
              alt={`Post by ${post.username}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                const currentSrc = target.src;
                if (currentSrc.includes('placeholder.com')) {
                  return;
                }
                target.src = 'https://via.placeholder.com/800x800?text=Image+not+available';
              }}
            />
          </div>

          {/* Post content */}
          <div className="p-4">
            <p className="text-gray-800">{post.content}</p>
          </div>

          {/* Post actions */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-4">
                <button 
                  className={`p-2 ${post.isLiked ? 'text-[#F5821D]' : 'text-gray-700'} hover:text-[#F5821D] transition-colors`}
                  onClick={() => likePost(post.id)}
                  aria-label="Like"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill={post.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={post.isLiked ? "0" : "1.5"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318 1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-700 hover:text-[#CE97E8] transition-colors"
                  aria-label="Comment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-700 hover:text-[#0BDEC2] transition-colors"
                  aria-label="Share"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
              <button 
                className={`p-2 ${post.isFavorite ? 'text-[#EDD224]' : 'text-gray-700'} hover:text-[#EDD224] transition-colors`}
                aria-label="Favorite"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill={post.isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={post.isFavorite ? "0" : "1.5"}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            {/* Like count */}
            {post.likes > 0 && (
              <div className="text-sm font-medium">
                {post.likes} {post.likes === 1 ? 'like' : 'likes'}
              </div>
            )}
            {/* Comment count */}
            {post.comments > 0 && (
              <button className="text-sm text-gray-500 mt-1">
                View {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>
        </Card>
      ))}
      {/* Simple pagination */}
      {data.pagination && (
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className={`px-4 py-2 rounded-md ${
              page === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            Previous
          </button>
          <span className="py-2">
            Page {page} of {data.pagination.pages}
          </span>
          <button
            disabled={page === data.pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className={`px-4 py-2 rounded-md ${
              page === data.pagination.pages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}