import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // TODO: Re-enable auth guards once styling is complete

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
