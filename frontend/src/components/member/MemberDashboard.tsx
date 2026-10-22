import React, { useState } from 'react';
import { AppShell } from '../layout/AppShell';
import { MemberHome } from './MemberHome';
import { WorkoutLogger } from './WorkoutLogger';
import { ProgressTracker } from './ProgressTracker';
import { BookingSessions } from './BookingSessions';
import { QRCheckIn } from './QRCheckIn';
import { MemberProfile } from './MemberProfile';
import { DietPlanView } from './DietPlanView';

interface MemberDashboardProps {
  onLogout: () => void;
}

export function MemberDashboard({ onLogout }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <AppShell currentTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <MemberHome />}
      {activeTab === 'workout' && <WorkoutLogger />}
      {activeTab === 'progress' && <ProgressTracker />}
      {activeTab === 'booking' && <BookingSessions />}
      {activeTab === 'checkin' && <QRCheckIn />}
      {activeTab === 'diet' && <DietPlanView />}
      {activeTab === 'profile' && <MemberProfile />}
    </AppShell>
  );
}

export default MemberDashboard;
