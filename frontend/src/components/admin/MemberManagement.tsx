import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, MoreVertical, Mail, Phone, Calendar, CheckCircle2, XCircle, Edit2, Trash2, X } from 'lucide-react';
import api from '../../services/api';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: string;
  status: 'active' | 'expired' | 'frozen';
  joinDate: string;
  expiryDate?: string;
  lastCheckIn?: string;
}

export function MemberManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'frozen'>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    planType: 'Monthly Basic',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    price: 99,
  });

  useEffect(() => {
    fetchMembers();
  }, [filterStatus]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllMembers(filterStatus === 'all' ? undefined : filterStatus, searchQuery || undefined);
      if (response.data?.members) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchMembers();
      } else {
        fetchMembers();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMember(newMember);
      setShowAddModal(false);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        password: '',
        planType: 'Monthly Basic',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        price: 99,
      });
      fetchMembers();
      alert('Member created successfully!');
    } catch (error: any) {
      alert('Error creating member: ' + error.message);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.deleteMember(id);
      fetchMembers();
      alert('Member deleted successfully!');
    } catch (error: any) {
      alert('Error deleting member: ' + error.message);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const statusCounts = {
    all: members.length,
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    frozen: members.filter(m => m.status === 'frozen').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      case 'frozen':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2">Member Management</h2>
          <p className="text-gray-600">Manage all gym members and their memberships</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 justify-center"
        >
          <UserPlus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl transition-colors ${
            filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="text-2xl mb-1">{statusCounts.all}</div>
          <div className={filterStatus === 'all' ? 'text-purple-100' : 'text-gray-600'}>
            Total Members
          </div>
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`p-4 rounded-xl transition-colors ${
            filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="text-2xl mb-1">{statusCounts.active}</div>
          <div className={filterStatus === 'active' ? 'text-green-100' : 'text-gray-600'}>
            Active
          </div>
        </button>
        <button
          onClick={() => setFilterStatus('expired')}
          className={`p-4 rounded-xl transition-colors ${
            filterStatus === 'expired' ? 'bg-red-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="text-2xl mb-1">{statusCounts.expired}</div>
          <div className={filterStatus === 'expired' ? 'text-red-100' : 'text-gray-600'}>
            Expired
          </div>
        </button>
        <button
          onClick={() => setFilterStatus('frozen')}
          className={`p-4 rounded-xl transition-colors ${
            filterStatus === 'frozen' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="text-2xl mb-1">{statusCounts.frozen}</div>
          <div className={filterStatus === 'frozen' ? 'text-blue-100' : 'text-gray-600'}>
            Frozen
          </div>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Members List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="mb-1">{member.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(member.status)}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
                {member.expiryDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {new Date(member.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                  {member.plan}
                </span>
                {member.lastCheckIn && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                    Last check-in: {new Date(member.lastCheckIn).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-400 mb-2">No Members Found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3>Add New Member</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Password</label>
                  <input
                    type="password"
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Plan Type</label>
                  <select
                    value={newMember.planType}
                    onChange={(e) => setNewMember({ ...newMember, planType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option>Monthly Basic</option>
                    <option>Monthly Premium</option>
                    <option>Quarterly Premium</option>
                    <option>Annual Premium</option>
                    <option>Premium Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Price</label>
                  <input
                    type="number"
                    value={newMember.price}
                    onChange={(e) => setNewMember({ ...newMember, price: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newMember.startDate}
                    onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">End Date</label>
                  <input
                    type="date"
                    value={newMember.endDate}
                    onChange={(e) => setNewMember({ ...newMember, endDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Create Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
