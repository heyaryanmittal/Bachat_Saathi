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
      className="group relative bg-card rounded-2xl p-7 border border-border/60 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms`,
      }}
    >
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
        <Icon size={26} className="text-primary" />
      </div>
      <h3 className="font-display font-semibold text-xl text-foreground mb-3">{feature.title}</h3>
      <p className="text-muted-foreground text-base leading-relaxed">{feature.description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-base font-bold uppercase tracking-widest">Features</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6 text-balance leading-tight">
            Everything you need to manage your money
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Simple yet powerful tools designed for the way Indians save, spend, and plan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
