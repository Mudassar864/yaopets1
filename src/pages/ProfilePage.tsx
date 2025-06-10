import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CreatePostModal from "@/components/modals/CreatePostModal";
import AdoptionChatModal from "@/components/modals/AdoptionChatModal";
import GamificationInfo from "@/components/user/GamificationInfo";
import { useAuth } from "@/context/AuthContext";
import { generateInitials } from "@/lib/utils";
import { ExternalLink, Edit2, Check, X, UserPlus, UserMinus, MessageCircle } from "lucide-react";

// --- DUMMY DATA AND LOCAL ONLY (no API calls) ---

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // DUMMY: Only show own profile
  const isOwnProfile = !id || (user && String(id) === String(user.id));

  // Dummy profile data (from localStorage or default)
  const [profileData, setProfileData] = useState<any>(null);
  useEffect(() => {
    let profile = null;
    try {
      const raw = localStorage.getItem("yaopets_local_user");
      if (raw) profile = JSON.parse(raw);
    } catch {}
    setProfileData(
      profile || {
        name: "Alice Johnson",
        city: "New York",
        bio: "Pet lover, volunteer at rescue center.",
        website: "alicepets.com",
        profileImage: "",
        userType: "tutor",
        points: 150,
        level: 2,
        achievementBadges: ["Early Adopter", "Rescuer"]
      }
    );
  }, []);

  // Dummy pets and posts
  const [savedPosts] = useState<any[]>([]);
  const relationshipCounts = {
    followerCount: 3,
    followingCount: 2,
    friendsCount: 2,
    postsCount: 3,
  };

  const followingStatus = { isFollowing: false };

  // Editing handlers (local only)
  const handleEditBio = () => {
    setNewBio(profileData?.bio || "");
    setIsEditingBio(true);
  };
  const handleSaveBio = () => {
    setProfileData((prev: any) => ({ ...prev, bio: newBio }));
    setIsEditingBio(false);
    toast({ title: "Profile updated", description: "Bio updated" });
  };
  const handleEditWebsite = () => {
    setNewWebsite(profileData?.website || "");
    setIsEditingWebsite(true);
  };
  const handleSaveWebsite = () => {
    setProfileData((prev: any) => ({ ...prev, website: newWebsite }));
    setIsEditingWebsite(false);
    toast({ title: "Profile updated", description: "Website updated" });
  };
  const handleEditName = () => {
    setNewName(profileData?.name || "");
    setIsEditingName(true);
  };
  const handleSaveName = () => {
    setProfileData((prev: any) => ({ ...prev, name: newName }));
    setIsEditingName(false);
    toast({ title: "Profile updated", description: "Name updated" });
  };
  const handleEditCity = () => {
    setNewCity(profileData?.city || "");
    setIsEditingCity(true);
  };
  const handleSaveCity = () => {
    setProfileData((prev: any) => ({ ...prev, city: newCity }));
    setIsEditingCity(false);
    toast({ title: "Profile updated", description: "City updated" });
  };

  // Dummy logout
  const handleLogout = async () => {
    localStorage.removeItem("yaopets_local_user");
    setLocation("/");
  };

  // Dummy follow/unfollow/message
  const handleFollowToggle = () => {
    toast({ title: "Demo: follow/unfollow action not implemented" });
  };
  const handleMessageUser = () => {
    toast({ title: "Demo: direct message feature not implemented" });
  };

  // Dummy posts and users
  const getAllUserPosts = () => [
    { id: 1, postType: 'pet', content: 'Rescued a new cat today!', date: '2025-05-10', likes: 5, comments: 2 },
    { id: 2, postType: 'donation', content: 'Donated to the local shelter', date: '2025-05-08', likes: 7, comments: 3 },
    { id: 3, postType: 'vet_help', content: 'Looking for a vet for a stray dog', date: '2025-05-05', likes: 3, comments: 1 }
  ];
  const mockUsers = {
    followers: [
      { id: 1, name: 'Ana Silva', city: 'São Paulo', profileImage: '' },
      { id: 2, name: 'João Oliveira', city: 'Rio de Janeiro', profileImage: '' },
      { id: 3, name: 'Carla Santos', city: 'Belo Horizonte', profileImage: '' }
    ],
    following: [
      { id: 4, name: 'Pedro Costa', city: 'Salvador', profileImage: '' },
      { id: 5, name: 'Mariana Lima', city: 'Fortaleza', profileImage: '' }
    ],
    friends: [
      { id: 2, name: 'João Oliveira', city: 'Rio de Janeiro', profileImage: '' },
      { id: 5, name: 'Mariana Lima', city: 'Fortaleza', profileImage: '' }
    ]
  };

  // Local photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData((prev: any) => ({ ...prev, profileImage: event.target?.result }));
        setIsPhotoDialogOpen(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'tutor': return 'Tutor';
      case 'doador': return 'Donor';
      case 'voluntário': return 'Volunteer';
      case 'veterinário': return 'Veterinarian';
      default: return type;
    }
  };

  return (
    <div className="app-container">
      <Header 
        title={isOwnProfile ? "My Profile" : "Profile"} 
        showFilters={false}
        showBack={!isOwnProfile}
        onBack={() => setLocation('/')}
      />
      <main className={activeView === 'posts' ? "pb-16" : "pb-4"}>
        {!profileData ? (
          <div className="p-8 text-center">
            <span className="material-icons text-4xl text-neutral-400 mb-2">error_outline</span>
            <p className="text-neutral-600">User not found</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setLocation('/')}
            >
              Back to home
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4">
              <div className="flex">
                <div className="mr-4">
                  <div 
                    className="relative h-20 w-20 cursor-pointer"
                    onClick={() => setIsPhotoDialogOpen(true)}
                  >
                    <Avatar className="h-20 w-20">
                      {profileData?.profileImage ? (
                        <AvatarImage
                          src={profileData.profileImage}
                          alt={profileData?.name || 'User'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-neutral-200 text-neutral-700 text-2xl">
                          {generateInitials(profileData?.name || 'User')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-[#F5821D] text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="material-icons text-xs">add_a_photo</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    {isEditingName ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="h-8 py-1 text-lg font-medium"
                          placeholder="Name"
                        />
                        <Button size="icon" className="h-6 w-6" onClick={handleSaveName}><Check size={14} /></Button>
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => setIsEditingName(false)}><X size={14} /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-neutral-900">{profileData?.name || 'User'}</h3>
                        {isOwnProfile && (
                          <button className="text-neutral-500 hover:text-primary ml-2" onClick={handleEditName}>
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    {isEditingCity ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="h-7 py-1 text-sm"
                          placeholder="City"
                        />
                        <Button size="icon" className="h-6 w-6" onClick={handleSaveCity}><Check size={14} /></Button>
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => setIsEditingCity(false)}><X size={14} /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <p className="text-sm text-neutral-600">{profileData?.city || 'Location not available'}</p>
                        {isOwnProfile && (
                          <button className="text-neutral-500 hover:text-primary ml-2" onClick={handleEditCity}>
                            <Edit2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center">
                      {isEditingBio ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            className="h-7 py-1 text-sm max-w-[180px]"
                            placeholder="Bio"
                          />
                          <Button size="icon" className="h-6 w-6" onClick={handleSaveBio}><Check size={14} /></Button>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => setIsEditingBio(false)}><X size={14} /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <p className="text-sm text-neutral-600 line-clamp-1 max-w-[150px]">
                            {profileData?.bio || (isOwnProfile ? "Add a bio..." : "No bio")}
                          </p>
                          {isOwnProfile && (
                            <button className="text-neutral-500 hover:text-primary ml-2 flex-shrink-0" onClick={handleEditBio}>
                              <Edit2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {isEditingWebsite ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={newWebsite}
                            onChange={(e) => setNewWebsite(e.target.value)}
                            className="h-7 py-1 text-sm max-w-[180px]"
                            placeholder="Website"
                          />
                          <Button size="icon" className="h-6 w-6" onClick={handleSaveWebsite}><Check size={14} /></Button>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => setIsEditingWebsite(false)}><X size={14} /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {profileData?.website ? (
                            <a 
                              href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center hover:underline truncate max-w-[150px]"
                            >
                              <ExternalLink size={12} className="mr-1 flex-shrink-0" />
                              {profileData.website}
                            </a>
                          ) : (
                            <p className="text-sm text-neutral-500">
                              {isOwnProfile ? "Add a link..." : "No link"}
                            </p>
                          )}
                          {isOwnProfile && (
                            <button className="text-neutral-500 hover:text-primary ml-2 flex-shrink-0" onClick={handleEditWebsite}>
                              <Edit2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-neutral-600">
                    <span className="material-icons text-sm mr-1">verified</span>
                    {getUserTypeLabel(profileData?.userType || 'tutor')}
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="ml-2">
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <GamificationInfo 
                  points={profileData?.points || 0} 
                  level={profileData?.level || 1}
                  badges={profileData?.achievementBadges || []}
                />
              </div>
              <div className="mt-6 grid grid-cols-4 gap-2 text-center">
                <div 
                  className={`p-2 rounded-lg cursor-pointer hover:bg-neutral-200 transition ${activeView === 'followers' ? 'bg-neutral-200' : 'bg-neutral-100'}`}
                  onClick={() => setActiveView('followers')}
                >
                  <p className="text-lg font-bold text-primary">{relationshipCounts.followerCount}</p>
                  <p className="text-xs text-neutral-600">Followers</p>
                </div>
                <div 
                  className={`p-2 rounded-lg cursor-pointer hover:bg-neutral-200 transition ${activeView === 'following' ? 'bg-neutral-200' : 'bg-neutral-100'}`}
                  onClick={() => setActiveView('following')}
                >
                  <p className="text-lg font-bold text-primary">{relationshipCounts.followingCount}</p>
                  <p className="text-xs text-neutral-600">Following</p>
                </div>
                <div 
                  className={`p-2 rounded-lg cursor-pointer hover:bg-neutral-200 transition ${activeView === 'friends' ? 'bg-neutral-200' : 'bg-neutral-100'}`}
                  onClick={() => setActiveView('friends')}
                >
                  <p className="text-lg font-bold text-primary">{relationshipCounts.friendsCount}</p>
                  <p className="text-xs text-neutral-600">Friends</p>
                </div>
                <div 
                  className={`p-2 rounded-lg cursor-pointer hover:bg-neutral-200 transition ${activeView === 'posts' ? 'bg-neutral-200' : 'bg-neutral-100'}`}
                  onClick={() => setActiveView('posts')}
                >
                  <p className="text-lg font-bold text-primary">{relationshipCounts.postsCount}</p>
                  <p className="text-xs text-neutral-600">Posts</p>
                </div>
              </div>
            </div>
            {activeView === 'followers' && (
              <div className="p-4 pt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Followers</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('posts')}>Back</Button>
                </div>
                <div className="space-y-4">
                  {mockUsers.followers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          {user.profileImage ? (
                            <AvatarImage src={user.profileImage} className="h-full w-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-neutral-200 text-neutral-700">
                              {generateInitials(user.name || 'User')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h5 className="font-medium">{user.name}</h5>
                          <p className="text-xs text-neutral-500">{user.city || 'Location not informed'}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/profile/${user.id}`)}>
                        View profile
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeView === 'following' && (
              <div className="p-4 pt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Following</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('posts')}>Back</Button>
                </div>
                <div className="space-y-4">
                  {mockUsers.following.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          {user.profileImage ? (
                            <AvatarImage src={user.profileImage} className="h-full w-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-neutral-200 text-neutral-700">
                              {generateInitials(user.name || 'User')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h5 className="font-medium">{user.name}</h5>
                          <p className="text-xs text-neutral-500">{user.city || 'Location not informed'}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/profile/${user.id}`)}>
                        View profile
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeView === 'friends' && (
              <div className="p-4 pt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Friends</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('posts')}>Back</Button>
                </div>
                <div className="space-y-4">
                  {mockUsers.friends.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          {user.profileImage ? (
                            <AvatarImage src={user.profileImage} className="h-full w-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-neutral-200 text-neutral-700">
                              {generateInitials(user.name || 'User')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h5 className="font-medium">{user.name}</h5>
                          <p className="text-xs text-neutral-500">{user.city || 'Location not informed'}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/profile/${user.id}`)}>
                        View profile
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeView === 'posts' && (
              <div className="p-4 pt-0">
                {!isOwnProfile && user && (
                  <div className="mt-2 mb-4 flex space-x-2">
                    <Button onClick={handleFollowToggle} variant={followingStatus?.isFollowing ? "outline" : "default"} className="flex-1">
                      {followingStatus?.isFollowing ? (
                        <>
                          <UserMinus size={16} className="mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="secondary" className="flex-1" onClick={handleMessageUser}>
                      <MessageCircle size={16} className="mr-1" />
                      Message
                    </Button>
                  </div>
                )}
                <Tabs defaultValue="posts" className="w-full mt-4" onValueChange={setSelectedTab}>
                  <div className="px-4 border-b border-neutral-200">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="posts">Posts</TabsTrigger>
                      <TabsTrigger value="saved">Saved</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="posts" className="mt-4">
                    {getAllUserPosts().length > 0 ? (
                      <div className="space-y-4">
                        {getAllUserPosts().map((post) => (
                          <div key={post.id} className="p-4 bg-white rounded-lg shadow mb-4">
                            <div className="flex items-center mb-3">
                              <Avatar className="h-10 w-10 mr-3">
                                {profileData?.profileImage ? (
                                  <AvatarImage src={profileData.profileImage} className="h-full w-full object-cover" />
                                ) : (
                                  <AvatarFallback className="bg-neutral-200 text-neutral-700">
                                    {generateInitials(profileData?.name || 'User')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <h5 className="text-sm font-medium">{profileData?.name}</h5>
                                <p className="text-xs text-neutral-500">{post.postType}</p>
                              </div>
                            </div>
                            <p className="text-sm mb-3">{post.content}</p>
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>{post.date}</span>
                              <div className="flex space-x-3">
                                <span className="flex items-center">
                                  <span className="material-icons text-sm mr-1">favorite_border</span>
                                  {post.likes}
                                </span>
                                <span className="flex items-center">
                                  <span className="material-icons text-sm mr-1">chat_bubble_outline</span>
                                  {post.comments}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-500">No posts found</p>
                        {isOwnProfile && (
                          <Button className="mt-2" onClick={() => setCreatePostModalOpen(true)}>
                            Create post
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="saved" className="mt-0">
                    {savedPosts && savedPosts.length > 0 ? (
                      <div className="space-y-4 p-4">
                        {savedPosts.map((post) => (
                          <div key={post.id} className="p-4 bg-white rounded-lg shadow mb-4">
                            <div className="flex items-center mb-3">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={post.userPhotoUrl} className="h-full w-full object-cover" />
                                <AvatarFallback className="bg-neutral-200 text-neutral-700">
                                  {generateInitials(post.username || 'User')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="text-sm font-medium">{post.username}</h5>
                                <p className="text-xs text-neutral-500">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {post.mediaUrl && (
                              <div className="w-full mb-3">
                                {post.mediaType === 'video' ? (
                                  <video src={post.mediaUrl} controls className="w-full h-auto rounded-md" playsInline />
                                ) : (
                                  <img src={post.mediaUrl} alt="Post image" className="w-full h-auto rounded-md" />
                                )}
                              </div>
                            )}
                            <p className="text-sm mb-3">{post.content}</p>
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>{post.likesCount} likes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <span className="material-icons text-3xl text-neutral-300 mb-2">
                          bookmark_border
                        </span>
                        <p className="text-neutral-500">No saved posts</p>
                        <p className="text-sm text-neutral-400 mt-1">
                          Save posts by clicking the bookmark icon
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}
      </main>
      {isOwnProfile && activeView === 'posts' && (
        <>
          <BottomNavigation />
          <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} />
          <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update profile photo</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <Avatar className="h-24 w-24">
                  {profileData?.profileImage ? (
                    <AvatarImage src={profileData.profileImage} alt={profileData?.name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-neutral-200 text-neutral-700 text-3xl">
                      {generateInitials(profileData?.name || 'User')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-[#F5821D] hover:bg-[#F5821D]/90">
                  Select new photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}