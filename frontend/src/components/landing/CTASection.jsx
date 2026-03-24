import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingButton as Button } from "./LandingButton";
import { ArrowRight } from "lucide-react";
const CTASection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section id="pricing" className="py-24 lg:py-32 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '28px 28px',
      }} />
      <div
        className="container mx-auto px-6 text-center relative z-10"
        ref={ref}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          filter: visible ? 'blur(0)' : 'blur(4px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 text-balance leading-tight">
          Start your savings journey today
        </h2>
        <p className="text-white/70 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Join lakhs of Indians who are already building a stronger financial future with Bachat Saathi. Always free to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" onClick={() => navigate('/signup')}>
            Create Free Account
            <ArrowRight size={18} />
          </Button>
          <Button
            variant="hero-outline"
            size="xl"
            onClick={() => navigate('/signup')}
          >
            Explore Plans
          </Button>
        </div>
      </div>
    </section>
  );
};
export default CTASection;
