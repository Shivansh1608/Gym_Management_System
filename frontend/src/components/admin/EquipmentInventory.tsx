import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Wrench,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DataTable, Column } from '../ui/data-table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import api from '../../services/api';
import { toast } from 'sonner';

interface EquipmentItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  quantity: number;
  status: 'operational' | 'maintenance' | 'broken';
  lastServiceDate?: string;
}

const defaultEquipment: EquipmentItem[] = [
  {
    id: '1',
    name: 'Olympic Barbell & Bumper Plates (20kg)',
    category: 'Free Weights',
    quantity: 12,
    status: 'operational',
    lastServiceDate: '2026-09-15',
  },
  {
    id: '2',
    name: 'Commercial Power Rack Cage',
    category: 'Racks',
    quantity: 6,
    status: 'operational',
    lastServiceDate: '2026-08-20',
  },
  {
    id: '3',
    name: 'Cable Crossover Dual Pulley System',
    category: 'Cables',
    quantity: 3,
    status: 'maintenance',
    lastServiceDate: '2026-10-10',
  },
  {
    id: '4',
    name: 'Assault AirBike Pro',
    category: 'Cardio',
    quantity: 8,
    status: 'operational',
    lastServiceDate: '2026-09-02',
  },
  {
    id: '5',
    name: 'Concept2 RowERG Machine',
    category: 'Cardio',
    quantity: 6,
    status: 'broken',
    lastServiceDate: '2026-10-01',
  },
  {
    id: '6',
    name: 'Incline Adjustable Benches',
    category: 'Free Weights',
    quantity: 10,
    status: 'operational',
    lastServiceDate: '2026-07-18',
  },
];

export const EquipmentInventory: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(defaultEquipment);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Free Weights');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newStatus, setNewStatus] = useState<'operational' | 'maintenance' | 'broken'>('operational');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const res: any = await api.getEquipment();
        if (Array.isArray(res) && res.length > 0) {
          setEquipmentList(res);
        }
      } catch (e) {
        // Fallback to default equipment
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item = {
        name: newName,
        category: newCategory,
        quantity: Number(newQuantity),
        status: newStatus,
        lastServiceDate: new Date().toISOString().split('T')[0],
      };
      const created: any = await api.addEquipment(item);
      setEquipmentList((prev) => [created.id ? created : { ...item, id: `${Date.now()}` }, ...prev]);
      toast.success('Equipment asset logged successfully!');
      setIsModalOpen(false);
      setNewName('');
      setNewQuantity(1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save equipment');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus: 'operational' | 'maintenance' | 'broken' =
      currentStatus === 'operational'
        ? 'maintenance'
        : currentStatus === 'maintenance'
        ? 'broken'
        : 'operational';

    setEquipmentList((prev) =>
      prev.map((item) => ((item.id === id || item._id === id) ? { ...item, status: nextStatus } : item))
    );
    toast.info(`Updated status to ${nextStatus.toUpperCase()}`);
  };

  const statusConfig = {
    operational: {
      label: 'Operational',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: CheckCircle,
    },
    maintenance: {
      label: 'Maintenance',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: AlertTriangle,
    },
    broken: {
      label: 'Out of Order',
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      icon: XCircle,
    },
  };

  const columns: Column<EquipmentItem>[] = [
    {
      key: 'name',
      header: 'Equipment Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-foreground block">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.category || 'General Equipment'}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Total Units',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm font-semibold">{item.quantity}</span>
      ),
    },
    {
      key: 'status',
      header: 'Current Status',
      sortable: true,
      render: (item) => {
        const conf = statusConfig[item.status] || statusConfig.operational;
        const Icon = conf.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {conf.label}
          </span>
        );
      },
    },
    {
      key: 'lastServiceDate',
      header: 'Last Inspection',
      render: (item) => (
        <span className="text-xs text-muted-foreground font-mono">
          {item.lastServiceDate || '2026-09-01'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => {
        const id = item.id || item._id || '';
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(id, item.status)}
            className="rounded-xl text-xs h-8 border-border/80 gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            Cycle Status
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-primary" />
            Equipment & Facilities Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track condition, maintenance schedules, safety certifications, and availability across gym facilities.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl font-semibold shadow-md shadow-primary/20 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Equipment Asset
        </Button>
      </div>

      {/* Equipment Table */}
      <DataTable
        data={equipmentList}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search equipment by name..."
        enableExport={true}
        exportFileName="gym_equipment_inventory.csv"
      />

      {/* Add Equipment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-3xl max-w-md p-6 bg-card/95 backdrop-blur-xl border-border/80">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display font-bold text-xl">Log New Equipment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Equipment Description
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Rogue Calibrated Steel Plates"
                required
                className="rounded-xl h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-foreground outline-none"
                >
                  <option value="Free Weights">Free Weights</option>
                  <option value="Racks">Racks & Cages</option>
                  <option value="Cables">Cables & Machines</option>
                  <option value="Cardio">Cardio Conditioning</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Quantity Units
                </label>
                <Input
                  type="number"
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  required
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Initial Condition
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-foreground outline-none"
              >
                <option value="operational">Operational & Certified</option>
                <option value="maintenance">Scheduled Maintenance</option>
                <option value="broken">Out of Order / Repair Needed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 rounded-xl font-semibold shadow-md">
                Save Asset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border-border/80"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentInventory;
