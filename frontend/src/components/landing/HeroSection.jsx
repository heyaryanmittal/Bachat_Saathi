import React from "react";
import { useNavigate } from "react-router-dom";
import { LandingButton as Button } from "./LandingButton";
import { ArrowRight, TrendingUp, Shield, PiggyBank } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden pt-16">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <h1
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight text-balance animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              Your money deserves a
              <span className="text-accent"> better plan</span>
            </h1>

            <p
              className="text-white/70 text-xl sm:text-2xl max-w-xl leading-relaxed animate-fade-up"
              style={{ animationDelay: '200ms' }}
            >
              Track expenses, build savings goals, and take control of your finances — all in one beautifully simple app.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate('/signup')}
              >
                Start Saving Today
                <ArrowRight size={18} />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            <div
              className="flex items-center gap-6 pt-2 animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              {[
                { icon: Shield, text: "Bank-grade security" },
                { icon: PiggyBank, text: "Zero hidden fees" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon size={16} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative hidden lg:flex items-center justify-center animate-fade-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <img
              src="/images/hero-illustration.png"
              alt="Financial growth illustration showing savings trends"
              className="relative z-10 w-full max-w-lg drop-shadow-2xl animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
