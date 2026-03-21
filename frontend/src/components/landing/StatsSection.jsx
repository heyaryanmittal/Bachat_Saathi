import React, { useEffect, useRef, useState } from "react";
const stats = [
  { value: "2.4L+", label: "Active savers" },
  { value: "₹127Cr", label: "Tracked this month" },
  { value: "4.8★", label: "App Store rating" },
  { value: "18%", label: "Avg. savings increase" },
];
const StatsSection = () => {
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
    <section className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center space-y-1"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 90}ms`,
              }}
            >
              <div className="font-display text-4xl sm:text-5xl font-bold text-primary tabular-nums mb-1">{stat.value}</div>
              <div className="text-muted-foreground text-base font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
