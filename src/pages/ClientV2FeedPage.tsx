import React from 'react';
import { V2ClientLayout } from '@/components/V2ClientLayout';

export default function ClientV2FeedPage() {
  return (
    <V2ClientLayout title="Feed" subtitle="Novidades e atualizações" activeId="feed">
      <div className="p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Feed de Novidades</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    </V2ClientLayout>
  );
}