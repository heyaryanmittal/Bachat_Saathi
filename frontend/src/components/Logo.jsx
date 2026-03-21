import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

function Logo({ isLight = true, className = "", to = "/" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Link
        to={to}
        className="flex items-center space-x-3 group"
      >
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-lg shadow-primary/20">
          <Wallet className="text-white w-5 h-5 stroke-[2.5]" />
        </div>
        <span className={`text-xl font-black tracking-tighter uppercase whitespace-nowrap transition-colors ${isLight ? 'text-white' : 'text-foreground'}`}>
          BachatSaathi
        </span>
      </Link>
    </div>
  );
}

export default Logo;
