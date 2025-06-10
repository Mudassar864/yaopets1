import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo, generateInitials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type ChatMessageProps = {
  message: any;
  sender?: any;
  showTime?: boolean;
};

export default function ChatMessage({ message, sender, showTime = true }: ChatMessageProps) {
  const { user } = useAuth();
  const isSent = message.senderId === user?.id;
  
  return (
    <div className={`flex mb-4 ${isSent ? 'justify-end' : ''}`}>
      {!isSent && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          {sender?.profileImage ? (
            <AvatarImage src={sender.profileImage} alt={sender.name} />
          ) : (
            <AvatarFallback className="bg-neutral-200 text-neutral-700">
              {sender ? generateInitials(sender.name) : "?"}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div 
        className={`rounded-lg p-3 max-w-[80%] shadow-sm ${
          isSent 
            ? 'bg-primary text-white' 
            : 'bg-white text-neutral-800'
        }`}
      >
        {message.attachmentUrl && (
          <div className="rounded-lg overflow-hidden mb-2">
            <img 
              src={message.attachmentUrl} 
              alt="Attachment" 
              className="w-full max-h-48 object-cover"
            />
          </div>
        )}
        
        <p className={`text-sm ${isSent ? 'text-white' : 'text-neutral-800'}`}>
          {message.content}
        </p>
        
        {showTime && (
          <span 
            className={`text-xs text-right block mt-1 ${
              isSent ? 'text-white/70' : 'text-neutral-500'
            }`}
          >
            {formatTimeAgo(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}