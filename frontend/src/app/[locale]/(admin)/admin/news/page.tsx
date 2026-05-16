import { prisma } from '@/lib/prisma';
import { NewsAdminClient } from '@/components/admin/NewsAdminClient';

export default async function AdminNewsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
  return <NewsAdminClient posts={posts} />;
}
