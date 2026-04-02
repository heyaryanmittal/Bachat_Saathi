import React, { useEffect, useRef, useState } from "react";
import { BarChart3, Target, Wallet, BellRing, PieChart, ArrowDownUp } from "lucide-react";
const features = [
  {
    icon: Wallet,
    title: "Expense Tracking",
    description: "Automatically categorize and track every rupee you spend with smart detection.",
  },
  {
    icon: Target,
    title: "Savings Goals",
    description: "Set personalized goals — from emergency funds to dream vacations — and watch your progress.",
  },
  {
    icon: BarChart3,
    title: "Visual Reports",
    description: "Beautiful charts and insights that make understanding your finances effortless.",
  },
  {
    icon: BellRing,
    title: "Smart Reminders",
    description: "Never miss a bill payment or SIP date with intelligent, timely notifications.",
  },
  {
    icon: PieChart,
    title: "Budget Planning",
    description: "Create monthly budgets by category and stay on track with real-time alerts.",
  },
  {
    icon: ArrowDownUp,
    title: "UPI & Bank Sync",
    description: "Connect your accounts for automatic transaction imports — no manual entry needed.",
  },
];
const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const Icon = feature.icon;
  return (
    <div
      ref={ref}
      className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`,
      }}
    >
      { }
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8 group-hover:from-primary group-hover:to-emerald-600 transition-all duration-500 shadow-inner">
          <Icon size={30} className="text-primary group-hover:text-white transition-colors duration-500" />
        </div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-4 tracking-tight leading-none">{feature.title}</h3>
        <p className="text-muted-foreground text-base leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">{feature.description}</p>
      </div>
      <div className="absolute bottom-6 left-10 w-12 h-1 bg-primary/20 rounded-full group-hover:w-24 group-hover:bg-primary transition-all duration-500"></div>
    </div>
  );
};
const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-base font-bold uppercase tracking-widest">Features</span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mt-4 mb-6 text-balance leading-tight">
            Everything you need to manage your money
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Simple yet powerful tools designed for the way Indians save, spend, and plan.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const ref = useRef(null);
            const [visible, setVisible] = useState(false);
            useEffect(() => {
              const observer = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setVisible(true); },
                { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
              );
              if (ref.current) observer.observe(ref.current);
              return () => observer.disconnect();
            }, []);
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={ref}
                className="group relative h-full"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(32px)',
                  transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`,
                }}
              >
                { }
                <div className="relative h-full bg-primary rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-start text-left shadow-2xl shadow-primary/20 group-hover:bg-emerald-700 transition-all duration-500 overflow-hidden">
                  { }
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  { }
                  <div className="mb-6 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon size={28} className="text-white drop-shadow-md" />
                  </div>
                  { }
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-xl text-[#fbbf24] tracking-tight leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-base leading-relaxed font-medium">
                      {feature.description}
                    </p>
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
export default FeaturesSection;
