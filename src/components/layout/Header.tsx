import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { generateInitials } from "@/lib/utils";
import { MessageCircle, Store } from "lucide-react";

type HeaderProps = {
  title?: string;
  showFilters?: boolean;
  showBack?: boolean;
  onBack?: () => void;
};

export default function Header({
  title = "YaoPets",
  showFilters = true,
  showBack = false,
  onBack,
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-2 text-black"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
          ) : null}
          <h1 className="text-xl font-bold text-black">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/store">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-black/80"
            >
              <Store size={48} />
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-black/80"
            >
              <MessageCircle size={48} />
            </Button>
          </Link>
          <Link href="/profile">
            <Avatar className="h-9 w-9 border border-gray-300">
              {user?.profileImage ? (
                <AvatarImage
                  src={user.profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gray-100 text-gray-800">
                  {user ? generateInitials(user.name) : "?"}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
