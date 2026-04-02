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
                className="group relative h-full"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  filter: visible ? 'blur(0)' : 'blur(4px)',
                  transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`,
                }}
              >
                { }
                <div className="relative h-full bg-primary rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl shadow-primary/20 group-hover:bg-emerald-700 transition-all duration-500 overflow-hidden">
                  { }
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  { }
                  <div className="mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon size={34} className="text-white drop-shadow-md" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-xl text-[#fbbf24] tracking-tight leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-white/80 text-[13px] leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                  { }
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[#fbbf24] text-white text-lg font-black flex items-center justify-center shadow-lg border-2 border-white/20">
                    {i + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default HowItWorksSection;
