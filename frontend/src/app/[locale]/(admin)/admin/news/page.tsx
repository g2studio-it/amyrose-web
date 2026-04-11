import { prisma } from '@/lib/prisma';
import { NewsAdminClient } from '@/components/admin/NewsAdminClient';

export default async function AdminNewsPage() {
  const [posts, socialLinks] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((prisma as any).socialLink as typeof prisma.socialLink | undefined)
      ?.findMany({ orderBy: [{ sortOrder: 'asc' }, { platform: 'asc' }] })
      .catch(() => []) ?? Promise.resolve([]),
  ]);

  return <NewsAdminClient posts={posts} socialLinks={socialLinks} />;
}
