import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Panel Admin | MintFolio Control Center',
  description: 'Pusat kendali dan manajemen konten portofolio interaktif tanpa sentuh kode.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
