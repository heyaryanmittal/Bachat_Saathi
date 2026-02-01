import React from 'react';
import { Link } from 'react-router-dom';

function Logo() {
  return (
    <div className="flex items-center">
      <Link
        to="/"
        className="flex items-center space-x-2 group"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-lg">₹</span>
        </div>
        <span className="text-2xl font-bold text-gradient">
          BachatSaathi
        </span>
      </Link>
    </div>
  );
}

export default Logo;
