import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import NavigationLinks from './NavigationLinks';
import MobileMenu from './MobileMenu';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Bell } from 'lucide-react';
import { Button } from './ui';
function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const isLandingPage = location.pathname === '/';
  if (isLandingPage && !user) return null; 
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] shadow-sm' 
          : 'py-8 bg-transparent'
      }`}
    >
      <div className="container-saas flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <Logo />
          {user && (
            <nav className="hidden lg:flex items-center space-x-1">
               <NavigationLinks />
            </nav>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-xl bg-gray-50 text-[#6B7280] hover:text-[#111827] transition-all">
                <Bell className="w-5 h-5 text-[#111827]" />
              </button>
              <UserMenu />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-gray-50 text-[#6B7280] hover:bg-white transition-all shadow-sm"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">
              <Link to="/login" className="hover:text-primary transition-colors">SignIn</Link>
              <Button onClick={() => navigate('/signup')} className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-md border-none shadow-xl shadow-primary/20">
                Initialize
              </Button>
            </div>
          )}
        </div>
      </div>
      {user && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
export default Navbar;
