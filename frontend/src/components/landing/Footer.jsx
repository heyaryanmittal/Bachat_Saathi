import React from 'react';

const Footer = () => {
  const columns = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Security", href: "#features" }
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/" },
        { name: "Careers", href: "/" },
        { name: "Blog", href: "/" },
        { name: "Press", href: "/" }
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/signup" },
        { name: "Contact", href: "/signup" },
        { name: "Privacy Policy", href: "/" },
        { name: "Terms", href: "/" }
      ],
    },
  ];

  return (
    <footer className="bg-foreground text-white/70 py-16">
      <div className="container mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">₹</span>
              </div>
              <span className="font-display font-bold text-xl text-white">Bachat Saathi</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              India's friendliest personal finance companion. Built to help you save more, spend wisely, and stress less about money.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm">
          © {new Date().getFullYear()} Bachat Saathi. Made with ❤️ in India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
