/**
 * Local Storage Manager: handles all data persistence in localStorage
 * This utility provides a consistent way to store and retrieve data across the application
 */

// Define keys for different data types
const STORAGE_KEYS = {
  USER: 'yaopets_user',
  AUTH: 'yaopets_auth',
  POSTS: 'yaopets_posts',
  PETS: 'yaopets_pets',
  DONATIONS: 'yaopets_donations',
  VET_HELP: 'yaopets_vet_help',
  CHATS: 'yaopets_chats',
  MESSAGES: 'yaopets_messages',
  INTERACTIONS: 'yaopets_interactions',
  SETTINGS: 'yaopets_settings',
  USERS: 'yaopets_users'
};

// Generic get function with type safety
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Generic set function
export function setInStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
}

// User related functions
export const userStorage = {
  getUser: () => getFromStorage(STORAGE_KEYS.USER, null),
  setUser: (user: any) => setInStorage(STORAGE_KEYS.USER, user),
  clearUser: () => localStorage.removeItem(STORAGE_KEYS.USER),
  isAuthenticated: () => !!getFromStorage(STORAGE_KEYS.USER, null),
  updateUserField: (field: string, value: any) => {
    const user = getFromStorage(STORAGE_KEYS.USER, null);
    if (user) {
      user[field] = value;
      setInStorage(STORAGE_KEYS.USER, user);
    }
  }
};

// Posts related functions
export const postStorage = {
  getAllPosts: () => getFromStorage(STORAGE_KEYS.POSTS, []),
  addPost: (post: any) => {
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    const newPost = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...post
    };
    setInStorage(STORAGE_KEYS.POSTS, [newPost, ...posts]);
    return newPost;
  },
  getPostById: (id: number) => {
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    return posts.find((post: any) => post.id === id) || null;
  },
  updatePost: (id: number, updates: any) => {
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    const updatedPosts = posts.map((post: any) => 
      post.id === id ? { ...post, ...updates } : post
    );
    setInStorage(STORAGE_KEYS.POSTS, updatedPosts);
  },
  deletePost: (id: number) => {
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    setInStorage(STORAGE_KEYS.POSTS, posts.filter((post: any) => post.id !== id));
  },
  getUserPosts: (userId: number) => {
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    return posts.filter((post: any) => post.userId === userId);
  }
};

// Pets related functions
export const petStorage = {
  getAllPets: () => getFromStorage(STORAGE_KEYS.PETS, []),
  addPet: (pet: any) => {
    const pets = getFromStorage(STORAGE_KEYS.PETS, []);
    const newPet = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...pet
    };
    setInStorage(STORAGE_KEYS.PETS, [newPet, ...pets]);
    return newPet;
  },
  getPetById: (id: number) => {
    const pets = getFromStorage(STORAGE_KEYS.PETS, []);
    return pets.find((pet: any) => pet.id === id) || null;
  },
  updatePet: (id: number, updates: any) => {
    const pets = getFromStorage(STORAGE_KEYS.PETS, []);
    const updatedPets = pets.map((pet: any) => 
      pet.id === id ? { ...pet, ...updates } : pet
    );
    setInStorage(STORAGE_KEYS.PETS, updatedPets);
  },
  deletePet: (id: number) => {
    const pets = getFromStorage(STORAGE_KEYS.PETS, []);
    setInStorage(STORAGE_KEYS.PETS, pets.filter((pet: any) => pet.id !== id));
  },
  getUserPets: (userId: number) => {
    const pets = getFromStorage(STORAGE_KEYS.PETS, []);
    return pets.filter((pet: any) => pet.userId === userId);
  },
  getPetsByStatus: (status: string) => {
    const pets = getFromStorage(STORAGE_KEYS.PETS, []);
    return pets.filter((pet: any) => pet.status === status);
  }
};

// Donations related functions
export const donationStorage = {
  getAllDonations: () => getFromStorage(STORAGE_KEYS.DONATIONS, []),
  addDonation: (donation: any) => {
    const donations = getFromStorage(STORAGE_KEYS.DONATIONS, []);
    const newDonation = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...donation
    };
    setInStorage(STORAGE_KEYS.DONATIONS, [newDonation, ...donations]);
    return newDonation;
  },
  getDonationById: (id: number) => {
    const donations = getFromStorage(STORAGE_KEYS.DONATIONS, []);
    return donations.find((donation: any) => donation.id === id) || null;
  },
  updateDonation: (id: number, updates: any) => {
    const donations = getFromStorage(STORAGE_KEYS.DONATIONS, []);
    const updatedDonations = donations.map((donation: any) => 
      donation.id === id ? { ...donation, ...updates } : donation
    );
    setInStorage(STORAGE_KEYS.DONATIONS, updatedDonations);
  },
  deleteDonation: (id: number) => {
    const donations = getFromStorage(STORAGE_KEYS.DONATIONS, []);
    setInStorage(STORAGE_KEYS.DONATIONS, donations.filter((donation: any) => donation.id !== id));
  },
  getUserDonations: (userId: number) => {
    const donations = getFromStorage(STORAGE_KEYS.DONATIONS, []);
    return donations.filter((donation: any) => donation.userId === userId);
  }
};

