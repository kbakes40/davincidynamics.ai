import { createContext, useContext, useState, ReactNode } from "react";
import { trackChatEvent, trackConversion } from "@/lib/analytics";

interface ChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => {
    setIsOpen(true);
    trackChatEvent('open');
    trackConversion('chat_started');
  };
  
  const closeChat = () => {
    setIsOpen(false);
    trackChatEvent('close');
  };

  return (
    <ChatContext.Provider value={{ isOpen, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
