import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from '../config/navigation';
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
  ChevronDown
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
  Medal
};
function IconRenderer({ iconName, className = "h-5 w-5" }) {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
}
function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  const isActive = (path) => {
    return location.pathname === path;
  };
  const isDropdownActive = (item) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };
  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };
  if (!isOpen) return null;
  return (
    <div className="md:hidden py-4 animate-fadeInUp border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-2">
        {navigationItems.map((item) => {
          if (item.type === 'dropdown') {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`${
                    isDropdownActive(item)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between w-full`}
                >
                  <div className="flex items-center space-x-3">
                    <IconRenderer iconName={item.icon} className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <IconRenderer iconName="ChevronDown" className={`h-5 w-5 transition-transform duration-300 ${expandedItems[item.name] ? 'rotate-180' : ''}`} />
                </button>
                {}
                {expandedItems[item.name] && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={`${
                          isActive(child.path)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        } px-4 py-2 rounded-lg text-sm flex items-center space-x-3 transition-all duration-300 block`}
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
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              } px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-3`}
            >
              <IconRenderer iconName={item.icon} className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export default MobileMenu;
