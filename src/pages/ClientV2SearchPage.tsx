import React from 'react';
import { V2ClientLayout } from '@/components/V2ClientLayout';

export default function ClientV2SearchPage() {
  return (
    <V2ClientLayout title="Buscar" subtitle="Encontre a modelo ideal" activeId="search">
      <div className="p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Buscar Modelos</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    </V2ClientLayout>
  );
}