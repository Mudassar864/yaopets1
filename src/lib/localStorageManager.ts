import { userManagement } from "@/utils/localStorageManager"; // Import userManagement

export enum InteractionType {
  LIKE = 'like',
  SAVE = 'save',
  COMMENT = 'comment',
  COMMENT_LIKE = 'comment_like',
}
export interface LocalFundraiser {
  id: number;
  userId: number;
  title: string;
  description: string;
  amount: number;
  daysToComplete: number;
  motivo: string;
  createdAt: string;
  image: string | null; // Store as base64 string or null
  status: 'active' | 'completed' | 'cancelled';
}
export interface LocalInteraction {
  postId: number;
  type: InteractionType;
  timestamp: number;
  commentId?: number;
  content?: string;
  parentId?: number;
}

export interface LocalPet {
  id: number;
  userId: number; // Still use userId for association
  petName: string;
  petSpecies: string;
  petSpeciesDisplay: string;
  petSize: string;
  petSizeDisplay: string;
  petAge: string;
  petAgeDisplay: string;
  petBreed: string;
  petEyeColor: string;
  petLocation: string;
  adoptionInfo: string;
  contactPhone: string;
  petStatus: string;
  content: string;
  description: string;
  createdAt: string;
  photo: string | null;
}

const STORAGE_KEY = 'yaopets_interactions';
const PETS_KEY = 'yaopets_local_pets';
const FUNDRAISERS_KEY = 'yaopets_fundraisers';
class UserInteractionsManager {
  // Remove internal user management
  private getUserId(): number | null {
    const user = userManagement.getCurrentUser();
    return user ? user.id : null;
  }

  // -------------------------------
  // INTERACTION METHODS
  // -------------------------------
  private getUserInteractions(): LocalInteraction[] {
    const userId = this.getUserId();
    if (!userId) return [];
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUserInteractions(interactions: LocalInteraction[]): void {
    const userId = this.getUserId();
    if (!userId) return;
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(interactions));
  }

  private modifyInteractions(filterFn: (i: LocalInteraction) => boolean): void {
    const updated = this.getUserInteractions().filter(filterFn);
    this.saveUserInteractions(updated);
  }

  isPostLiked(postId: number): boolean {
    return this.getUserInteractions().some(i => i.postId === postId && i.type === InteractionType.LIKE);
  }

  isPostSaved(postId: number): boolean {
    return this.getUserInteractions().some(i => i.postId === postId && i.type === InteractionType.SAVE);
  }

  isCommentLiked(commentId: number): boolean {
    return this.getUserInteractions().some(i => i.commentId === commentId && i.type === InteractionType.COMMENT_LIKE);
  }

  getUserCommentsForPost(postId: number): LocalInteraction[] {
    return this.getUserInteractions().filter(i => i.postId === postId && i.type === InteractionType.COMMENT);
  }

  getCommentById(commentId: number): LocalInteraction | undefined {
    return this.getUserInteractions().find(i => i.commentId === commentId && i.type === InteractionType.COMMENT);
  }

  getAllCommentLikes(): LocalInteraction[] {
    return this.getUserInteractions().filter(i => i.type === InteractionType.COMMENT_LIKE);
  }

  likePost(postId: number): void {
    const userId = this.getUserId();
    if (!userId || this.isPostLiked(postId)) return;
    const interactions = this.getUserInteractions();
    interactions.push({ postId, type: InteractionType.LIKE, timestamp: Date.now() });
    this.saveUserInteractions(interactions);
  }

  unlikePost(postId: number): void {
    this.modifyInteractions(i => !(i.postId === postId && i.type === InteractionType.LIKE));
  }

  savePost(postId: number): void {
    const userId = this.getUserId();
    if (!userId || this.isPostSaved(postId)) return;
    const interactions = this.getUserInteractions();
    interactions.push({ postId, type: InteractionType.SAVE, timestamp: Date.now() });
    this.saveUserInteractions(interactions);
  }

  unsavePost(postId: number): void {
    this.modifyInteractions(i => !(i.postId === postId && i.type === InteractionType.SAVE));
  }

  toggleLike(postId: number): boolean {
    const liked = this.isPostLiked(postId);
    liked ? this.unlikePost(postId) : this.likePost(postId);
    return !liked;
  }

  toggleSave(postId: number): boolean {
    const saved = this.isPostSaved(postId);
    saved ? this.unsavePost(postId) : this.savePost(postId);
    return !saved;
  }

  getLikedPostIds(): number[] {
    return this.getUserInteractions().filter(i => i.type === InteractionType.LIKE).map(i => i.postId);
  }

  getSavedPostIds(): number[] {
    return this.getUserInteractions().filter(i => i.type === InteractionType.SAVE).map(i => i.postId);
  }

  addComment(postId: number, content: string, parentId?: number): LocalInteraction {
    const userId = this.getUserId();
    if (!userId) throw new Error("No user set");
    const commentId = Date.now() + Math.floor(Math.random() * 10000);
    const newComment: LocalInteraction = {
      postId,
      type: InteractionType.COMMENT,
      commentId,
      content,
      parentId,
      timestamp: Date.now(),
    };
    const interactions = this.getUserInteractions();
    interactions.push(newComment);
    this.saveUserInteractions(interactions);
    return newComment;
  }

  likeComment(commentId: number, postId?: number): void {
    const userId = this.getUserId();
    if (!userId || this.isCommentLiked(commentId)) return;
    const interactions = this.getUserInteractions();
    interactions.push({
      commentId,
      postId: postId ?? 0,
      type: InteractionType.COMMENT_LIKE,
      timestamp: Date.now(),
    });
    this.saveUserInteractions(interactions);
  }

