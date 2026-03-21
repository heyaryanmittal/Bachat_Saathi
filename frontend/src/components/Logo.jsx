import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

function Logo({ isLight = false }) {
  return (
    <div className="flex items-center">
      <Link
        to="/"
        className="flex items-center space-x-2 group"
      >
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 shadow-sm">
          <Wallet className="text-white w-4.5 h-4.5 stroke-[2.5]" />
        </div>
        <span className={`text-lg font-bold tracking-tighter uppercase whitespace-nowrap overflow-hidden transition-colors ${isLight ? 'text-white' : 'text-[#111827]'}`}>
          BachatSaathi
        </span>
      </Link>
    </div>
  );
}

export default Logo;
