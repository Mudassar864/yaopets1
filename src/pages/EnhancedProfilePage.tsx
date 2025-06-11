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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import OptimizedImage from "@/components/media/OptimizedImage";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "@/lib/api";

// Types
interface Profile {
  id: string;
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
  _id?: string;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  mediaType: "image" | "gif" | "video";
  location: { address: string } | null;
  visibilityType: "public" | "private";
  postType: string;
  isStory: boolean;
  user: {
    id: string;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  _id?: string;
}

interface Follower {
  id: string;
  username: string;
  profileImage?: string;
  _id?: string;
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
  const [activeView, setActiveView] = useState<
    "posts" | "followers" | "following"
  >("posts");
  const [selectedTab, setSelectedTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [isMessagePending, setIsMessagePending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const isOwnProfile = !id || (user && String(id) === String(user.id));

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
  const [followingStatus, setFollowingStatus] = useState<{
    isFollowing: boolean;
  }>({ isFollowing: false });

  // Load profile and related data
  useEffect(() => {
    if (isOwnProfile && !user) return;
    if (!isOwnProfile && !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = isOwnProfile ? user?.id : id;
        if (!userId) throw new Error("No user ID provided");

        const [profileRes, postsRes, followersRes, followingRes, savedRes] =
          await Promise.all([
            api.user.getProfile(userId).catch(() => null),
            api.user
              .getUserPosts(userId)
              .catch(() => ({ data: { posts: [] } })),
            api.user
              .getFollowers(userId)
              .catch(() => ({ data: { followers: [] } })),
            api.user
              .getFollowing(userId)
              .catch(() => ({ data: { following: [] } })),
            isOwnProfile
              ? api.user.getSavedPosts().catch(() => ({ data: { posts: [] } }))
              : Promise.resolve({ data: { posts: [] } }),
          ]);

        if (!profileRes) {
          throw new Error("User not found");
        }

        setProfileData(profileRes.data);

        setPosts(
          (postsRes.data?.posts || []).map((p: Post) => ({
            ...p,
            id: p.id || p._id,
          }))
        );
        setFollowers(
          (followersRes.data?.followers || []).map((f: Follower) => ({
            ...f,
            id: f.id || f._id,
          }))
        );
        setFollowing(
          (followingRes.data?.following || []).map((f: Follower) => ({
            ...f,
            id: f.id || f._id,
          }))
        );
        setSavedPosts(
          (savedRes.data?.posts || []).map((p: Post) => ({
            ...p,
            id: p.id || p._id,
          }))
        );

        setRelationshipCounts({
          followerCount:
            followersRes.data?.pagination?.total ??
            followersRes.data?.followers?.length ??
            0,
          followingCount:
            followingRes.data?.pagination?.total ??
            followingRes.data?.following?.length ??
            0,
          friendsCount: 0,
        });

        if (!isOwnProfile && user) {
          setFollowingStatus({
            isFollowing: (followersRes.data?.followers || []).some(
              (f: Follower) => String(f.id || f._id) === String(user.id)
            ),
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

  // Show loading if waiting for user (own profile)
  if (isOwnProfile && !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Edit handlers
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
        toast({
          title: "Profile updated",
          description: "Bio updated successfully!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update bio",
          variant: "destructive",
        });
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
        toast({
          title: "Profile updated",
          description: "Name updated successfully!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update name",
          variant: "destructive",
        });
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
        toast({
          title: "Profile updated",
          description: "City updated successfully!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update city",
          variant: "destructive",
        });
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
        setProfileData((prev) =>
          prev ? { ...prev, website: newWebsite } : prev
        );
        updateUser({ website: newWebsite });
        setIsEditingWebsite(false);
        toast({
          title: "Profile updated",
          description: "Website updated successfully!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update website",
          variant: "destructive",
        });
      }
    }
  };

  // Dummy handler to avoid ReferenceError (no upload functionality)
  const handleFileChange = () => {};

  // Optimized follow/unfollow
  const handleFollowToggle = async () => {
    if (!user || !profileData || isFollowPending) return;
    setIsFollowPending(true);
    try {
      const targetId = profileData.id || profileData._id!;
      if (followingStatus.isFollowing) {
        await api.user.unfollowUser(targetId);
        setFollowingStatus({ isFollowing: false });
        setRelationshipCounts((prev) => ({
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1),
        }));
        setFollowers((prev) =>
          prev.filter((f) => String(f.id) !== String(user.id))
        );
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${
            profileData.name || profileData.username
          }`,
        });
      } else {
        await api.user.followUser(targetId);
        setFollowingStatus({ isFollowing: true });
        setRelationshipCounts((prev) => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));
        setFollowers((prev) => [
          ...prev,
          {
            id: user.id,
            username: user.username,
            profileImage: user.profileImage,
          },
        ]);
        toast({
          title: "Following",
          description: `You are now following ${
            profileData.name || profileData.username
          }`,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not update follow status",
        variant: "destructive",
      });
    } finally {
      setIsFollowPending(false);
    }
  };

  // Optimized message handler
  const handleMessageUser = async () => {
    if (profileData?.id) {
      setLocation(`/chat/${profileData.id}`);
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

  return (
    <div className="app-container bg-neutral-50">
      <Header
        title={isOwnProfile ? "My Profile" : "Profile"}
        showFilters={false}
        showBack={!isOwnProfile}
      />

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
          handleLogout={logout}
          followUser={{ isPending: isFollowPending }}
          unfollowUser={{ isPending: isFollowPending }}
          updateProfile={{ isPending: false }}
          getUserTypeLabel={getUserTypeLabel}
        />

        <div className="px-4 mt-4">
          <ProfileStats
            relationshipCounts={relationshipCounts}
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

          {activeView === "posts" && (
            <div className="space-y-4">
              <Tabs
                value={selectedTab}
                className="w-full"
                onValueChange={setSelectedTab}
              >
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="posts" className="flex-1">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex-1">
                    Salvos
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
                              onClick={() =>
                                post.user.id &&
                                setLocation(`/profile/${post.user.id}`)
                              }
                            >
                              {post.user.profileImage ? (
                                <AvatarImage
                                  src={post.user.profileImage}
                                  alt={post.user.username}
                                />
                              ) : (
                                <AvatarFallback>
                                  {post.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span
                              className="font-medium text-sm cursor-pointer hover:text-orange-500 transition-colors"
                              onClick={() =>
                                post.user.id &&
                                setLocation(`/profile/${post.user.id}`)
                              }
                            >
                              {post.user.username}
                            </span>
                          </div>
                        </div>
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
                        <div className="p-3">
                          <div className="font-semibold text-sm mb-1">
                            {post.likesCount} likes
                          </div>
                          <div className="mb-1">
                            <span className="font-medium text-sm mr-1">
                              {post.user.username}
                            </span>
                            <span className="text-sm">{post.content}</span>
                          </div>
                          <div className="text-gray-400 text-xs mb-2">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              locale: ptBR,
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <p className="text-neutral-600">No posts yet</p>
                      {isOwnProfile && (
                        <Button
                          className="mt-3"
                          onClick={() => setCreatePostModalOpen(true)}
                        >
                          Create Post
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="saved" className="space-y-4">
                  {savedPosts.length > 0 ? (
                    savedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden"
                      >
                        {post.mediaUrls && post.mediaUrls.length > 0 ? (
                          post.mediaType === "video" ? (
                            <video
                              src={post.mediaUrls[0]}
                              controls
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <img
                              src={post.mediaUrls[0]}
                              alt="Post"
                              className="w-full h-48 object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-48 bg-neutral-200 flex items-center justify-center">
                            <span className="material-icons text-neutral-400 text-4xl">
                              image
                            </span>
                          </div>
                        )}
                        <div className="p-4">
                          <p className="text-sm">{post.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <p className="text-neutral-600">No saved posts</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Save posts by tapping the bookmark icon
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          {activeView === "followers" && (
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
                          <AvatarImage
                            src={follower.profileImage}
                            alt={follower.username}
                          />
                        ) : (
                          <AvatarFallback>
                            {follower.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
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
          )}
          {activeView === "following" && (
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
                          <AvatarImage
                            src={followed.profileImage}
                            alt={followed.username}
                          />
                        ) : (
                          <AvatarFallback>
                            {followed.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
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
                <p className="text-center text-neutral-500">
                  Not following anyone yet
                </p>
              )}
            </div>
          )}
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

      {activeView === "posts" && <BottomNavigation />}
      <CreatePostModal
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
      />
    </div>
  );
}
