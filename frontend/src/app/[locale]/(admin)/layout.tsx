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
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Amy Rose</h2>
          <p className="text-sm text-sidebar-foreground/70">Administración</p>
        </div>
        <nav className="space-y-2">
          <a href={`/${locale}/admin/dashboard`} className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">
            Dashboard
          </a>
          <a href={`/${locale}/admin/products`} className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">
            Productos
          </a>
          <a href={`/${locale}/admin/categories`} className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">
            Categorías
          </a>
          <a href={`/${locale}/admin/orders`} className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">
            Pedidos
          </a>
          <a href={`/${locale}/admin/customers`} className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">
            Clientes
          </a>
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 bg-background p-8">
        {children}
      </main>
    </div>
  );
}
