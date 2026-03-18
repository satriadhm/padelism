'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-600)] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    router.replace('/login');
    return null;
  }

  const user = session.user as { name?: string; email?: string; role?: string };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold text-gray-900">Profil</h1>
          <p className="mt-0.5 text-sm text-gray-500">Akun dan preferensi</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <Card padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
              <span className="text-lg font-semibold">{(user.name ?? 'U').slice(0, 1).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-gray-900">{user.name ?? 'User'}</p>
              <p className="truncate text-sm text-gray-600">{user.email ?? '-'}</p>
              <p className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                Role: {user.role ?? '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Keluar</p>
              <p className="text-sm text-gray-500">Akhiri sesi di perangkat ini</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Keluar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

