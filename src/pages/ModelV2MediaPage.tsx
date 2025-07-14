import React from 'react';
import OrganizedMediaManager from '@/components/model/OrganizedMediaManager';
import V2VipModel from '@/components/V2VipModel';

const ModelV2MediaPage = () => {

  return (
    <V2VipModel 
      title="Mídias"
      subtitle="Gerencie suas fotos e vídeos."
      activeId="media"
    >
      <OrganizedMediaManager />
    </V2VipModel>
  );
};

export default ModelV2MediaPage;