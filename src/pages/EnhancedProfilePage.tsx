import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CreatePostModal from "@/components/modals/CreatePostModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/ui/profile/ProfileHeader";
import ProfileStats from "@/components/ui/profile/ProfileStats";
import ProfileGamification from "@/components/ui/profile/ProfileGamification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { FaPaw } from "react-icons/fa";
import { MessageCircle, Send, Bookmark } from "lucide-react";
import OptimizedImage from "@/components/media/OptimizedImage";
import CommentSection from "@/components/comments/CommentSection";
import CommentsModal from "@/components/comments/CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "@/lib/api";

// TypeScript Interfaces
interface Profile {
  id: number;
  username: string;
  name?: string;
  bio?: string;
  website?: string;
  city?: string;
  profileImage?: string;
  points?: number;
  level?: string;
  achievementBadges?: string[];
  userType?: string;
}

interface Post {
  id: number;
  userId: number;
  content: string;
  mediaUrls: string[];
  mediaType: "image" | "gif" | "video";
  location: { address: string } | null;
  visibilityType: "public" | "private";
  postType: string;
  isStory: boolean;
  user: {
    id: number;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface Follower {
  id: number;
  username: string;
  profileImage?: string;
}

export default function EnhancedProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser, logout } = useAuth();
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [activeView, setActiveView] = useState<"posts" | "followers" | "following" | "friends">("posts");
  const [selectedTab, setSelectedTab] = useState("posts");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const isOwnProfile = !id || (user && String(id) === String(user.id));

  // State with proper types
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [relationshipCounts, setRelationshipCounts] = useState({
    followerCount: 0,
    followingCount: 0,
    friendsCount: 0,
  });
  const [followingStatus, setFollowingStatus] = useState<{ isFollowing: boolean }>({ isFollowing: false });

  // Fetch data with proper error handling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = isOwnProfile ? user?.id : id;
        if (!userId) throw new Error("No user ID provided");

        // Fetch all data concurrently
        const [profileRes, postsRes, followersRes, followingRes, savedRes] = await Promise.all([
          api.user.getProfile(userId).catch(() => null),
          api.user.getUserPosts(userId).catch(() => ({ data: [] })),
          api.user.getFollowers(userId).catch(() => ({ data: [] })),
          api.user.getFollowing(userId).catch(() => ({ data: [] })),
          isOwnProfile ? api.user.getSavedPosts().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);

        if (!profileRes) {
          throw new Error("User not found");
        }

        setProfileData(profileRes.data);
        setPosts(
          postsRes.data.map((post: Post) => ({
            ...post,
            isLiked: post.isLiked,
            isSaved: post.isSaved,
          }))
        );
        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
        setSavedPosts(savedRes.data);
        setRelationshipCounts({
          followerCount: followersRes.data.length,
          followingCount: followingRes.data.length,
          friendsCount: 0,
        });

        if (!isOwnProfile && user) {
          setFollowingStatus({
            isFollowing: followersRes.data.some((f: Follower) => String(f.id) === String(user.id)),
          });
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast({
            title: "User not found",
            description: "The requested user profile does not exist",
            variant: "destructive",
          });
          setLocation("/");
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, isOwnProfile]);

  // Editing handlers
  const handleEditBio = () => {
    setNewBio(profileData?.bio || "");
    setIsEditingBio(true);
  };
  const handleSaveBio = async () => {
    if (isOwnProfile && user) {
      try {
        await api.user.updateProfile({ bio: newBio });
        setProfileData((prev) => (prev ? { ...prev, bio: newBio } : prev));
        updateUser({ bio: newBio });
        setIsEditingBio(false);
        toast({ title: "Profile updated", description: "Bio updated successfully!" });
      } catch {
        toast({ title: "Error", description: "Failed to update bio", variant: "destructive" });
      }
    }
  };

  const handleEditName = () => {
    setNewName(profileData?.name || "");
    setIsEditingName(true);
  };
  const handleSaveName = async () => {
    if (isOwnProfile && user) {
      try {
        await api.user.updateProfile({ name: newName });
        setProfileData((prev) => (prev ? { ...prev, name: newName } : prev));
        updateUser({ name: newName });
        setIsEditingName(false);
        toast({ title: "Profile updated", description: "Name updated successfully!" });
      } catch {
        toast({ title: "Error", description: "Failed to update name", variant: "destructive" });
      }
    }
  };

