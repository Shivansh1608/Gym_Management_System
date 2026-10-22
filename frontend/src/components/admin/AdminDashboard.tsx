import React, { useState } from 'react';
import { AppShell } from '../layout/AppShell';
import { AdminHome } from './AdminHome';
import { MemberManagement } from './MemberManagement';
import { StaffManagement } from './StaffManagement';
import { RevenueAnalytics } from './RevenueAnalytics';
import { EquipmentInventory } from './EquipmentInventory';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <AppShell currentTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <AdminHome />}
      {activeTab === 'members' && <MemberManagement />}
      {activeTab === 'staff' && <StaffManagement />}
      {activeTab === 'revenue' && <RevenueAnalytics />}
      {activeTab === 'equipment' && <EquipmentInventory />}
    </AppShell>
  );
}

export default AdminDashboard;
