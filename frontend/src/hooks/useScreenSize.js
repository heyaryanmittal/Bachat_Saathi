import { useState, useEffect } from 'react';
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1280) return 'xl';
      if (width >= 1024) return 'lg';
      if (width >= 768) return 'md';
      return 'sm';
    }
    return 'md';
  });
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      let newSize;
      if (width >= 1280) {
        newSize = 'xl';
      } else if (width >= 1024) {
        newSize = 'lg';
      } else if (width >= 768) {
        newSize = 'md';
      } else {
        newSize = 'sm';
      }
      if (newSize !== screenSize) {
        setScreenSize(newSize);
      }
    };
    checkScreenSize();
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [screenSize]);
  return screenSize;
};
export default useScreenSize;
