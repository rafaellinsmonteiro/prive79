
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeTyping } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

interface TypingIndicatorProps {
  conversationId: string;
}

const TypingIndicator = ({ conversationId }: TypingIndicatorProps) => {
  const { user } = useAuth();
  
  const { data: typingUsers = [] } = useQuery({
    queryKey: ['typing-indicators', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('typing_indicators')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_typing', true)
        .neq('user_id', user?.id || '') // Exclude current user
        .gt('updated_at', new Date(Date.now() - 10000).toISOString()); // Only get typing indicators from last 10 seconds

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId && !!user,
    refetchInterval: 1000, // Refetch every second to keep it current
  });

  useRealtimeTyping(conversationId);

  // Don't show typing indicator if no users are typing or if the data is stale
  if (typingUsers.length === 0) return null;

  // Additional check: filter out stale typing indicators
  const activeTypingUsers = typingUsers.filter(user => {
    const updatedAt = new Date(user.updated_at);
    const now = new Date();
    const timeDiff = now.getTime() - updatedAt.getTime();
    return timeDiff < 10000; // Only show if updated within last 10 seconds
  });

  if (activeTypingUsers.length === 0) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-zinc-800 rounded-lg p-3 max-w-[70%]">
        <div className="flex items-center space-x-1">
          <span className="text-zinc-400 text-sm">Digitando</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
