import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import SpotifyCallback from "@/pages/SpotifyCallback";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SpotifyBottomPlayer from "./components/SpotifyBottomPlayer";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Solutions from "./pages/Solutions";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PlatformDemo from "./pages/PlatformDemo";
import BotAnalytics from "./pages/BotAnalytics";
import ConversationHistory from "./pages/ConversationHistory";
import ShopifyAlternative from "./pages/ShopifyAlternative";
import ProfitCrmDemo from "./pages/ProfitCrmDemo";
import ProfitDashboard from "./pages/ProfitDashboard";
import AITeamPage from "./pages/AITeamPage";
import LeadEngineDashboardPage from "./lead-engine/pages/LeadEngineDashboardPage";
import LeadEngineJobsPage from "./lead-engine/pages/LeadEngineJobsPage";
import LeadEngineJobDetailPage from "./lead-engine/pages/LeadEngineJobDetailPage";
import LeadEngineLeadsPage from "./lead-engine/pages/LeadEngineLeadsPage";
import LeadEngineLeadDetailPage from "./lead-engine/pages/LeadEngineLeadDetailPage";
import LeadEnginePipelinePage from "./lead-engine/pages/LeadEnginePipelinePage";
import LeadEngineOutreachPage from "./lead-engine/pages/LeadEngineOutreachPage";
import LeadEngineAnalyticsPage from "./lead-engine/pages/LeadEngineAnalyticsPage";
import LeadEngineCampaignsPage from "./lead-engine/pages/LeadEngineCampaignsPage";
import LeadEngineCampaignDetailPage from "./lead-engine/pages/LeadEngineCampaignDetailPage";
import { BookingProvider } from "./contexts/BookingContext";
import { ChatProvider } from "./contexts/ChatContext";
import GlassChatWidget from "./components/GlassChatWidget";

const staticMarketing = import.meta.env.VITE_STATIC_MARKETING === "true";

/** Reference landing (hookahprice manus) has no sticky nav, chat bubble, or Spotify chrome. */
function FloatingChrome() {
  const [location] = useLocation();
  if (location === "/" || staticMarketing || location.startsWith("/lead-engine")) return null;
  return (
    <>
      <SpotifyBottomPlayer />
      <GlassChatWidget />
    </>
  );
}

function Router() {
  const [location] = useLocation();
  const mainPad =
    location === "/" || staticMarketing || location.startsWith("/lead-engine")
      ? "pb-0"
      : "pb-20 md:pb-20";
  return (
    <div className={mainPad}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/solutions"} component={Solutions} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/pricing"} component={PlatformDemo} />
        <Route path={"/platform-demo"}>
          {() => {
            window.location.replace("/pricing");
            return null;
          }}
        </Route>
        <Route path={"/booking"} component={Booking} />
        <Route path={"/shopify-alternative"}>
          {() => {
            window.location.replace('/shopify');
            return null;
          }}
        </Route>
        <Route path={"/shopify"} component={ShopifyAlternative} />
        <Route path={"/profit-crm-demo"} component={ProfitCrmDemo} />
        <Route path={"/dashboard"} component={ProfitDashboard} />
        <Route path={"/bot-analytics"} component={BotAnalytics} />
        <Route path={"/conversations"} component={ConversationHistory} />
        <Route path={"/spotify-callback"} component={SpotifyCallback} />
        <Route path={"/ai-team"} component={AITeamPage} />
        <Route path={"/ai-team/"} component={AITeamPage} />
        <Route path={"/lead-engine/jobs/:id"} component={LeadEngineJobDetailPage} />
        <Route path={"/lead-engine/jobs"} component={LeadEngineJobsPage} />
        <Route path={"/lead-engine/leads/:id"} component={LeadEngineLeadDetailPage} />
        <Route path={"/lead-engine/leads"} component={LeadEngineLeadsPage} />
        <Route path={"/lead-engine/pipeline"} component={LeadEnginePipelinePage} />
        <Route path={"/lead-engine/outreach"} component={LeadEngineOutreachPage} />
        <Route path={"/lead-engine/campaigns/:id"} component={LeadEngineCampaignDetailPage} />
        <Route path={"/lead-engine/campaigns"} component={LeadEngineCampaignsPage} />
        <Route path={"/lead-engine/analytics"} component={LeadEngineAnalyticsPage} />
        <Route path={"/lead-engine/"} component={LeadEngineDashboardPage} />
        <Route path={"/lead-engine"} component={LeadEngineDashboardPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <ChatProvider>
          <BookingProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <FloatingChrome />
            </TooltipProvider>
          </BookingProvider>
        </ChatProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
