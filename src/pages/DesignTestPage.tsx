import React from 'react';
import { useLocation } from 'react-router-dom';
import DesignTestDashboard from './DesignTestDashboard';

export default function DesignTestPage() {
  const location = useLocation();
  
  // Mapeia as rotas para os componentes apropriados
  switch (location.pathname) {
    case '/design-test':
    case '/design-test/dashboard':
      return <DesignTestDashboard />;
    case '/design-test/models':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/clients':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/appointments':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/reviews':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/gallery':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/reels':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/chat':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    case '/design-test/settings':
      return <DesignTestDashboard />; // Temporariamente mostra dashboard
    default:
      return <DesignTestDashboard />;
  }
}