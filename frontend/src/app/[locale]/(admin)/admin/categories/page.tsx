import { getAdminCategoriesAction } from '@/actions/admin';
import { CategoriesAdminClient } from '@/components/admin/CategoriesAdminClient';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesAction().catch(() => []);

  return (
    <div className="p-6">
      <CategoriesAdminClient initialCategories={categories} />
    </div>
  );
}
