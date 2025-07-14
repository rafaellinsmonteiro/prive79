import React from 'react';
import ModelAppointmentsList from '@/components/model/ModelAppointmentsList';
import V2VipModel from '@/components/V2VipModel';

const ModelV2AppointmentsPage = () => {

  return (
    <V2VipModel 
      title="Agenda" 
      subtitle="Gerencie seus agendamentos e compromissos."
      activeId="appointments"
    >
      <ModelAppointmentsList />
    </V2VipModel>
  );
};

export default ModelV2AppointmentsPage;