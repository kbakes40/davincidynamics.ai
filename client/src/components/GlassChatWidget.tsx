import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useChat } from "@/contexts/ChatContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function GlassChatWidget() {
  const { isOpen, closeChat } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [position, setPosition] = useState({ 
    x: (window.innerWidth - 380) / 2, 
    y: (window.innerHeight - 500) / 2 
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [hasTypedWelcome, setHasTypedWelcome] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const chatMutation = trpc.bot.chat.useMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message with typing animation
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasTypedWelcome) {
      // Start entrance animation
      setIsEntering(true);
      
      // Wait for entrance animation to complete, then start typing
      setTimeout(async () => {
        setIsEntering(false);
        setHasTypedWelcome(true);
        
        const welcomeText = "Hi! I'm Leo, your DaVinci Dynamics business consultant. I help entrepreneurs like you stop throwing money away on platform fees. What are you currently paying monthly for your e-commerce platform?";
        const messageId = "welcome";
        
        // Add empty message placeholder
        const placeholderMessage: Message = {
          id: messageId,
          role: "assistant",
          content: "",
          timestamp: new Date()
        };
        setMessages([placeholderMessage]);
        
        // Stream characters
        for (let i = 0; i <= welcomeText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20)); // 20ms per character
          const currentText = welcomeText.slice(0, i);
          setMessages([{
            id: messageId,
            role: "assistant",
            content: currentText,
            timestamp: new Date()
          }]);
        }
      }, 400); // Match entrance animation duration
    }
  }, [isOpen, hasTypedWelcome]);

  // Exit animation
  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      closeChat();
      setIsAnimating(false);
      setIsEntering(true);
      setHasTypedWelcome(false);
      setMessages([]);
    }, 400);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await chatMutation.mutateAsync({ 
        telegramUser: {
          id: Date.now(), // Anonymous web user
          first_name: "Web User"
        },
        message: inputValue 
      });
      
      setIsTyping(false);
      const fullResponse = typeof response === 'string' ? response : String(response);
      
      // Stream the response character by character
      const messageId = (Date.now() + 1).toString();
      setStreamingMessage("");
      
      // Add empty message placeholder
      const placeholderMessage: Message = {
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, placeholderMessage]);
      
      // Stream characters
      for (let i = 0; i <= fullResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms per character
        const currentText = fullResponse.slice(0, i);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: currentText }
              : msg
          )
        );
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.chat-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 600, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[9998] transition-opacity duration-500"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: isAnimating ? 0 : 1,
        }}
        onClick={handleClose}
      />
      
      {/* Chat widget */}
      <div
        ref={widgetRef}
        className="fixed z-[9999] select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '380px',
          height: isMinimized ? 'auto' : '500px',
        }}
        onMouseDown={handleMouseDown}
      >
      {/* Glass container */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          transform: isAnimating ? 'scale(0.9) translateY(20px)' : isEntering ? 'scale(0.9) translateY(-20px)' : 'scale(1) translateY(0)',
          opacity: isAnimating ? 0 : isEntering ? 0 : 1,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div 
          className="chat-header px-6 py-4 cursor-move flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 150, 200, 0.05) 100%)',
            borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/iAccQzIdIuuxhoEn.png" 
                alt="Leo AI" 
                className="w-12 h-12 object-cover rounded-full"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))'
                }}
              />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Leo</h3>
              <p className="text-[#00D9FF] text-xs">Business Consultant • Online</p>
              <p className="text-gray-400 text-[10px] mt-0.5">Powered by Davinci Dynamics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div 
              className="h-[440px] overflow-y-auto px-6 py-4 space-y-4"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 items-end`}
                >
                  {msg.role === 'assistant' && (
                    <img 
                      src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/iAccQzIdIuuxhoEn.png" 
                      alt="Leo AI" 
                      className="w-8 h-8 object-cover rounded-full flex-shrink-0"
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))'
                      }}
                    />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm'
                    }`}
                    style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.3) 0%, rgba(0, 150, 200, 0.2) 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    }}
                  >
                    <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start gap-2 items-end">
                  <img 
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/iAccQzIdIuuxhoEn.png" 
                    alt="Leo AI" 
                    className="w-8 h-8 object-cover rounded-full flex-shrink-0"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))'
                    }}
                  />
                  <div
                    className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-[#00D9FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#00D9FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#00D9FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div 
              className="px-4 py-4"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderTop: '1px solid rgba(0, 217, 255, 0.1)',
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00D9FF 0%, #0099CC 100%)',
                    boxShadow: '0 4px 12px rgba(0, 217, 255, 0.3)',
                  }}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
