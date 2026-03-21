import React, { useEffect, useRef, useState } from "react";
import { UserPlus, Link2, BarChart3, Sparkles } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Your Account", description: "Sign up in 30 seconds with just your phone number. No paperwork." },
  { icon: Link2, title: "Link Your Accounts", description: "Securely connect your bank accounts and UPI for automatic tracking." },
  { icon: BarChart3, title: "Get Insights", description: "See where your money goes with real-time dashboards and smart categorization." },
  { icon: Sparkles, title: "Grow Your Savings", description: "Set goals, follow personalized tips, and watch your wealth grow steadily." },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-24 lg:py-32" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
      <div className="container mx-auto px-6" ref={ref}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-base font-bold uppercase tracking-widest">How It Works</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6 text-balance leading-tight">
            From signup to savings in minutes
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="text-center space-y-4"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  filter: visible ? 'blur(0)' : 'blur(4px)',
                  transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100 + 100}ms`,
                }}
              >
                <div className="relative mx-auto w-18 h-18 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Icon size={30} className="text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-black flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-xl">{step.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
