import React from 'react';
import ModelDashboardHome from '@/components/model/ModelDashboardHome';
import V2VipModel from '@/components/V2VipModel';
const ModelV2DashboardPage = () => {
  return (
    <V2VipModel 
      title="Dashboard" 
      subtitle="Visão geral do seu desempenho e atividades."
      activeId="dashboard"
    >
      <ModelDashboardHome profile={null} modelId="model-1" onSectionChange={() => {}} />
    </V2VipModel>
  );
};
export default ModelV2DashboardPage;