
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
        {models.map((model, index) => {
          // Renderizar apenas o item atual e os adjacentes para melhor performance
          const shouldRender = Math.abs(index - currentIndex) <= 1;
          
          if (!shouldRender) {
            return (
              <div 
                key={model.id} 
                className="h-screen w-full snap-start bg-black flex items-center justify-center"
              >
                <div className="text-white">Carregando...</div>
              </div>
            );
          }
          
          // Convert model to reel format for ReelItem
          const reelData = {
            id: `reel-${model.id}`,
            model_id: model.id,
            model_name: model.name,
            model_photo: model.photos?.[0]?.photo_url,
            media_url: model.photos?.[0]?.photo_url || '/placeholder.svg',
            media_type: 'image' as const,
            caption: model.description,
            likes_count: 0,
            comments_count: 0,
            views_count: 0,
            is_liked: false,
            created_at: model.created_at,
            is_online: false,
          };

          return (
            <ReelItem
              key={model.id}
              reel={reelData}
              isActive={index === currentIndex}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ReelsFeed;
