import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from '../config/navigation';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  ArrowLeftRight, 
  TrendingUp, 
  Calculator, 
  BarChart3, 
  Trophy, 
  Target, 
  Medal, 
  Crown,
  BookOpen,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
const iconMap = {
  LayoutDashboard,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Calculator,
  BarChart3,
  Trophy,
  Target,
  Medal,
  Crown,
  BookOpen,
  ChevronDown
};
function IconRenderer({ iconName, className = "h-5 w-5" }) {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
}
function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isActive = (path) => location.pathname === path;
  const isDropdownActive = (item) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };
  const NavItem = ({ item, isChild = false }) => {
    const active = isActive(item.path);
    const hasChildren = item.type === 'dropdown';
    const dropdownOpen = openDropdown === item.name || isDropdownActive(item);
    if (hasChildren) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => toggleDropdown(item.name)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
              ${isDropdownActive(item) 
                ? 'bg-primary/10 text-primary' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}
          >
            <div className="flex items-center space-x-3">
              <IconRenderer iconName={item.icon} className={`h-5 w-5 ${isDropdownActive(item) ? 'text-primary' : 'group-hover:scale-110'}`} />
              <span className="font-semibold text-sm">{item.name}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
          </button>
          {(openDropdown === item.name || isDropdownActive(item)) && (
            <div className="pl-12 space-y-1 animate-scale-in origin-top">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-all duration-200
                    ${isActive(child.path)
                      ? 'text-primary font-bold'
                      : 'text-slate-500 hover:text-primary dark:hover:text-white hover:translate-x-1'}`}
                >
                  <IconRenderer iconName={child.icon} className="h-4 w-4" />
                  <span>{child.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
          ${active 
            ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/20' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}
      >
        <IconRenderer iconName={item.icon} className={`h-5 w-5 ${active ? 'text-white' : 'group-hover:scale-110'}`} />
        <span className="font-semibold text-sm">{item.name}</span>
      </Link>
    );
  };
  return (
    <>
      {}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>
      {}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      {}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/50 z-40 transition-transform duration-500 lg:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {}
        <div className="flex flex-col h-full p-6">
          {}
          <div className="mb-10 px-2 group">
            <Logo 
              to="/dashboard" 
              className="h-8 group-hover:scale-105 transition-transform" 
              isLight={darkMode} 
            />
          </div>
          {}
          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
          {}
          <div className="mt-auto pt-6 border-t border-slate-800/50 space-y-4">
            <Link 
              to="/profile" 
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold shadow-inner">
                {user?.name?.charAt(0) || <User className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] text-emerald-500 font-black truncate uppercase tracking-widest">Free Plan</p>
                </div>
              </div>
            </Link>
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
