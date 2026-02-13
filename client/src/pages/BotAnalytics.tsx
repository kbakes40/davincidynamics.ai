/**
 * Bot Analytics Dashboard
 * Sprint 1: View conversation metrics and lead data
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, TrendingUp, Clock } from "lucide-react";

export default function BotAnalytics() {
  const [telegramUserId, setTelegramUserId] = useState("");
  const [searchId, setSearchId] = useState<number | null>(null);

  const { data: analytics, isLoading } = trpc.bot.analytics.useQuery(
    { telegramUserId: searchId! },
    { enabled: searchId !== null }
  );

  const handleSearch = () => {
    const id = parseInt(telegramUserId);
    if (!isNaN(id)) {
      setSearchId(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bot Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track conversations, engagement, and lead quality from your Telegram bot
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search User Analytics</CardTitle>
            <CardDescription>
              Enter a Telegram user ID to view their conversation history and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Enter Telegram User ID"
                value={telegramUserId}
                onChange={(e) => setTelegramUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Display */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        )}

        {analytics && !isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversations
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalConversations}</div>
                <p className="text-xs text-muted-foreground">
                  Conversation sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Messages
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Messages exchanged
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Messages/Conv
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgMessagesPerConversation}</div>
                <p className="text-xs text-muted-foreground">
                  Engagement metric
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outcomes
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.outcomes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Completed conversations
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {analytics && analytics.outcomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conversation Outcomes</CardTitle>
              <CardDescription>
                How conversations ended for this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.outcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{outcome || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {searchId && !isLoading && !analytics && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No data found for this user ID</p>
            </CardContent>
          </Card>
        )}

        {!searchId && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Enter a Telegram User ID above to view analytics
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
