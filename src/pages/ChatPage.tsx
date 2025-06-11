import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, MoreVertical, Send, Paperclip } from "lucide-react";
import api from "@/lib/api";

// Message data types
interface MessageType {
  id: number | string;
  content: string;
  createdAt: string;
  senderId: number | string;
  recipientId: number | string;
  conversationId: number | string;
  attachmentUrl?: string;
  read?: boolean;
}

interface UserType {
  id: number | string;
  name?: string;
  city?: string;
  profileImage?: string;
  [key: string]: any;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientData, setRecipientData] = useState<UserType | null>(null);
  const [conversationId, setConversationId] = useState<number | string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get or create conversation from API
  useEffect(() => {
    if (!user || !id) return;

    const fetchChatData = async () => {
      setIsLoading(true);
      try {
        // Fetch recipient data from API
        const recipientRes = await api.user.getProfile(id);
        if (!recipientRes?.data) {
          toast({
            title: "User not found",
            description: "The user you're trying to chat with doesn't exist",
            variant: "destructive"
          });
          setLocation("/chat");
          return;
        }
        setRecipientData(recipientRes.data);

        // Get or create chat conversation from API
        const chatRes = await api.chat.getOrCreateChat(id);
        const convId = chatRes?.data?.id || chatRes?.data?.chatId;
        if (!convId) {
          toast({
            title: "Chat error",
            description: "Could not start or find conversation",
            variant: "destructive"
          });
          setLocation("/chat");
          return;
        }
        setConversationId(convId);

        // Fetch messages for this conversation
        let msgRes;
        try {
          msgRes = await api.chat.getMessages(convId);
          setMessages(Array.isArray(msgRes.data) ? msgRes.data : msgRes.data?.messages || []);
        } catch {
          setMessages([]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load chat",
          variant: "destructive"
        });
        setLocation("/chat");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [id, user, setLocation, toast]);

  // Scroll to latest message
  useEffect(() => {
    if (messageContainerRef.current && !isLoading) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Group messages by date
  const groupMessagesByDate = (messages: MessageType[]) => {
    if (!messages || !Array.isArray(messages)) return [];
    const grouped: any[] = [];
    let currentDate = "";
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        grouped.push({ type: "date", value: messageDate });
      }
      grouped.push({ type: "message", value: message });
    });
    return grouped;
  };

  const handleBack = () => {
    setLocation("/chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDateSeparator = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  // Handle sending a message using API
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !recipientData || !conversationId) return;

    try {
      // Send message via API
      const sendRes = await api.chat.sendMessage(conversationId, {
        content: message.trim(),
        recipientId: recipientData.id,
      });
      const newMsg: MessageType =
        sendRes.data?.message ||
        sendRes.data ||
        {
          id: Date.now(),
          content: message.trim(),
          createdAt: new Date().toISOString(),
          senderId: user.id,
          recipientId: recipientData.id,
          conversationId,
        };
      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
      if (inputRef.current) inputRef.current.focus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat header */}
      <header className="bg-white py-3 px-4 border-b border-gray-200 flex items-center shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full h-9 w-9 mr-3"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Button>

        <div className="flex items-center flex-1 min-w-0">
          <Avatar className="h-9 w-9 mr-3">
            {recipientData?.profileImage ? (
              <AvatarImage
                src={recipientData.profileImage}
                alt={recipientData.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {recipientData?.name ? generateInitials(recipientData.name) : "?"}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {recipientData?.name || "Contact"}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {recipientData?.city || ""}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 ml-1.5">
          <MoreVertical size={20} className="text-gray-700" />
        </Button>
      </header>

      {/* Message container */}
      <div
        ref={messageContainerRef}
        className="flex-1 py-4 px-4 overflow-y-auto bg-gray-50 scroll-smooth"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : messages && messages.length > 0 ? (
          groupMessagesByDate(messages).map((item, index) => {
            if (item.type === "date") {
              return (
                <div key={`date-${index}`} className="flex justify-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {getDateSeparator(item.value)}
                  </span>
                </div>
              );
            } else {
              const message = item.value;
              const isCurrentUser = user && message.senderId == user.id;

              return (
                <div
                  key={`msg-${message.id}`}
                  className={`mb-3 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl inline-block ${
                        isCurrentUser
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
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
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-gray-500 self-end" : "text-gray-500 self-start"
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            }
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-gray-800 font-medium">No messages</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Start chatting by sending a message to {recipientData?.name}.
            </p>
          </div>
        )}
      </div>

      {/* Fixed message input area at bottom */}
      <div className="bg-white py-3 px-4 border-t border-gray-200 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </Button>

          <div className="flex-1 mx-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-2.5 border-gray-300 rounded-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button
            variant={message.trim() ? "default" : "ghost"}
            size="icon"
            className={`rounded-full h-10 w-10 flex items-center justify-center ${
              message.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-400"
            }`}
            disabled={!message.trim()}
            onClick={handleSendMessage}
          >
            <Send size={18} className={message.trim() ? "text-white" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
}