'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'customer', label: 'Customer' },
  { key: 'venue_owner', label: 'Venue Owner' },
  { key: 'staff', label: 'Staff' },
  { key: 'super_admin', label: 'Admin' },
];

const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  venue_owner: 'Venue Owner',
  staff: 'Staff',
  super_admin: 'Admin',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users ?? data ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function toggleActive(userId: string, isActive: boolean) {
    setTogglingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u)),
      );
      toast.success(!isActive ? 'Pengguna diaktifkan' : 'Pengguna dinonaktifkan');
    } catch {
      toast.error('Gagal memperbarui status');
    } finally {
      setTogglingId(null);
    }
  }

  const filtered =
    activeTab === 'all'
      ? users
      : users.filter((u) => u.role === activeTab);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>

      {/* Role Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    Tidak ada pengguna.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{ROLE_LABELS[user.role] ?? user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'error'}>
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(user._id, user.isActive)}
                        disabled={togglingId === user._id}
                        className={cn(
                          'relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:ring-offset-2 disabled:opacity-50',
                          user.isActive ? 'bg-[#16a34a]' : 'bg-gray-300',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                            user.isActive ? 'translate-x-5' : 'translate-x-0',
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
