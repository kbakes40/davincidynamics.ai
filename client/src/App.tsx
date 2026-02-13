import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import SpotifyCallback from "@/pages/SpotifyCallback";
import { Route, Switch } from "wouter";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="pb-20 md:pb-20">
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/solutions"} component={Solutions} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/platform-demo"} component={PlatformDemo} />
        <Route path={"/booking"} component={Booking} />
        <Route path={"/bot-analytics"} component={BotAnalytics} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
          <SpotifyBottomPlayer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
