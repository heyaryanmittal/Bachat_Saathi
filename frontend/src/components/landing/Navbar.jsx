import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingButton as Button } from "./LandingButton";
import { Menu, X } from "lucide-react";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EEA62B] dark:bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 sm:px-8">
        <Logo isLight={true} className="scale-110" />

        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-full text-white/90 dark:text-foreground/80 hover:text-white dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-foreground/5 transition-all font-bold text-[13px] tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="text-white/90 dark:text-foreground/80 hover:text-white dark:hover:text-foreground font-bold text-[13px] tracking-wide transition-colors"
          >
            Log in
          </button>
          <Button
            size="sm"
            className="bg-white dark:bg-primary text-black dark:text-white hover:bg-slate-50 dark:hover:bg-primary/90 text-[13px] font-black uppercase tracking-widest px-8 h-10 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>

        </div>

        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            className="text-white dark:text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>


      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3 animate-fade-up">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/login')}>Log in</Button>
            <Button size="sm" className="flex-1 bg-white text-black dark:bg-primary dark:text-white" onClick={() => navigate('/signup')}>Get Started</Button>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

