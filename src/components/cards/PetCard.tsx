import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, getStatusPillClass, generateInitials, getLocationString } from "@/lib/utils";
import AddressLink from "@/components/map/AddressLink";

type PetCardProps = {
  pet: any;
  user?: any; // Pass user from parent
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onMessageClick?: () => void;
  onMapClick?: () => void;
};

export default function PetCard({
  pet,
  user,
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  onLike,
  onMessageClick,
  onMapClick,
}: PetCardProps) {
  const getStatusLabel = () => {
    switch (pet.status) {
      case "lost":
        return "LOST";
      case "found":
        return "FOUND";
      case "adoption":
        return "ADOPTION";
      default:
        return pet.status?.toUpperCase() || "";
    }
  };

  const getActionButton = () => {
    switch (pet.status) {
      case "lost":
        return (
          <Button 
            className="flex items-center justify-center gap-1 text-white bg-primary px-3 py-1 rounded-full text-xs font-medium w-full sm:w-auto"
            onClick={onMapClick}
          >
            <span className="material-icons text-xs">near_me</span>
            View on map
          </Button>
        );
      case "found":
      case "adoption":
        return (
          <Button 
            className="flex items-center justify-center gap-1 text-white bg-primary px-3 py-1 rounded-full text-xs font-medium w-full sm:w-auto"
            onClick={onMessageClick}
          >
            <span className="material-icons text-xs">chat</span>
            {pet.status === "adoption" ? "I want to adopt" : "Send message"}
          </Button>
        );
      default:
        return null;
    }
  };
  
  return (
    <article className="p-4 border-b border-neutral-200">
      <div className="flex items-start space-x-3">
        <Link href={`/profile/${user?.id}`}>
          <Avatar className="h-10 w-10 cursor-pointer">
            {user?.profileImage ? (
              <AvatarImage 
                src={user.profileImage}
                alt={user?.name} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <AvatarFallback className="bg-neutral-200 text-neutral-700">
                {user?.name ? generateInitials(user.name) : "?"}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-neutral-900">{user?.name || "User"}</h3>
            <div className="flex items-center space-x-2">
              <span className={getStatusPillClass(pet.status)}>
                {getStatusLabel()}
              </span>
              <span className="text-neutral-500 text-xs">
                {formatTimeAgo(pet.createdAt)}
              </span>
            </div>
          </div>
          
          <p className="mt-1 text-sm text-neutral-700">{pet.description}</p>
          
          <div className="mt-3 rounded-lg overflow-hidden bg-neutral-100 card-shadow">
            {pet.photos && pet.photos.length > 0 ? (
              <img 
                src={pet.photos[0]} 
                alt={pet.name || "Pet"} 
                className="w-full h-60 object-cover" 
              />
            ) : (
              <div className="w-full h-60 flex items-center justify-center bg-neutral-200">
                <span className="material-icons text-4xl text-neutral-400">pets</span>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <span className="material-icons text-neutral-500 text-sm mr-1">pets</span>
                <span className="text-neutral-700">{pet.breed || pet.type}</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-neutral-500 text-sm mr-1">palette</span>
                <span className="text-neutral-700">{pet.color}</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-neutral-500 text-sm mr-1">straighten</span>
                <span className="text-neutral-700">{pet.size}</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-neutral-500 text-sm mr-1">location_on</span>
                <AddressLink 
                  address={getLocationString(pet.lastLocation)} 
                  lat={pet.lastLocation?.lat} 
                  lng={pet.lastLocation?.lng}
                  className="text-neutral-700 hover:text-primary"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-4">
              <button 
                className="flex items-center text-neutral-600"
                onClick={onLike}
                aria-pressed={isLiked}
              >
                <span className={`material-icons text-neutral-500 mr-1 ${isLiked ? 'text-primary' : ''}`}>
                  {isLiked ? "favorite" : "favorite_border"}
                </span>
                <span className="text-xs">{likesCount}</span>
              </button>
              <button className="flex items-center text-neutral-600">
                <span className="material-icons text-neutral-500 mr-1">chat_bubble_outline</span>
                <span className="text-xs">{commentsCount}</span>
              </button>
              <button className="flex items-center text-neutral-600">
                <span className="material-icons text-neutral-500 mr-1">share</span>
              </button>
            </div>
            
            {getActionButton()}
          </div>
        </div>
      </div>
    </article>
  );
}