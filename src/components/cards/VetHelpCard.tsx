import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatTimeAgo, generateInitials } from "@/lib/utils";

type VetHelpCardProps = {
  vetHelp: any;
  user?: any;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onDonateClick?: () => void;
};

export default function VetHelpCard({
  vetHelp,
  user,
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  onLike,
  onDonateClick,
}: VetHelpCardProps) {
  const progressPercentage = Math.min(
    Math.round((vetHelp.currentAmount / vetHelp.targetAmount) * 100),
    100
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <article className="p-4 border-b border-neutral-200">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10 cursor-pointer">
          {user?.profileImage ? (
            <AvatarImage src={user.profileImage} alt={user?.name} className="h-full w-full object-cover" />
          ) : (
            <AvatarFallback className="bg-neutral-200 text-neutral-700">
              {user?.name ? generateInitials(user.name) : "?"}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-neutral-900">{user?.name || "User"}</h3>
            <div className="flex items-center space-x-2">
              <span className="status-pill status-pill-vet-help">VET HELP</span>
              <span className="text-neutral-500 text-xs">
                {formatTimeAgo(vetHelp.createdAt)}
              </span>
            </div>
          </div>

          <p className="mt-1 text-sm text-neutral-700">{vetHelp.description}</p>

          <div className="mt-3 rounded-lg overflow-hidden bg-neutral-100 card-shadow">
            {vetHelp.photos && vetHelp.photos.length > 0 ? (
              <img src={vetHelp.photos[0]} alt={vetHelp.title} className="w-full h-60 object-cover" />
            ) : (
              <div className="w-full h-60 flex items-center justify-center bg-neutral-200">
                <span className="material-icons text-4xl text-neutral-400">healing</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm mt-1">
              <span className="text-neutral-700">{formatCurrency(vetHelp.currentAmount)} raised</span>
              <span className="text-neutral-700">Goal: {formatCurrency(vetHelp.targetAmount)}</span>
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

            <Button
              className="flex items-center text-white bg-secondary px-3 py-1 rounded-full text-xs font-medium"
              onClick={onDonateClick}
            >
              <span className="material-icons text-xs mr-1">paid</span>
              Donate Now
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}