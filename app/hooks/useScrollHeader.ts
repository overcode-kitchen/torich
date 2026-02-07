import { useState, useRef, useEffect } from 'react';

export function useScrollHeader() {
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyTitle(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-52px 0px 0px 0px', // 헤더 높이만큼 여유
      }
    );

    observer.observe(titleRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    showStickyTitle,
    titleRef,
  };
}
