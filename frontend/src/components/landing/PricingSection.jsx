import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { LandingButton as Button } from "./LandingButton";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Essential tools for personal finance tracking.",
    features: [
      "Basic expense tracking",
      "Manual bank sync",
      "1 savings goal",
      "Monthly reports",
      "Community support"
    ],
    buttonText: "Start for Free",
    variant: "outline",
    backgroundClass: "bg-white dark:bg-slate-900 border-slate-100",
    glowColor: "from-slate-200 to-slate-300",
    accentColor: "text-slate-900",
    buttonAccent: "hover:border-slate-900"
  },
  {
    name: "Standard",
    price: "₹199",
    period: "/mo",
    description: "Perfect for disciplined savers and planners.",
    features: [
      "Automated UPI imports",
      "Unlimited savings goals",
      "Real-time budget alerts",
      "Advanced visualizations",
      "Debt repayment tracker"
    ],
    buttonText: "Go Standard",
    variant: "default",
    backgroundClass: "bg-amber-50 dark:bg-amber-950/10 border-amber-200/50",
    glowColor: "from-amber-200 to-amber-300",
    accentColor: "text-amber-700",
    buttonAccent: "shadow-amber-200"
  },
  {
    name: "Premium",
    price: "₹499",
    period: "/mo",
    description: "The ultimate wealth management suite.",
    features: [
      "AI-powered insights",
      "Full Bank aggregation",
      "Investment tracking",
      "Family account sharing",
      "Priority 24/7 support",
      "Custom categories"
    ],
    buttonText: "Go Premium",
    variant: "hero",
    premium: true,
    backgroundClass: "bg-slate-900 text-white border-primary shadow-primary/30",
    glowColor: "from-primary to-emerald-500",
    accentColor: "text-primary",
    buttonAccent: "shadow-primary/40"
  }
];

const PricingSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-background relative" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-primary text-base font-bold uppercase tracking-widest">Pricing</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6 text-balance leading-tight">
            Plans for every <span className="text-primary">financial journey</span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Choose the plan that fits your needs. No hidden charges, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`group relative p-10 rounded-[2.5rem] border transition-all duration-700 hover:scale-[1.08] hover:-translate-y-6 cursor-default overflow-hidden ${plan.backgroundClass} shadow-xl flex flex-col`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`
              }}
            >
              {/* Animated Glow on Hover */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${plan.glowColor} rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
              
              {/* Background Shine */}
              <div className={`absolute top-0 right-0 w-40 h-40 ${plan.premium ? 'bg-primary/5' : 'bg-highlight/5'} rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500`}></div>

              <div className="relative z-10 space-y-8 flex-1 flex flex-col">
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-widest mb-2 transition-colors duration-500 ${plan.accentColor} group-hover:opacity-80`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-500 origin-left inline-block">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                  </div>
                  <p className={`mt-4 text-sm font-medium ${plan.premium ? "text-slate-400" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-4 group/item">
                      <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${plan.premium ? "bg-primary/20 text-primary group-hover/item:bg-primary group-hover/item:text-white" : "bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-white"}`}>
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className={`text-[13px] font-bold transition-colors duration-300 ${plan.premium ? "text-slate-300 group-hover/item:text-white" : "text-slate-600 dark:text-slate-400 group-hover/item:text-primary"}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.variant} 
                  className={`w-full h-15 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg group-hover:scale-105 transition-all duration-500 mt-8 ${plan.buttonAccent}`}
                  onClick={() => navigate('/signup')}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center mt-12 text-sm text-muted-foreground font-medium uppercase tracking-widest animate-pulse">
           ✨ Current Default: All users start on Free Plan
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
