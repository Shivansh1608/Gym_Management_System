import React, { useState } from 'react';
import { AppShell } from '../layout/AppShell';
import { TrainerHome } from './TrainerHome';
import { ClientManagement } from './ClientManagement';
import { WorkoutPlans } from './WorkoutPlans';
import { TrainerSchedule } from './TrainerSchedule';

interface TrainerDashboardProps {
  onLogout: () => void;
}

export function TrainerDashboard({ onLogout }: TrainerDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <AppShell currentTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <TrainerHome />}
      {activeTab === 'schedule' && <TrainerSchedule />}
      {activeTab === 'clients' && <ClientManagement />}
      {activeTab === 'plans' && <WorkoutPlans />}
    </AppShell>
  );
}

export default TrainerDashboard;
