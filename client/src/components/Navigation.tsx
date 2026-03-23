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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-display font-black text-xl lg:text-2xl text-neon hover:text-accent transition-colors cursor-pointer">
            DaVinci Dynamics
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`font-heading font-semibold transition-colors cursor-pointer ${
                  isActive(item.path)
                    ? "text-accent"
                    : "text-foreground hover:text-accent"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Button
              type="button"
              size="sm"
              className="bg-accent text-background hover:bg-accent/90 font-heading font-bold neon-glow"
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
            className="md:hidden text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-accent/20">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`font-heading font-semibold block py-2 transition-colors cursor-pointer ${
                    isActive(item.path)
                      ? "text-accent"
                      : "text-foreground hover:text-accent"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                type="button"
                size="sm"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold w-full"
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
