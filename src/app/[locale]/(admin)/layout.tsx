import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== 'ADMIN') {
    redirect(`/${locale}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