  const handleEditCity = () => {
    setNewCity(profileData?.city || "");
    setIsEditingCity(true);
  };
  const handleSaveCity = async () => {
    if (isOwnProfile && user) {
      try {
        await api.user.updateProfile({ city: newCity });
        setProfileData((prev) => (prev ? { ...prev, city: newCity } : prev));
        updateUser({ city: newCity });
        setIsEditingCity(false);
        toast({ title: "Profile updated", description: "City updated successfully!" });
      } catch {
        toast({ title: "Error", description: "Failed to update city", variant: "destructive" });
      }
    }
  };

  const handleEditWebsite = () => {
    setNewWebsite(profileData?.website || "");
    setIsEditingWebsite(true);
  };
  const handleSaveWebsite = async () => {
    if (isOwnProfile && user) {
      try {
        await api.user.updateProfile({ website: newWebsite });
        setProfileData((prev) => (prev ? { ...prev, website: newWebsite } : prev));
        updateUser({ website: newWebsite });
        setIsEditingWebsite(false);
        toast({ title: "Profile updated", description: "Website updated successfully!" });
      } catch {
        toast({ title: "Error", description: "Failed to update website", variant: "destructive" });
      }
    }
  };

  // Update profile photo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    if (isOwnProfile && user) {
      try {
        const res = await api.user.updateProfileImage(formData);
        setProfileData((prev) => (prev ? { ...prev, profileImage: res.data.url } : prev));
        updateUser({ profileImage: res.data.url });
        toast({ title: "Profile updated", description: "Profile photo updated!" });
        setIsPhotoDialogOpen(false);
      } catch {
        toast({ title: "Error", description: "Failed to update profile photo", variant: "destructive" });
      }
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/auth/login");
    } catch {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  // Follow/unfollow
  const handleFollowToggle = async () => {
    if (!user || !profileData) return;
    try {
      if (followingStatus.isFollowing) {
        await api.user.unfollowUser(id!);
        setFollowingStatus({ isFollowing: false });
        setRelationshipCounts((prev) => ({
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1),
        }));
        setFollowers((prev) => prev.filter((f) => String(f.id) !== String(user.id)));
        toast({ title: "Unfollowed", description: `You are no longer following ${profileData.name}` });
      } else {
        await api.user.followUser(id!);
        setFollowingStatus({ isFollowing: true });
        setRelationshipCounts((prev) => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));
        setFollowers((prev) => [...prev, { id: user.id, username: user.username, profileImage: user.profileImage }]);
        toast({ title: "Following", description: `You are now following ${profileData.name}` });
      }
    } catch {
      toast({ title: "Error", description: "Could not update follow status", variant: "destructive" });
    }
  };

  // Message user
  const handleMessageUser = () => {
    if (!user || !profileData) return;
    setLocation(`/chat/${profileData.id}`);
  };

  // Like/unlike post
  const toggleLike = async (postId: number) => {
    if (!user) {
      toast({ title: "Login required", description: "Login to like posts", variant: "destructive" });
      setLocation("/auth/login");
      return;
    }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      const newIsLiked = !post.isLiked;
      if (newIsLiked) {
        await api.post.likePost(postId);
      } else {
        await api.post.unlikePost(postId);
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: newIsLiked, likesCount: newIsLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1) }
            : p
        )
      );
    } catch {
      toast({ title: "Error", description: "Could not update like", variant: "destructive" });
    }
  };

  // Save/unsave post
  const toggleSave = async (postId: number) => {
    if (!user) {
      toast({ title: "Login required", description: "Login to save posts", variant: "destructive" });
      setLocation("/auth/login");
      return;
    }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      const newIsSaved = !post.isSaved;
      if (newIsSaved) {
        await api.post.savePost(postId);
        setSavedPosts((prev) => [...prev, post]);
      } else {
        await api.post.unsavePost(postId);
        setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      }
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isSaved: newIsSaved } : p)));
    } catch {
      toast({ title: "Error", description: "Could not update saved post", variant: "destructive" });
    }
  };

  // User type label
  const getUserTypeLabel = (type?: string) => {
    switch (type) {
      case "tutor":
        return "Tutor";
      case "doador":
        return "Donor";
      case "voluntário":
        return "Volunteer";
      case "veterinário":
        return "Veterinarian";
      default:
        return type || "User";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-600">User not found</p>
      </div>
    );
  }

  // Helper to determine if current tab is user's own posts or saved posts
  const isMyPostsTab = selectedTab === "posts" && isOwnProfile;
  const isMySavedTab = selectedTab === "saved" && isOwnProfile;

  return (
    <div className="app-container bg-neutral-50">
      <Header title={isOwnProfile ? "My Profile" : "Profile"} showFilters={false} showBack={!isOwnProfile} />

      <main className={activeView === "posts" ? "pb-16" : "pb-4"}>
        <ProfileHeader
          profileData={profileData}
          isOwnProfile={isOwnProfile}
          isEditingName={isEditingName}
          isEditingCity={isEditingCity}
          isEditingBio={isEditingBio}
          isEditingWebsite={isEditingWebsite}
          newName={newName}
          newCity={newCity}
          newBio={newBio}
          newWebsite={newWebsite}
          isPhotoDialogOpen={isPhotoDialogOpen}
          setIsPhotoDialogOpen={setIsPhotoDialogOpen}
          handleEditName={handleEditName}
          handleEditCity={handleEditCity}
          handleEditBio={handleEditBio}
          handleEditWebsite={handleEditWebsite}
          handleSaveName={handleSaveName}
          handleSaveCity={handleSaveCity}
          handleSaveBio={handleSaveBio}
          handleSaveWebsite={handleSaveWebsite}
          setNewName={setNewName}
          setNewCity={setNewCity}
          setNewBio={setNewBio}
          setNewWebsite={setNewWebsite}
          setIsEditingName={setIsEditingName}
          setIsEditingCity={setIsEditingCity}
          setIsEditingBio={setIsEditingBio}
          setIsEditingWebsite={setIsEditingWebsite}
          followingStatus={followingStatus}
          handleFollowToggle={handleFollowToggle}
          handleMessageUser={handleMessageUser}
          handleLogout={handleLogout}
          followUser={{ isPending: false }}
          unfollowUser={{ isPending: false }}
          updateProfile={{ isPending: false }}
          getUserTypeLabel={getUserTypeLabel}
        />

        <div className="px-4 mt-4">
          <ProfileStats
            relationshipCounts={relationshipCounts}
            pets={[]} // Removed pets, pass empty array
            savedPosts={savedPosts}
            activeView={activeView}
            handleViewChange={setActiveView}
          />

          <div className="mb-4">
            <ProfileGamification
              points={profileData.points || 0}
              level={profileData.level || "Beginner"}
              badges={profileData.achievementBadges || []}
            />
          </div>

          {activeView === "posts" ? (
            <div className="space-y-4">
              <Tabs value={selectedTab} className="w-full" onValueChange={setSelectedTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="posts" className="flex-1">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex-1">
                    Saved
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <Card key={post.id} className="border-0 shadow-none">
                        <div className="p-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar
                              className="h-8 w-8 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => post.user.id && setLocation(`/profile/${post.user.id}`)}
                            >
                              {post.user.profileImage ? (
                                <AvatarImage src={post.user.profileImage} alt={post.user.username} />
                              ) : (
                                <AvatarFallback>{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <span
                              className="font-medium text-sm cursor-pointer hover:text-orange-500 transition-colors"
                              onClick={() => post.user.id && setLocation(`/profile/${post.user.id}`)}
                            >
                              {post.user.username}
                            </span>
                          </div>
                        </div>

                        {post.mediaUrls.length > 0 && post.mediaUrls[0] ? (
                          <div className="w-full">
                            {post.mediaType === "video" ? (
                              <video src={post.mediaUrls[0]} controls className="w-full h-auto object-cover" />
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

                        {/* Only show like/comment/save if NOT own profile */}
                        {!isOwnProfile && (
                          <div className="p-3">
                            <div className="flex justify-between mb-2">
                              <div className="flex space-x-4">
                                <button
                                  onClick={() => toggleLike(post.id)}
                                  aria-label={post.isLiked ? "Unlike post" : "Like post"}
                                >
                                  <FaPaw className={`h-6 w-6 ${post.isLiked ? "text-orange-500" : "text-black"}`} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPostId(post.id);
                                    setIsCommentsModalOpen(true);
                                  }}
                                  aria-label="View comments"
                                >
                                  <MessageCircle size={24} className="fill-black" />
                                </button>
                                <button aria-label="Share post">
                                  <Send size={24} className="fill-black" />
                                </button>
                              </div>
                              <button
                                onClick={() => toggleSave(post.id)}
                                aria-label={post.isSaved ? "Unsave post" : "Save post"}
                              >
                                <Bookmark
                                  size={24}
                                  className={`transition-colors ${
                                    post.isSaved ? "text-orange-500 fill-orange-500" : "text-black"
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="font-semibold text-sm mb-1">{post.likesCount} likes</div>
                            <div className="mb-1">
                              <span className="font-medium text-sm mr-1">{post.user.username}</span>
                              <span className="text-sm">{post.content}</span>
                            </div>
                            <div className="text-gray-400 text-xs mb-2">
                              {formatDistanceToNow(new Date(post.createdAt), { locale: ptBR, addSuffix: true })}
                            </div>
                            <CommentSection
                              postId={post.id}
                              commentsCount={post.commentsCount}
                              onCommentsCountChange={(count) =>
                                setPosts((prev) =>
                                  prev.map((p) => (p.id === post.id ? { ...p, commentsCount: count } : p))
                                )
                              }
                              initialComments={[]}
                            />
                          </div>
                        )}
                        {/* For own posts, just show basic info (already above) */}
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <p className="text-neutral-600">No posts yet</p>
                      {isOwnProfile && (
                        <Button className="mt-3" onClick={() => setCreatePostModalOpen(true)}>
                          Create Post
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  {savedPosts.length > 0 ? (
                    <div className="space-y-4">
                      {savedPosts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {post.mediaUrls && post.mediaUrls.length > 0 ? (
                            post.mediaType === "video" ? (
                              <video src={post.mediaUrls[0]} controls className="w-full h-48 object-cover" />
                            ) : (
                              <img src={post.mediaUrls[0]} alt="Post" className="w-full h-48 object-cover" />
                            )
                          ) : (
                            <div className="w-full h-48 bg-neutral-200 flex items-center justify-center">
                              <span className="material-icons text-neutral-400 text-4xl">image</span>
                            </div>
                          )}
                          <div className="p-4">
                            <p className="text-sm">{post.content}</p>
                          </div>
                          {/* No like/comment/save for saved posts */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <p className="text-neutral-600">No saved posts</p>
                      <p className="text-xs text-neutral-500 mt-1">Save posts by tapping the bookmark icon</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : activeView === "followers" ? (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Followers</h3>
              {followers.length > 0 ? (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <div key={follower.id} className="flex items-center">
                      <Avatar
                        className="h-8 w-8 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLocation(`/profile/${follower.id}`)}
                      >
                        {follower.profileImage ? (
                          <AvatarImage src={follower.profileImage} alt={follower.username} />
                        ) : (
                          <AvatarFallback>{follower.username.charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <span
                        className="font-medium text-sm cursor-pointer hover:text-orange-500 transition-colors"
                        onClick={() => setLocation(`/profile/${follower.id}`)}
                      >
                        {follower.username}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500">No followers yet</p>
              )}
            </div>
          ) : activeView === "following" ? (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Following</h3>
              {following.length > 0 ? (
                <div className="space-y-3">
                  {following.map((followed) => (
                    <div key={followed.id} className="flex items-center">
                      <Avatar
                        className="h-8 w-8 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLocation(`/profile/${followed.id}`)}
                      >
                        {followed.profileImage ? (
                          <AvatarImage src={followed.profileImage} alt={followed.username} />
                        ) : (
                          <AvatarFallback>{followed.username.charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <span
                        className="font-medium text-sm cursor-pointer hover:text-orange-500 transition-colors"
                        onClick={() => setLocation(`/profile/${followed.id}`)}
                      >
                        {followed.username}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500">Not following anyone yet</p>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update profile photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <label
                htmlFor="profile-photo-upload"
                className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition"
              >
                Select image
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPostId && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          postId={selectedPostId}
          commentsCount={posts.find((p) => p.id === selectedPostId)?.commentsCount || 0}
          onCommentsCountChange={(count: number) =>
            setPosts((prev) =>
              prev.map((p) => (p.id === selectedPostId ? { ...p, commentsCount: count } : p))
            )
          }
          initialComments={[]}
        />
      )}

      {activeView === "posts" && <BottomNavigation />}
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} />
    </div>
  );
}