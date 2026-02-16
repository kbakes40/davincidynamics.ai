import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Download, MessageSquare, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function ConversationHistory() {
  const [status, setStatus] = useState<"all" | "active" | "handed_off" | "ended">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch conversations list
  const { data: conversationsData, isLoading } = trpc.bot.listConversations.useQuery({
    status,
    searchQuery: searchQuery || undefined,
    limit,
    offset: page * limit,
  });

  // Fetch selected conversation details
  const { data: conversationDetail } = trpc.bot.getConversation.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: selectedConversationId !== null }
  );

  const handleExport = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/trpc/bot.exportConversation?input=${encodeURIComponent(JSON.stringify({ conversationId }))}`);
      const result = await response.json();
      const data = result.result.data;
      
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conversation-${conversationId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export conversation:', error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (conv: any) => {
    if (conv.conversation.metadata && JSON.parse(conv.conversation.metadata).handedOff) {
      return <Badge variant="default" className="bg-cyan-500">Handed Off</Badge>;
    }
    if (conv.conversation.endedAt) {
      return <Badge variant="secondary">Ended</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Conversation History
          </h1>
          <p className="text-muted-foreground">
            Track and review all Leo chatbot conversations from first interaction to handoff
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conversations</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="handed_off">Handed Off</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatus("all");
                  setPage(0);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : conversationsData && conversationsData.conversations.length > 0 ? (
          <div className="space-y-4">
            {conversationsData.conversations.map((item) => {
              const conv = item.conversation;
              const user = item.user;
              const metadata = conv.metadata ? JSON.parse(conv.metadata as string) : {};

              return (
                <Card
                  key={conv.id}
                  className="hover:border-cyan-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-cyan-500" />
                          <h3 className="font-heading font-semibold text-lg">
                            {user?.firstName || user?.username || "Anonymous"}
                            {user?.lastName && ` ${user.lastName}`}
                          </h3>
                          {getStatusBadge(item)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(conv.startedAt), "MMM d, yyyy HH:mm")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{conv.messageCount || 0} messages</span>
                          </div>
                          {metadata.contactInfo && (
                            <div className="col-span-2">
                              <span className="text-cyan-500">
                                📧 {metadata.contactInfo.email || "No email"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(conv.id);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, conversationsData.total)} of {conversationsData.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={(page + 1) * limit >= conversationsData.total}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations found</p>
            </CardContent>
          </Card>
        )}

        {/* Conversation Detail Dialog */}
        <Dialog open={selectedConversationId !== null} onOpenChange={() => setSelectedConversationId(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
              <DialogDescription>
                Full conversation history and metadata
              </DialogDescription>
            </DialogHeader>

            {conversationDetail && (
              <div className="space-y-6">
                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {conversationDetail.user?.firstName || "N/A"} {conversationDetail.user?.lastName || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Username</p>
                      <p className="font-medium">{conversationDetail.user?.username || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{formatDuration(conversationDetail.duration)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Messages</p>
                      <p className="font-medium">{conversationDetail.messages.length}</p>
                    </div>
                    {conversationDetail.metadata.contactInfo && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{conversationDetail.metadata.contactInfo.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{conversationDetail.metadata.contactInfo.phone || "N/A"}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Messages Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Message Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {conversationDetail.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-4 ${
                              msg.role === "user"
                                ? "bg-cyan-500/10 border border-cyan-500/30"
                                : "bg-card border"
                            }`}
                          >
                            <p className="text-xs text-muted-foreground mb-2">
                              {msg.role === "user" ? "User" : "Leo"} • {format(new Date(msg.timestamp), "HH:mm:ss")}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Events */}
                {conversationDetail.events.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lead Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {conversationDetail.events.map((event) => (
                          <div key={event.id} className="flex items-center justify-between text-sm border-b pb-2">
                            <div>
                              <Badge variant="outline">{event.eventType}</Badge>
                              <p className="text-muted-foreground mt-1">
                                {event.eventData && JSON.parse(event.eventData as string).name}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.timestamp), "MMM d, HH:mm")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