  unlikeComment(commentId: number): void {
    this.modifyInteractions(i => !(i.commentId === commentId && i.type === InteractionType.COMMENT_LIKE));
  }

  toggleCommentLike(commentId: number, postId?: number): boolean {
    const liked = this.isCommentLiked(commentId);
    liked ? this.unlikeComment(commentId) : this.likeComment(commentId, postId);
    return !liked;
  }

  clearAll(): void {
    const userId = this.getUserId();
    if (!userId) return;
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
  }

  // -------------------------------
  // PET MANAGEMENT METHODS
  // -------------------------------
  private getAllPets(): LocalPet[] {
    try {
      const data = localStorage.getItem(PETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private savePets(pets: LocalPet[]): void {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets.slice(0, 20)));
  }

  createPet(petData: Omit<LocalPet, "id" | "userId" | "createdAt">): LocalPet {
    const userId = this.getUserId();
    if (!userId) throw new Error("No user logged in");

    const petId = Date.now();
    const newPet: LocalPet = {
      ...petData,
      id: petId,
      userId,
      createdAt: new Date().toISOString(),
    };

    const pets = this.getAllPets();
    pets.unshift(newPet);
    this.savePets(pets);

    return newPet;
  }

  updatePet(petId: number, petData: Partial<Omit<LocalPet, "id" | "userId" | "createdAt">>): LocalPet | null {
    const userId = this.getUserId();
    if (!userId) throw new Error("No user logged in");

    const pets = this.getAllPets();
    const petIndex = pets.findIndex(p => p.id === petId && p.userId === userId);

    if (petIndex === -1) return null;

    const updatedPet = { ...pets[petIndex], ...petData };
    pets[petIndex] = updatedPet;
    this.savePets(pets);

    return updatedPet;
  }

  deletePet(petId: number): boolean {
    const userId = this.getUserId();
    if (!userId) throw new Error("No user logged in");

    const pets = this.getAllPets();
    const initialLength = pets.length;
    const filteredPets = pets.filter(p => !(p.id === petId && p.userId === userId));

    if (filteredPets.length === initialLength) return false;

    this.savePets(filteredPets);
    return true;
  }

  getUserPets(): LocalPet[] {
    const userId = this.getUserId();
    if (!userId) return [];
    return this.getAllPets().filter(p => p.userId === userId);
  }

  getAllPetsPublic(): LocalPet[] {
    return this.getAllPets();
  }

  getPetById(petId: number): LocalPet | null {
    return this.getAllPets().find(p => p.id === petId) || null;
  }

  getPetsByStatus(status: string): LocalPet[] {
    return this.getAllPets().filter(p => p.petStatus === status);
  }
  // -------------------------------
  // FUNDRAISER MANAGEMENT METHODS
  // -------------------------------
  private getAllFundraisers(): LocalFundraiser[] {
    try {
      const data = localStorage.getItem(FUNDRAISERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveFundraisers(fundraisers: LocalFundraiser[]): void {
    localStorage.setItem(FUNDRAISERS_KEY, JSON.stringify(fundraisers.slice(0, 20))); // Limit to 20 for storage efficiency
  }

  createFundraiser(fundraiserData: Omit<LocalFundraiser, 'id' | 'userId' | 'createdAt' | 'status'>): LocalFundraiser {
    const userId = this.getUserId();
    if (!userId) throw new Error('No user logged in');

    const fundraiserId = Date.now();
    const newFundraiser: LocalFundraiser = {
      ...fundraiserData,
      id: fundraiserId,
      userId,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const fundraisers = this.getAllFundraisers();
    fundraisers.unshift(newFundraiser);
    this.saveFundraisers(fundraisers);

    return newFundraiser;
  }

  updateFundraiser(fundraiserId: number, fundraiserData: Partial<Omit<LocalFundraiser, 'id' | 'userId' | 'createdAt'>>): LocalFundraiser | null {
    const userId = this.getUserId();
    if (!userId) throw new Error('No user logged in');

    const fundraisers = this.getAllFundraisers();
    const fundraiserIndex = fundraisers.findIndex(f => f.id === fundraiserId && f.userId === userId);

    if (fundraiserIndex === -1) return null;

    const updatedFundraiser = { ...fundraisers[fundraiserIndex], ...fundraiserData };
    fundraisers[fundraiserIndex] = updatedFundraiser;
    this.saveFundraisers(fundraisers);

    return updatedFundraiser;
  }

  deleteFundraiser(fundraiserId: number): boolean {
    const userId = this.getUserId();
    if (!userId) throw new Error('No user logged in');

    const fundraisers = this.getAllFundraisers();
    const initialLength = fundraisers.length;
    const filteredFundraisers = fundraisers.filter(f => !(f.id === fundraiserId && f.userId === userId));

    if (filteredFundraisers.length === initialLength) return false;

    this.saveFundraisers(filteredFundraisers);
    return true;
  }

  getUserFundraisers(): LocalFundraiser[] {
    const userId = this.getUserId();
    if (!userId) return [];
    return this.getAllFundraisers().filter(f => f.userId === userId);
  }

  getAllFundraisersPublic(): LocalFundraiser[] {
    return this.getAllFundraisers().filter(f => f.status === 'active');
  }

  getFundraiserById(fundraiserId: number): LocalFundraiser | null {
    return this.getAllFundraisers().find(f => f.id === fundraiserId) || null;
  }

  getFundraisersByStatus(status: 'active' | 'completed' | 'cancelled'): LocalFundraiser[] {
    return this.getAllFundraisers().filter(f => f.status === status);
  }
  
}

export const localInteractions = new UserInteractionsManager();