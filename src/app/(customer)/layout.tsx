import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      {children}
      <BottomNav role="customer" />
    </>
  );
}
