'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface Sport {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export default function AdminSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🏸');
  const [newColor, setNewColor] = useState('#3B82F6');

  useEffect(() => {
    fetchSports();
  }, []);

  async function fetchSports() {
    try {
      const res = await fetch('/api/admin/sports');
      if (res.ok) { const data = await res.json(); setSports(data.sports ?? data ?? []); }
    } catch { /* silently fail */ } finally { setLoading(false); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/sports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), icon: newIcon, color: newColor }),
      });
      if (!res.ok) throw new Error('Gagal menambahkan');
      const data = await res.json();
      setSports((prev) => [...prev, data.sport ?? data]);
      setNewName(''); setNewIcon('🏸'); setNewColor('#3B82F6');
      toast.success('Olahraga berhasil ditambahkan!');
    } catch { toast.error('Gagal menambahkan'); } finally { setSaving(false); }
  }

  async function toggleActive(sportId: string, isActive: boolean) {
    setTogglingId(sportId);
    try {
      const res = await fetch(`/api/admin/sports/${sportId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui');
      setSports((prev) => prev.map((s) => s._id === sportId ? { ...s, isActive: !isActive } : s));
      toast.success(!isActive ? 'Diaktifkan' : 'Dinonaktifkan');
    } catch { toast.error('Gagal memperbarui'); } finally { setTogglingId(null); }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Olahraga</h1>
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Olahraga</h1>

      {/* Add Form */}
      <Card padding="lg">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Tambah Jenis Olahraga</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <Input label="Nama" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Badminton" className="w-48" />
          <Input label="Emoji Icon" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="w-24" />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Warna</label>
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
              className="h-[38px] w-14 cursor-pointer rounded-lg border border-gray-300" />
          </div>
          <Button type="submit" loading={saving}>Tambah</Button>
        </form>
      </Card>

      {/* Sports Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Warna</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sports.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">Belum ada data olahraga.</td></tr>
              ) : sports.map((sport) => (
                <tr key={sport._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{sport.name}</td>
                  <td className="px-4 py-3 text-xl">{sport.icon}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: sport.color }} />
                      <span className="font-mono text-xs text-gray-500">{sport.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sport.isActive ? 'success' : 'default'}>
                      {sport.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(sport._id, sport.isActive)}
                      disabled={togglingId === sport._id}
                      className={cn('relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)] focus:ring-offset-2 disabled:opacity-50',
                        sport.isActive ? 'bg-[var(--color-brand-600)]' : 'bg-gray-300')}>
                      <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                        sport.isActive ? 'translate-x-5' : 'translate-x-0')} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
