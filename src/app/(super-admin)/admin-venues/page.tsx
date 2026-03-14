'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface Venue {
  _id: string;
  name: string;
  ownerId: { name: string; email: string } | string;
  isApproved: boolean;
  isActive: boolean;
  address?: { city: string };
  createdAt: string;
}

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu Persetujuan' },
];

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    try {
      const res = await fetch('/api/admin/venues');
      if (res.ok) {
        const data = await res.json();
        setVenues(data.venues ?? data ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleApproval(venueId: string, approve: boolean) {
    setProcessingId(venueId);
    try {
      const res = await fetch(`/api/admin/venues/${venueId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: approve }),
      });
      if (!res.ok) throw new Error('Gagal memproses');
      toast.success(approve ? 'Venue disetujui!' : 'Venue ditolak');
      setVenues((prev) =>
        prev.map((v) =>
          v._id === venueId ? { ...v, isApproved: approve, isActive: approve } : v,
        ),
      );
    } catch {
      toast.error('Gagal memproses');
    } finally {
      setProcessingId(null);
    }
  }

  const filtered =
    activeTab === 'pending'
      ? venues.filter((v) => !v.isApproved)
      : venues;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Venue</h1>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Venue</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {tab.label}
            {tab.key === 'pending' && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-xs text-yellow-800">
                {venues.filter((v) => !v.isApproved).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Nama Venue</th>
                <th className="px-4 py-3 font-medium">Pemilik</th>
                <th className="px-4 py-3 font-medium">Kota</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    Tidak ada venue.
                  </td>
                </tr>
              ) : (
                filtered.map((venue) => {
                  const ownerName = typeof venue.ownerId === 'object' ? venue.ownerId.name : '-';
                  return (
                    <tr key={venue._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{venue.name}</td>
                      <td className="px-4 py-3 text-gray-600">{ownerName}</td>
                      <td className="px-4 py-3 text-gray-600">{venue.address?.city ?? '-'}</td>
                      <td className="px-4 py-3">
                        {venue.isApproved ? (
                          <Badge variant="success">Disetujui</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!venue.isApproved && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(venue._id, true)}
                              loading={processingId === venue._id}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleApproval(venue._id, false)}
                              loading={processingId === venue._id}
                            >
                              <XCircle className="h-4 w-4" />
                              Tolak
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
