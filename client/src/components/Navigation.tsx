/**
 * Navigation Header Component
 * Cyberpunk theme navigation for DaVinci Dynamics
 */

import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { trackButtonClick, trackConversion } from "@/lib/analytics";
import { openVinciBot } from "@/lib/telegramCtas";
import { brandBreakdownButton } from "@/lib/brandStyles";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Solutions", path: "/solutions" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-300/20 bg-slate-950/88 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="cursor-pointer bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-400 bg-clip-text font-display text-xl font-black text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-colors hover:from-cyan-100 hover:via-cyan-200 hover:to-sky-300 lg:text-2xl"
          >
            DaVinci Dynamics
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`cursor-pointer font-heading font-semibold transition-colors ${
                  isActive(item.path)
                    ? "text-cyan-200"
                    : "text-foreground hover:text-cyan-200"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Button
              type="button"
              size="sm"
              className={brandBreakdownButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                trackButtonClick("Get a Breakdown", { location: "header" });
                trackConversion("demo_booking");
                openVinciBot("audit");
              }}
            >
              Get a Breakdown
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="text-cyan-200 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-cyan-300/20 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block cursor-pointer py-2 font-heading font-semibold transition-colors ${
                    isActive(item.path)
                      ? "text-cyan-200"
                      : "text-foreground hover:text-cyan-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                type="button"
                size="sm"
                className={`${brandBreakdownButton} w-full`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                  trackButtonClick("Get a Breakdown", { location: "header_mobile" });
                  trackConversion("demo_booking");
                  openVinciBot("audit");
                }}
              >
                Get a Breakdown
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
