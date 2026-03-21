import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingButton as Button } from "./LandingButton";
import { Menu, X } from "lucide-react";
import Logo from "../Logo";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EEA62B] shadow-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 sm:px-8">
        <Logo variant="white" className="scale-110" />

        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all font-bold text-[13px] tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-white/90 hover:text-white font-bold text-[13px] tracking-wide transition-colors"
          >
            Log in
          </button>
          <Button 
            size="sm" 
            className="bg-white text-[#EEA62B] hover:bg-slate-50 text-[12px] font-black uppercase tracking-widest px-8 h-10 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            <Button variant="ghost" size="sm" className="flex-1">Log in</Button>
            <Button size="sm" className="flex-1">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
