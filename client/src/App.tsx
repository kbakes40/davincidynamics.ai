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
import { BookingProvider } from "./contexts/BookingContext";
import { ChatProvider } from "./contexts/ChatContext";
import GlassChatWidget from "./components/GlassChatWidget";

/** Reference landing (hookahprice manus) has no sticky nav, chat bubble, or Spotify chrome. */
function FloatingChrome() {
  const [location] = useLocation();
  if (location === "/") return null;
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
    location === "/" ? "pb-0" : "pb-20 md:pb-20";
  return (
    <div className={mainPad}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/solutions"} component={Solutions} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/platform-demo"} component={PlatformDemo} />
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
