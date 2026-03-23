/**
 * Embedded AI Chat Widget
 * Draggable chat interface that stays on the page
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, MessageCircle, Send, Minimize2, Maximize2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { TG } from "@/lib/telegramCtas";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface EmbeddedChatWidgetProps {
  bookingContext?: {
    name?: string;
    email?: string;
    phone?: string;
    package?: string;
    message?: string;
  };
}

export default function EmbeddedChatWidget({ bookingContext }: EmbeddedChatWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (bookingContext) {
      return [
        {
          role: "assistant",
          content: `🎉 **Thank you so much for choosing DaVinci Dynamics, ${bookingContext.name || 'valued customer'}!**\n\nWe're absolutely thrilled to have you on board! Your ${bookingContext.package || 'selected package'} is an excellent choice.\n\n**What happens next:**\n\n✅ Our team will reach out within 24 hours to confirm your setup details\n📅 We'll schedule your platform onboarding session\n🚀 Your custom e-commerce platform will be ready in 7-10 business days\n\nIn the meantime, feel free to ask me any questions about your new platform. We're here to make this transition as smooth as possible!\n\nWelcome to the DaVinci family! 🙌`,
          timestamp: new Date(),
        },
      ];
    }
    return [
      {
        role: "assistant",
        content: `👋 **Welcome to DaVinci Dynamics!**\n\nI'm here to help you navigate the website.\n\n**For detailed questions about:**\n💰 Pricing & packages\n🎥 Platform features\n🚀 How it works\n📞 Custom solutions\n\n**Chat with Vinci on Telegram:**\n[Open @VinciDynamicsBot](${TG.contact})\n\n**I can help you with:**\n📍 Navigate the site\n📍 View pricing\n📍 Contact information`,
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Generate a session ID for this user
  const [sessionId] = useState(() => Math.floor(Math.random() * 1000000000));

  const chatMutation = trpc.bot.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble right now. Please try again or book a call with our team!",
          timestamp: new Date(),
        },
      ]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    // Call AI
    chatMutation.mutate({
      telegramUser: {
        id: sessionId,
        username: "web_user",
        first_name: "Website",
        last_name: "Visitor",
      },
      message: userMessage,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".chat-header")) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 400));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 500));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[9999]"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      ref={widgetRef}
      className="fixed z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "400px",
        height: isMinimized ? "60px" : "500px",
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full flex flex-col shadow-2xl border-2 border-primary/20">
        {/* Header */}
        <div className="chat-header flex items-center justify-between p-4 border-b bg-primary text-primary-foreground cursor-move">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">DaVinci AI Assistant</h3>
              <p className="text-xs opacity-80">
                {chatMutation.isPending ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={chatMutation.isPending || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