// Vet help related functions
export const vetHelpStorage = {
  getAllVetHelp: () => getFromStorage(STORAGE_KEYS.VET_HELP, []),
  addVetHelp: (vetHelp: any) => {
    const vetHelps = getFromStorage(STORAGE_KEYS.VET_HELP, []);
    const newVetHelp = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      ...vetHelp
    };
    setInStorage(STORAGE_KEYS.VET_HELP, [newVetHelp, ...vetHelps]);
    return newVetHelp;
  },
  getVetHelpById: (id: number) => {
    const vetHelps = getFromStorage(STORAGE_KEYS.VET_HELP, []);
    return vetHelps.find((vetHelp: any) => vetHelp.id === id) || null;
  },
  updateVetHelp: (id: number, updates: any) => {
    const vetHelps = getFromStorage(STORAGE_KEYS.VET_HELP, []);
    const updatedVetHelps = vetHelps.map((vetHelp: any) => 
      vetHelp.id === id ? { ...vetHelp, ...updates } : vetHelp
    );
    setInStorage(STORAGE_KEYS.VET_HELP, updatedVetHelps);
  },
  deleteVetHelp: (id: number) => {
    const vetHelps = getFromStorage(STORAGE_KEYS.VET_HELP, []);
    setInStorage(STORAGE_KEYS.VET_HELP, vetHelps.filter((vetHelp: any) => vetHelp.id !== id));
  },
  getUserVetHelp: (userId: number) => {
    const vetHelps = getFromStorage(STORAGE_KEYS.VET_HELP, []);
    return vetHelps.filter((vetHelp: any) => vetHelp.userId === userId);
  },
  // Add donation to a vet help campaign
  addDonationToVetHelp: (vetHelpId: number, amount: number, userId: number) => {
    const vetHelps = getFromStorage(STORAGE_KEYS.VET_HELP, []);
    const updatedVetHelps = vetHelps.map((vetHelp: any) => {
      if (vetHelp.id === vetHelpId) {
        const currentAmount = vetHelp.currentAmount || 0;
        return {
          ...vetHelp,
          currentAmount: currentAmount + amount,
          donations: [...(vetHelp.donations || []), {
            id: Date.now(),
            userId,
            amount,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return vetHelp;
    });
    setInStorage(STORAGE_KEYS.VET_HELP, updatedVetHelps);
  }
};

// Chat and messages related functions
export const chatStorage = {
  getAllChats: () => getFromStorage(STORAGE_KEYS.CHATS, []),
  getChatById: (id: number) => {
    const chats = getFromStorage(STORAGE_KEYS.CHATS, []);
    return chats.find((chat: any) => chat.id === id) || null;
  },
  getUserChats: (userId: number) => {
    const chats = getFromStorage(STORAGE_KEYS.CHATS, []);
    return chats.filter((chat: any) => 
      chat.participant1Id === userId || chat.participant2Id === userId
    );
  },
  createChat: (participant1Id: number, participant2Id: number) => {
    // Check if chat already exists
    const chats = getFromStorage(STORAGE_KEYS.CHATS, []);
    const existingChat = chats.find((chat: any) => 
      (chat.participant1Id === participant1Id && chat.participant2Id === participant2Id) ||
      (chat.participant1Id === participant2Id && chat.participant2Id === participant1Id)
    );
    
    if (existingChat) {
      return existingChat;
    }
    
    // Create new chat
    const newChat = {
      id: Date.now(),
      participant1Id,
      participant2Id,
      createdAt: new Date().toISOString(),
      lastMessageId: null
    };
    
    setInStorage(STORAGE_KEYS.CHATS, [...chats, newChat]);
    return newChat;
  },
  getMessages: (chatId: number) => {
    const messages = getFromStorage(STORAGE_KEYS.MESSAGES, []);
    return messages.filter((message: any) => message.conversationId === chatId);
  },
  sendMessage: (chatId: number, senderId: number, recipientId: number, content: string, attachmentUrl?: string) => {
    const messages = getFromStorage(STORAGE_KEYS.MESSAGES, []);
    const newMessage = {
      id: Date.now(),
      conversationId: chatId,
      senderId,
      recipientId,
      content,
      attachmentUrl,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    setInStorage(STORAGE_KEYS.MESSAGES, [...messages, newMessage]);
    
    // Update last message in chat
    const chats = getFromStorage(STORAGE_KEYS.CHATS, []);
    const updatedChats = chats.map((chat: any) => 
      chat.id === chatId ? { ...chat, lastMessageId: newMessage.id } : chat
    );
    setInStorage(STORAGE_KEYS.CHATS, updatedChats);
    
    return newMessage;
  },
  markMessagesAsRead: (chatId: number, userId: number) => {
    const messages = getFromStorage(STORAGE_KEYS.MESSAGES, []);
    const updatedMessages = messages.map((message: any) => {
      if (message.conversationId === chatId && message.recipientId === userId && !message.read) {
        return { ...message, read: true };
      }
      return message;
    });
    setInStorage(STORAGE_KEYS.MESSAGES, updatedMessages);
  },
  getUnreadCount: (userId: number) => {
    const messages = getFromStorage(STORAGE_KEYS.MESSAGES, []);
    return messages.filter((message: any) => 
      message.recipientId === userId && !message.read
    ).length;
  }
};

// User interactions (likes, comments, saves)
export const interactionStorage = {
  // Likes
  likePost: (userId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_likes`;
    const likes = getFromStorage(key, []);
    if (!likes.some((like: any) => like.userId === userId && like.postId === postId)) {
      setInStorage(key, [...likes, { userId, postId, createdAt: new Date().toISOString() }]);
      
      // Update post likes count
      const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
      const updatedPosts = posts.map((post: any) => {
        if (post.id === postId) {
          return { 
            ...post, 
            likesCount: (post.likesCount || 0) + 1 
          };
        }
        return post;
      });
      setInStorage(STORAGE_KEYS.POSTS, updatedPosts);
    }
  },
  unlikePost: (userId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_likes`;
    const likes = getFromStorage(key, []);
    setInStorage(key, likes.filter((like: any) => 
      !(like.userId === userId && like.postId === postId)
    ));
    
    // Update post likes count
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    const updatedPosts = posts.map((post: any) => {
      if (post.id === postId) {
        return { 
          ...post, 
          likesCount: Math.max(0, (post.likesCount || 0) - 1)
        };
      }
      return post;
    });
    setInStorage(STORAGE_KEYS.POSTS, updatedPosts);
  },
  isPostLiked: (userId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_likes`;
    const likes = getFromStorage(key, []);
    return likes.some((like: any) => like.userId === userId && like.postId === postId);
  },
  
  // Saves
  savePost: (userId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_saves`;
    const saves = getFromStorage(key, []);
    if (!saves.some((save: any) => save.userId === userId && save.postId === postId)) {
      setInStorage(key, [...saves, { userId, postId, createdAt: new Date().toISOString() }]);
    }
  },
  unsavePost: (userId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_saves`;
    const saves = getFromStorage(key, []);
    setInStorage(key, saves.filter((save: any) => 
      !(save.userId === userId && save.postId === postId)
    ));
  },
  isPostSaved: (userId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_saves`;
    const saves = getFromStorage(key, []);
    return saves.some((save: any) => save.userId === userId && save.postId === postId);
  },
  getSavedPosts: (userId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_saves`;
    const saves = getFromStorage(key, []);
    const userSaves = saves.filter((save: any) => save.userId === userId);
    
    // Get the actual posts
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    return userSaves.map((save: any) => {
      const post = posts.find((p: any) => p.id === save.postId);
      return post ? { ...post, savedAt: save.createdAt } : null;
    }).filter(Boolean);
  },
  
  // Comments
  addComment: (userId: number, postId: number, content: string) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_comments`;
    const comments = getFromStorage(key, []);
    
    // Get user info
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const user = users.find((u: any) => u.id === userId);
    
    const newComment = {
      id: Date.now(),
      userId,
      postId,
      content,
      username: user?.username || user?.name || "User",
      userPhotoUrl: user?.profileImage || "",
      createdAt: new Date().toISOString(),
      likesCount: 0
    };
    setInStorage(key, [...comments, newComment]);
    
    // Update post comments count
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    const updatedPosts = posts.map((post: any) => {
      if (post.id === postId) {
        return { 
          ...post, 
          commentsCount: (post.commentsCount || 0) + 1 
        };
      }
      return post;
    });
    setInStorage(STORAGE_KEYS.POSTS, updatedPosts);
    
    return newComment;
  },
  getPostComments: (postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_comments`;
    const comments = getFromStorage(key, []);
    return comments.filter((comment: any) => comment.postId === postId);
  },
  deleteComment: (commentId: number, postId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_comments`;
    const comments = getFromStorage(key, []);
    setInStorage(key, comments.filter((comment: any) => comment.id !== commentId));
    
    // Update post comments count
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    const updatedPosts = posts.map((post: any) => {
      if (post.id === postId) {
        return { 
          ...post, 
          commentsCount: Math.max(0, (post.commentsCount || 0) - 1)
        };
      }
      return post;
    });
    setInStorage(STORAGE_KEYS.POSTS, updatedPosts);
  },
  
  // Comment likes
  likeComment: (userId: number, commentId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_comment_likes`;
    const likes = getFromStorage(key, []);
    if (!likes.some((like: any) => like.userId === userId && like.commentId === commentId)) {
      setInStorage(key, [...likes, { userId, commentId, createdAt: new Date().toISOString() }]);
      
      // Update comment likes count
      const commentsKey = `${STORAGE_KEYS.INTERACTIONS}_comments`;
      const comments = getFromStorage(commentsKey, []);
      const updatedComments = comments.map((comment: any) => {
        if (comment.id === commentId) {
          return { 
            ...comment, 
            likesCount: (comment.likesCount || 0) + 1 
          };
        }
        return comment;
      });
      setInStorage(commentsKey, updatedComments);
    }
  },
  unlikeComment: (userId: number, commentId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_comment_likes`;
    const likes = getFromStorage(key, []);
    setInStorage(key, likes.filter((like: any) => 
      !(like.userId === userId && like.commentId === commentId)
    ));
    
    // Update comment likes count
    const commentsKey = `${STORAGE_KEYS.INTERACTIONS}_comments`;
    const comments = getFromStorage(commentsKey, []);
    const updatedComments = comments.map((comment: any) => {
      if (comment.id === commentId) {
        return { 
          ...comment, 
          likesCount: Math.max(0, (comment.likesCount || 0) - 1)
        };
      }
      return comment;
    });
    setInStorage(commentsKey, updatedComments);
  },
  isCommentLiked: (userId: number, commentId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_comment_likes`;
    const likes = getFromStorage(key, []);
    return likes.some((like: any) => like.userId === userId && like.commentId === commentId);
  }
};

// Users management
export const userManagement = {
  getAllUsers: () => getFromStorage(STORAGE_KEYS.USERS, []),
  getUserById: (id: number) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    return users.find((user: any) => user.id === id) || null;
  },
  addUser: (user: any) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const newUser = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...user
    };
    setInStorage(STORAGE_KEYS.USERS, [...users, newUser]);
    return newUser;
  },
  updateUser: (id: number, updates: any) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const updatedUsers = users.map((user: any) => 
      user.id === id ? { ...user, ...updates } : user
    );
    setInStorage(STORAGE_KEYS.USERS, updatedUsers);
    
    // Also update current user if it's the same
    const auth = getFromStorage(STORAGE_KEYS.AUTH, null);
    if (auth && auth.user && auth.user.id === id) {
      setInStorage(STORAGE_KEYS.AUTH, {
        ...auth,
        user: { ...auth.user, ...updates }
      });
    }
  },
  deleteUser: (id: number) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    setInStorage(STORAGE_KEYS.USERS, users.filter((user: any) => user.id !== id));
  },
  // Authentication
  register: (userData: any) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    // Check if email already exists
    if (users.some((user: any) => user.email === userData.email)) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      points: 0,
      level: 'Beginner',
      ...userData
    };
    
    setInStorage(STORAGE_KEYS.USERS, [...users, newUser]);
    
    // Set current user in auth storage
    setInStorage(STORAGE_KEYS.AUTH, {
      user: newUser,
      token: `dummy-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    
    return newUser;
  },
  login: (email: string, password: string) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const user = users.find((user: any) => 
      user.email === email && user.password === password
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Set current user in auth storage
    setInStorage(STORAGE_KEYS.AUTH, {
      user,
      token: `dummy-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    
    return user;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },
  getCurrentUser: () => {
    const auth = getFromStorage(STORAGE_KEYS.AUTH, null);
    if (!auth) return null;
    
    // Check if token is expired
    if (new Date(auth.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      return null;
    }
    
    return auth.user;
  },
  // Following/followers
  followUser: (followerId: number, followedId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_follows`;
    const follows = getFromStorage(key, []);
    
    if (!follows.some((follow: any) => 
      follow.followerId === followerId && follow.followedId === followedId
    )) {
      setInStorage(key, [...follows, { 
        followerId, 
        followedId, 
        createdAt: new Date().toISOString() 
      }]);
    }
  },
  unfollowUser: (followerId: number, followedId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_follows`;
    const follows = getFromStorage(key, []);
    
    setInStorage(key, follows.filter((follow: any) => 
      !(follow.followerId === followerId && follow.followedId === followedId)
    ));
  },
  isFollowing: (followerId: number, followedId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_follows`;
    const follows = getFromStorage(key, []);
    
    return follows.some((follow: any) => 
      follow.followerId === followerId && follow.followedId === followedId
    );
  },
  getFollowers: (userId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_follows`;
    const follows = getFromStorage(key, []);
    
    return follows.filter((follow: any) => follow.followedId === userId)
      .map((follow: any) => follow.followerId);
  },
  getFollowing: (userId: number) => {
    const key = `${STORAGE_KEYS.INTERACTIONS}_follows`;
    const follows = getFromStorage(key, []);
    
    return follows.filter((follow: any) => follow.followerId === userId)
      .map((follow: any) => follow.followedId);
  }
};

// Initialize with some demo data if empty
export function initializeDemoData() {
  // Only initialize if no users exist
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    // Add demo users
    const demoUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        username: 'johndoe',
        city: 'New York',
        bio: 'Pet lover and volunteer',
        userType: 'tutor',
        points: 120,
        level: 'Protector',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        verified: true
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        username: 'janesmith',
        city: 'Los Angeles',
        bio: 'Veterinarian and animal rights activist',
        userType: 'veterinarian',
        points: 350,
        level: 'Guardian',
        profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
        verified: true
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        username: 'mikej',
        city: 'Chicago',
        bio: 'Dog trainer and rescue volunteer',
        userType: 'tutor',
        points: 85,
        level: 'Beginner',
        profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
        verified: true
      },
      {
        id: 4,
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: 'password123',
        username: 'sarahw',
        city: 'Boston',
        bio: 'Cat lover with 3 rescued cats',
        userType: 'tutor',
        points: 210,
        level: 'Protector',
        profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
        verified: true
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david@example.com',
        password: 'password123',
        username: 'davidb',
        city: 'Seattle',
        bio: 'Wildlife photographer and animal advocate',
        userType: 'tutor',
        points: 175,
        level: 'Protector',
        profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
        verified: true
      }
    ];
    setInStorage(STORAGE_KEYS.USERS, demoUsers);
    
    // Add demo pets
    const demoPets = [
      {
        id: 101,
        userId: 1,
        name: 'Max',
        type: 'Dog',
        breed: 'Golden Retriever',
        color: 'Golden',
        size: 'Large',
        age: 'Adult',
        status: 'adoption',
        description: 'Friendly and playful dog looking for a loving home',
        location: {
          address: 'Central Park, New York',
          lat: 40.785091,
          lng: -73.968285
        },
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800'],
        createdAt: '2025-05-01T12:00:00.000Z'
      },
      {
        id: 102,
        userId: 2,
        name: 'Luna',
        type: 'Cat',
        breed: 'Siamese',
        color: 'Cream',
        size: 'Medium',
        age: 'Young',
        status: 'lost',
        description: 'Lost in the neighborhood, has a blue collar with ID tag',
        location: {
          address: 'Downtown LA',
          lat: 34.052235,
          lng: -118.243683
        },
        photos: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800'],
        createdAt: '2025-05-05T14:30:00.000Z'
      },
      {
        id: 103,
        userId: 3,
        name: 'Rocky',
        type: 'Dog',
        breed: 'Bulldog',
        color: 'White and Brown',
        size: 'Medium',
        age: 'Adult',
        status: 'adoption',
        description: 'Gentle and loving bulldog, great with kids',
        location: {
          address: 'Lincoln Park, Chicago',
          lat: 41.921092,
          lng: -87.633492
        },
        photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800'],
        createdAt: '2025-05-03T10:15:00.000Z'
      },
      {
        id: 104,
        userId: 4,
        name: 'Whiskers',
        type: 'Cat',
        breed: 'Maine Coon',
        color: 'Gray Tabby',
        size: 'Large',
        age: 'Senior',
        status: 'adoption',
        description: 'Majestic Maine Coon looking for a quiet home',
        location: {
          address: 'Boston Common',
          lat: 42.355469,
          lng: -71.065544
        },
        photos: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800'],
        createdAt: '2025-05-04T16:45:00.000Z'
      },
      {
        id: 105,
        userId: 5,
        name: 'Buddy',
        type: 'Dog',
        breed: 'Labrador',
        color: 'Black',
        size: 'Large',
        age: 'Young',
        status: 'found',
        description: 'Found near the lake, very friendly, no collar',
        location: {
          address: 'Green Lake, Seattle',
          lat: 47.680718,
          lng: -122.334293
        },
        photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'],
        createdAt: '2025-05-06T09:30:00.000Z'
      }
    ];
    setInStorage(STORAGE_KEYS.PETS, demoPets);
    
    // Add demo posts
    const demoPosts = [
      {
        id: 201,
        userId: 1,
        username: 'johndoe',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'Just adopted this beautiful dog! So happy to have him in our family.',
        mediaUrls: ['https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800'],
        location: {
          address: 'New York, NY',
          lat: 40.712776,
          lng: -74.005974
        },
        likesCount: 24,
        commentsCount: 5,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-10T09:15:00.000Z'
      },
      {
        id: 202,
        userId: 2,
        username: 'janesmith',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'Looking for a foster home for these kittens. They\'re 8 weeks old and very playful!',
        mediaUrls: ['https://images.unsplash.com/photo-1570824104453-508955ab713e?q=80&w=800'],
        location: {
          address: 'Los Angeles, CA',
          lat: 34.052235,
          lng: -118.243683
        },
        likesCount: 42,
        commentsCount: 12,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-12T16:45:00.000Z'
      },
      {
        id: 203,
        userId: 3,
        username: 'mikej',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'Training session with Rocky today. He\'s making great progress!',
        mediaUrls: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800'],
        location: {
          address: 'Chicago, IL',
          lat: 41.878113,
          lng: -87.629799
        },
        likesCount: 18,
        commentsCount: 3,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-11T14:20:00.000Z'
      },
      {
        id: 204,
        userId: 4,
        username: 'sarahw',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
        content: 'My cats enjoying their new cat tree! Best purchase ever.',
        mediaUrls: ['https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=800'],
        location: {
          address: 'Boston, MA',
          lat: 42.360082,
          lng: -71.058880
        },
        likesCount: 31,
        commentsCount: 7,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-09T11:30:00.000Z'
      },
      {
        id: 205,
        userId: 5,
        username: 'davidb',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'Found this dog near Green Lake. Please share to help find the owner!',
        mediaUrls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'],
        location: {
          address: 'Seattle, WA',
          lat: 47.603230,
          lng: -122.330276
        },
        likesCount: 56,
        commentsCount: 15,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-08T08:45:00.000Z'
      },
      {
        id: 206,
        userId: 1,
        username: 'johndoe',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'Morning walk with Max. Starting the day right!',
        mediaUrls: ['https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=800'],
        location: {
          address: 'Central Park, New York',
          lat: 40.785091,
          lng: -73.968285
        },
        likesCount: 15,
        commentsCount: 2,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-07T07:30:00.000Z'
      },
      {
        id: 207,
        userId: 2,
        username: 'janesmith',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'Reminder: Vaccinations are essential for your pet\'s health! Schedule regular check-ups.',
        mediaUrls: ['https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?q=80&w=800'],
        location: {
          address: 'Veterinary Clinic, Los Angeles',
          lat: 34.052235,
          lng: -118.243683
        },
        likesCount: 38,
        commentsCount: 9,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-06T15:10:00.000Z'
      },
      {
        id: 208,
        userId: 3,
        username: 'mikej',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'Visited the local shelter today. So many amazing dogs looking for homes!',
        mediaUrls: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'],
        location: {
          address: 'Animal Shelter, Chicago',
          lat: 41.878113,
          lng: -87.629799
        },
        likesCount: 27,
        commentsCount: 6,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-05T13:25:00.000Z'
      },
      {
        id: 209,
        userId: 4,
        username: 'sarahw',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
        content: 'Happy adoption day anniversary to Whiskers! One year with this beautiful soul.',
        mediaUrls: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800'],
        location: {
          address: 'Boston, MA',
          lat: 42.360082,
          lng: -71.058880
        },
        likesCount: 45,
        commentsCount: 11,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-04T10:50:00.000Z'
      },
      {
        id: 210,
        userId: 5,
        username: 'davidb',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'Beach day with Buddy! He loves the water.',
        mediaUrls: ['https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?q=80&w=800'],
        location: {
          address: 'Alki Beach, Seattle',
          lat: 47.586087,
          lng: -122.376972
        },
        likesCount: 33,
        commentsCount: 8,
        visibilityType: 'public',
        postType: 'regular',
        createdAt: '2025-05-03T16:15:00.000Z'
      }
    ];
    setInStorage(STORAGE_KEYS.POSTS, demoPosts);
    
    // Add demo donations
    const demoDonations = [
      {
        id: 301,
        userId: 1,
        title: 'Dog food donation',
        description: 'I have 5 bags of premium dog food to donate',
        category: 'Food',
        condition: 'New',
        location: {
          address: 'Brooklyn, NY',
          lat: 40.650002,
          lng: -73.949997
        },
        photos: ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=800'],
        createdAt: '2025-05-08T10:00:00.000Z'
      },
      {
        id: 302,
        userId: 2,
        title: 'Cat carrier and toys',
        description: 'Gently used cat carrier and some toys my cat doesn\'t use',
        category: 'Accessory',
        condition: 'Used - Good',
        location: {
          address: 'Santa Monica, CA',
          lat: 34.024212,
          lng: -118.496475
        },
        photos: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=800'],
        createdAt: '2025-05-09T14:20:00.000Z'
      }
    ];
    setInStorage(STORAGE_KEYS.DONATIONS, demoDonations);
    
    // Add demo vet help campaigns
    const demoVetHelp = [
      {
        id: 401,
        userId: 2,
        title: 'Surgery for rescue dog',
        description: 'This dog was found with a broken leg and needs surgery',
        targetAmount: 1200,
        currentAmount: 450,
        location: {
          address: 'Los Angeles, CA',
          lat: 34.052235,
          lng: -118.243683
        },
        photos: ['https://images.unsplash.com/photo-1444212477490-ca407925329e?q=80&w=800'],
        status: 'active',
        createdAt: '2025-05-07T11:30:00.000Z',
        daysRemaining: 15
      },
      {
        id: 402,
        userId: 1,
        title: 'Medical treatment for stray cats',
        description: 'Help us provide medical care for a colony of stray cats',
        targetAmount: 800,
        currentAmount: 320,
        location: {
          address: 'Queens, NY',
          lat: 40.728224,
          lng: -73.794852
        },
        photos: ['https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=800'],
        status: 'active',
        createdAt: '2025-05-06T09:45:00.000Z',
        daysRemaining: 10
      }
    ];
    setInStorage(STORAGE_KEYS.VET_HELP, demoVetHelp);
    
    // Add demo chats and messages
    const demoChats = [
      {
        id: 501,
        participant1Id: 1,
        participant2Id: 2,
        createdAt: '2025-05-05T13:20:00.000Z',
        lastMessageId: 5012
      },
      {
        id: 502,
        participant1Id: 1,
        participant2Id: 3,
        createdAt: '2025-05-06T10:15:00.000Z',
        lastMessageId: 5022
      },
      {
        id: 503,
        participant1Id: 2,
        participant2Id: 4,
        createdAt: '2025-05-07T14:30:00.000Z',
        lastMessageId: 5032
      }
    ];
    setInStorage(STORAGE_KEYS.CHATS, demoChats);
    
    const demoMessages = [
      {
        id: 5011,
        conversationId: 501,
        senderId: 1,
        recipientId: 2,
        content: 'Hi Jane, I\'m interested in adopting one of the kittens you posted about.',
        createdAt: '2025-05-05T13:20:00.000Z',
        read: true
      },
      {
        id: 5012,
        conversationId: 501,
        senderId: 2,
        recipientId: 1,
        content: 'Hello John! That\'s great news. They\'re all very healthy and playful. When would you like to meet them?',
        createdAt: '2025-05-05T13:25:00.000Z',
        read: false
      },
      {
        id: 5021,
        conversationId: 502,
        senderId: 3,
        recipientId: 1,
        content: 'Hey John, I saw your post about dog training. Do you have any tips for a new puppy?',
        createdAt: '2025-05-06T10:15:00.000Z',
        read: true
      },
      {
        id: 5022,
        conversationId: 502,
        senderId: 1,
        recipientId: 3,
        content: 'Hi Mike! Consistency is key with puppies. Start with basic commands like sit and stay, and use positive reinforcement.',
        createdAt: '2025-05-06T10:20:00.000Z',
        read: false
      },
      {
        id: 5031,
        conversationId: 503,
        senderId: 4,
        recipientId: 2,
        content: 'Dr. Smith, my cat has been sneezing a lot lately. Should I be concerned?',
        createdAt: '2025-05-07T14:30:00.000Z',
        read: true
      },
      {
        id: 5032,
        conversationId: 503,
        senderId: 2,
        recipientId: 4,
        content: 'Hi Sarah, it could be a simple cold or allergies, but it\'s best to bring your cat in for a check-up to rule out any serious issues.',
        createdAt: '2025-05-07T14:35:00.000Z',
        read: false
      }
    ];
    setInStorage(STORAGE_KEYS.MESSAGES, demoMessages);
    
    // Add demo comments
    const demoComments = [
      {
        id: 601,
        userId: 2,
        postId: 201,
        username: 'janesmith',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'What a beautiful dog! Congratulations on your new family member!',
        createdAt: '2025-05-10T10:30:00.000Z',
        likesCount: 3
      },
      {
        id: 602,
        userId: 1,
        postId: 202,
        username: 'johndoe',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'They are adorable! I wish I could adopt one but I already have two cats.',
        createdAt: '2025-05-12T17:20:00.000Z',
        likesCount: 2
      },
      {
        id: 603,
        userId: 3,
        postId: 201,
        username: 'mikej',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'He looks so happy! What breed is he?',
        createdAt: '2025-05-10T11:15:00.000Z',
        likesCount: 1
      },
      {
        id: 604,
        userId: 4,
        postId: 202,
        username: 'sarahw',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
        content: 'I might be interested in adopting one! Are they litter trained?',
        createdAt: '2025-05-12T18:05:00.000Z',
        likesCount: 0
      },
      {
        id: 605,
        userId: 5,
        postId: 203,
        username: 'davidb',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'Great job! What training methods are you using?',
        createdAt: '2025-05-11T15:10:00.000Z',
        likesCount: 1
      },
      {
        id: 606,
        userId: 1,
        postId: 204,
        username: 'johndoe',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'They look so happy! Where did you get the cat tree?',
        createdAt: '2025-05-09T12:45:00.000Z',
        likesCount: 2
      },
      {
        id: 607,
        userId: 2,
        postId: 205,
        username: 'janesmith',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'I\'ll share this with my Seattle friends. Hope the owner is found soon!',
        createdAt: '2025-05-08T09:30:00.000Z',
        likesCount: 3
      },
      {
        id: 608,
        userId: 3,
        postId: 206,
        username: 'mikej',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'Nothing beats a morning walk with your dog!',
        createdAt: '2025-05-07T08:15:00.000Z',
        likesCount: 1
      },
      {
        id: 609,
        userId: 4,
        postId: 207,
        username: 'sarahw',
        userPhotoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
        content: 'Thanks for the reminder! Just scheduled my cats\' annual check-up.',
        createdAt: '2025-05-06T16:20:00.000Z',
        likesCount: 2
      },
      {
        id: 610,
        userId: 5,
        postId: 208,
        username: 'davidb',
        userPhotoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'I volunteer at a shelter too. It\'s such rewarding work!',
        createdAt: '2025-05-05T14:40:00.000Z',
        likesCount: 3
      }
    ];
    setInStorage(`${STORAGE_KEYS.INTERACTIONS}_comments`, demoComments);
    
    // Add demo likes
    const demoLikes = [
      {
        userId: 1,
        postId: 202,
        createdAt: '2025-05-12T17:15:00.000Z'
      },
      {
        userId: 1,
        postId: 204,
        createdAt: '2025-05-09T12:40:00.000Z'
      },
      {
        userId: 1,
        postId: 207,
        createdAt: '2025-05-06T15:30:00.000Z'
      },
      {
        userId: 2,
        postId: 201,
        createdAt: '2025-05-10T10:25:00.000Z'
      },
      {
        userId: 2,
        postId: 203,
        createdAt: '2025-05-11T14:35:00.000Z'
      },
      {
        userId: 2,
        postId: 206,
        createdAt: '2025-05-07T08:00:00.000Z'
      },
      {
        userId: 3,
        postId: 201,
        createdAt: '2025-05-10T11:10:00.000Z'
      },
      {
        userId: 3,
        postId: 205,
        createdAt: '2025-05-08T09:15:00.000Z'
      },
      {
        userId: 3,
        postId: 209,
        createdAt: '2025-05-04T11:20:00.000Z'
      },
      {
        userId: 4,
        postId: 202,
        createdAt: '2025-05-12T18:00:00.000Z'
      },
      {
        userId: 4,
        postId: 207,
        createdAt: '2025-05-06T15:45:00.000Z'
      },
      {
        userId: 4,
        postId: 210,
        createdAt: '2025-05-03T16:45:00.000Z'
      },
      {
        userId: 5,
        postId: 203,
        createdAt: '2025-05-11T15:00:00.000Z'
      },
      {
        userId: 5,
        postId: 208,
        createdAt: '2025-05-05T14:30:00.000Z'
      }
    ];
    setInStorage(`${STORAGE_KEYS.INTERACTIONS}_likes`, demoLikes);
    
    // Add demo comment likes
    const demoCommentLikes = [
      {
        userId: 1,
        commentId: 601,
        createdAt: '2025-05-10T11:00:00.000Z'
      },
      {
        userId: 2,
        commentId: 602,
        createdAt: '2025-05-12T18:30:00.000Z'
      },
      {
        userId: 3,
        commentId: 603,
        createdAt: '2025-05-10T12:00:00.000Z'
      },
      {
        userId: 4,
        commentId: 607,
        createdAt: '2025-05-08T10:15:00.000Z'
      },
      {
        userId: 5,
        commentId: 609,
        createdAt: '2025-05-06T17:00:00.000Z'
      }
    ];
    setInStorage(`${STORAGE_KEYS.INTERACTIONS}_comment_likes`, demoCommentLikes);
    
    // Add demo follows
    const demoFollows = [
      {
        followerId: 1,
        followedId: 2,
        createdAt: '2025-05-05T09:00:00.000Z'
      },
      {
        followerId: 1,
        followedId: 3,
        createdAt: '2025-05-06T11:30:00.000Z'
      },
      {
        followerId: 2,
        followedId: 1,
        createdAt: '2025-05-06T14:30:00.000Z'
      },
      {
        followerId: 2,
        followedId: 4,
        createdAt: '2025-05-07T10:15:00.000Z'
      },
      {
        followerId: 3,
        followedId: 1,
        createdAt: '2025-05-08T13:45:00.000Z'
      },
      {
        followerId: 3,
        followedId: 5,
        createdAt: '2025-05-09T16:20:00.000Z'
      },
      {
        followerId: 4,
        followedId: 2,
        createdAt: '2025-05-10T09:30:00.000Z'
      },
      {
        followerId: 5,
        followedId: 3,
        createdAt: '2025-05-11T12:10:00.000Z'
      }
    ];
    setInStorage(`${STORAGE_KEYS.INTERACTIONS}_follows`, demoFollows);
    
    console.log('Demo data initialized successfully');
  }
}

// Export all storage functions
export default {
  STORAGE_KEYS,
  getFromStorage,
  setInStorage,
  userStorage,
  postStorage,
  petStorage,
  donationStorage,
  vetHelpStorage,
  chatStorage,
  interactionStorage,
  userManagement,
  initializeDemoData
};