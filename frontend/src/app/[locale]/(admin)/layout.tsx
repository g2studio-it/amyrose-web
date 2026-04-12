import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
