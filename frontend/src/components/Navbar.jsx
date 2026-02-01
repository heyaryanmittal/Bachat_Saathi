import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import NavigationLinks from './NavigationLinks';
import MobileMenu from './MobileMenu';
import PointsInfoModal from './PointsInfoModal';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Info, X } from 'lucide-react';

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  const isLandingPage = location.pathname === '/';
  const isPointsInfoPage = location.pathname === '/points-info';

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-lg border-b shadow-soft transition-all duration-300 ${
      isLandingPage
        ? 'bg-white/90 dark:bg-gray-900/90 border-gray-200/30 dark:border-gray-700/30'
        : 'bg-white/80 dark:bg-gray-900/80 border-gray-200/20 dark:border-gray-700/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation - Centered */}
          {user && (
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="flex items-center max-w-4xl w-full">
                <NavigationLinks />
              </div>
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <ThemeToggle />
            
            {user && (
              <button
                onClick={() => isPointsInfoPage ? navigate(-1) : navigate('/points-info')}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isPointsInfoPage 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isPointsInfoPage ? "Back to previous page" : "Points & Policies"}
              >
                {isPointsInfoPage ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </button>
            )}

            <UserMenu />

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
        
      </div>

      {/* Points Info Modal - Only show when not on the points-info page */}
      {!isPointsInfoPage && (
        <PointsInfoModal 
          isOpen={isPointsModalOpen} 
          onClose={() => setIsPointsModalOpen(false)} 
        />
      )}
    </nav>
  );
}

export default Navbar;
