import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from '../config/navigation';
import { useScreenSize } from '../hooks/useScreenSize';
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
  MoreHorizontal,
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
  Medal,
  MoreHorizontal,
  ChevronDown
};
function IconRenderer({ iconName, className = "h-5 w-5" }) {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
}
function NavigationLinks() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const screenSize = useScreenSize();
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
  const handleDropdownToggle = (itemName, e) => {
    e.preventDefault();
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };
  const handleDropdownItemClick = () => {
    setOpenDropdown(null);
  };
  const getVisibleItems = () => {
    switch (screenSize) {
      case 'xl':
        return navigationItems;
      case 'lg':
        return navigationItems.slice(0, 4); 
      case 'md':
        return navigationItems.slice(0, 3); 
      default:
        return navigationItems.slice(0, 2); 
    }
  };
  const getHiddenItems = () => {
    const visible = getVisibleItems();
    return navigationItems.slice(visible.length);
  };
  const visibleItems = getVisibleItems();
  const hiddenItems = getHiddenItems();
  return (
    <div className="hidden md:flex items-center">
      {}
      <div className="flex items-center space-x-1 mr-3">
        {visibleItems.map((item) => {
          if (item.type === 'dropdown') {
            return (
              <div key={item.name} className="relative">
                <button
                  onClick={(e) => handleDropdownToggle(item.name, e)}
                  className={`${
                    isDropdownActive(item)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 group`}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                    <IconRenderer iconName={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden text-xs font-bold">{item.name.split(' ')[0]}</span>
                  <IconRenderer iconName="ChevronDown" className={`h-4 w-4 transition-transform duration-300 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                </button>
                {}
                {openDropdown === item.name && (
                  <>
                    {}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    {}
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                          {item.name}
                        </div>
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={handleDropdownItemClick}
                            className={`${
                              isActive(child.path)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } px-4 py-2 text-sm flex items-center space-x-3 transition-all duration-300 block w-full`}
                          >
                            <IconRenderer iconName={child.icon} className="h-5 w-5" />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 group`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                <IconRenderer iconName={item.icon} className="h-5 w-5" />
              </span>
              <span className="hidden lg:inline">{item.name}</span>
              <span className="lg:hidden text-xs font-bold">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
      {}
      {hiddenItems.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => handleDropdownToggle('more', e)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
          >
            <IconRenderer iconName="MoreHorizontal" className="h-5 w-5" />
            <span className="hidden lg:inline text-sm font-medium">More</span>
          </button>
          {}
          {openDropdown === 'more' && (
            <>
              {}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpenDropdown(null)}
              />
              {}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  {hiddenItems.map((item) => {
                    if (item.type === 'dropdown') {
                      return (
                        <div key={item.name}>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {item.name}
                          </div>
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={handleDropdownItemClick}
                              className={`${
                                isActive(child.path)
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              } px-4 py-2 text-sm flex items-center space-x-3 transition-all duration-300 block w-full pl-6`}
                            >
                              <IconRenderer iconName={child.icon} className="h-5 w-5" />
                              <span>{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleDropdownItemClick}
                        className={`${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } px-4 py-2 text-sm flex items-center space-x-3 transition-all duration-300 block w-full`}
                      >
                        <IconRenderer iconName={item.icon} className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default NavigationLinks;
