
import { useState, useEffect, useRef } from "react";
import { Model } from "@/hooks/useModels";
import { ReelsSettings } from "@/hooks/useReelsSettings";
import ReelItem from "./ReelItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReelsFeedProps {
  models: Model[];
  settings?: ReelsSettings | null;
}

const ReelsFeed = ({ models, settings }: ReelsFeedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling) return;
      
      const scrollTop = container.scrollTop;
      const itemHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < models.length) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, models.length, isScrolling]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    setIsScrolling(true);
    container.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth'
    });

    setTimeout(() => setIsScrolling(false), 500);
  };

  const handleSwipeUp = () => {
    if (currentIndex < models.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  return (
    <div className={`h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide ${
      !isMobile ? 'flex justify-center bg-black' : ''
    }`}>
      <div 
        ref={containerRef}
        className={`${
          isMobile ? 'h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide' : 'w-full max-w-md h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {models.map((model, index) => (
          <ReelItem
            key={model.id}
            model={model}
            isActive={index === currentIndex}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            settings={settings}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

export default ReelsFeed;
