import { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Calendar, Star, Users, X } from 'lucide-react';
import api from '../../services/api';

interface Staff {
  _id: string;
  user: any;
  role: string;
  specialization: string[];
  rating: number;
  activeClients: number;
  joinDate: string;
}

export function StaffManagement() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'trainers' | 'staff'>('all');
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [activeFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.getAllStaff(activeFilter === 'all' ? undefined : activeFilter);
      if (response.data?.staff) {
        setStaffMembers(response.data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffMembers;

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2">Staff Management</h2>
          <p className="text-gray-600">Manage trainers and staff members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 justify-center"
        >
          <UserPlus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            activeFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Staff ({staffMembers.length})
        </button>
        <button
          onClick={() => setActiveFilter('trainers')}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            activeFilter === 'trainers'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Trainers ({staffMembers.filter(s => s.user?.role === 'trainer').length})
        </button>
        <button
          onClick={() => setActiveFilter('staff')}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            activeFilter === 'staff'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Other Staff ({staffMembers.filter(s => s.user?.role !== 'trainer').length})
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredStaff.map((staff) => (
          <div key={staff._id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                {staff.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
              </div>
              <div className="flex-1">
                <h3 className="mb-1">{staff.user?.name || 'Staff Member'}</h3>
                <p className="text-purple-600 mb-2">{staff.role}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{(staff.rating ?? 4.8).toFixed(1)}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {(staff.activeClients ?? 0) > 0 && `${staff.activeClients} clients`}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {staff.user?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{staff.user.email}</span>
                </div>
              )}
              {staff.user?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{staff.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(staff.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Specializations */}
            {staff.specialization && staff.specialization.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Specializations</div>
                <div className="flex flex-wrap gap-2">
                  {staff.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                View Profile
              </button>
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-400 mb-2">No Staff Members</h3>
          <p className="text-gray-500">Add staff members to get started</p>
        </div>
      )}
    </div>
  );
}
