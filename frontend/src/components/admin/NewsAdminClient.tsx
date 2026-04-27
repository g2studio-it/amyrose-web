'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Newspaper, Link2, Trash2, Eye, EyeOff, Plus, X, Loader2, Pencil,
  Instagram, Facebook, Youtube, Linkedin, Twitter,
} from 'lucide-react';
import { toast } from 'sonner';
import { ArticleFormDialog } from '@/components/admin/ArticleFormDialog';
import { deletePostAction, togglePublishAction } from '@/actions/posts';
import {
  createSocialLinkAction,
  updateSocialLinkAction,
  deleteSocialLinkAction,
} from '@/actions/social-links';

// ── Types ──────────────────────────────────────────────────────────────────

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
};

type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

interface Props {
  posts: Post[];
  socialLinks: SocialLink[];
}

// ── Platform config ────────────────────────────────────────────────────────

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', Icon: Instagram, color: 'text-pink-500' },
  { value: 'facebook', label: 'Facebook', Icon: Facebook, color: 'text-blue-600' },
  { value: 'tiktok', label: 'TikTok', Icon: Link2, color: 'text-slate-800' },
  { value: 'youtube', label: 'YouTube', Icon: Youtube, color: 'text-red-600' },
  { value: 'twitter', label: 'X / Twitter', Icon: Twitter, color: 'text-slate-700' },
  { value: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: 'text-blue-700' },
  { value: 'whatsapp', label: 'WhatsApp', Icon: Link2, color: 'text-green-600' },
  { value: 'other', label: 'Otro', Icon: Link2, color: 'text-[#A98EC5]' },
] as const;

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const found = PLATFORMS.find((p) => p.value === platform);
  const { Icon, color } = found ?? { Icon: Link2, color: 'text-[#A98EC5]' };
  return <Icon className={`${color} ${className ?? 'h-5 w-5'}`} />;
}

const FIELD = 'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30';

// ── Social link form ───────────────────────────────────────────────────────

function SocialLinkForm({
  existing,
  onDone,
}: {
  existing?: SocialLink;
  onDone: () => void;
}) {
  const [platform, setPlatform] = useState(existing?.platform ?? 'instagram');
  const [label, setLabel] = useState(existing?.label ?? '');
  const [url, setUrl] = useState(existing?.url ?? '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;

    startTransition(async () => {
      const result = existing
        ? await updateSocialLinkAction(existing.id, { platform, label: label.trim(), url: url.trim() })
        : await createSocialLinkAction({ platform, label: label.trim(), url: url.trim(), sortOrder: 0 });

      if (!result.success) {
        toast.error('Error al guardar');
        return;
      }
      toast.success(existing ? 'Red actualizada' : 'Red agregada');
      router.refresh();
      onDone();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Plataforma</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={FIELD}>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Etiqueta</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={FIELD} placeholder="Seguinos en Instagram" required />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className={FIELD} placeholder="https://instagram.com/amyrose" type="url" required />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-nav-purple transition-colors">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6B1A2B] text-white text-xs font-medium hover:bg-[#6B1A2B]/85 disabled:opacity-50 transition-colors"
        >
          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          {existing ? 'Guardar' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function NewsAdminClient({ posts, socialLinks }: Props) {
  const [tab, setTab] = useState<'articles' | 'social'>('articles');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleDeletePost = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deletePostAction(id);
      if (!result.success) toast.error('Error al eliminar');
      else { toast.success('Artículo eliminado'); router.refresh(); }
      setDeletingId(null);
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    setTogglingId(id);
    startTransition(async () => {
      await togglePublishAction(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  };

  const handleDeleteSocial = (id: string) => {
    startTransition(async () => {
      await deleteSocialLinkAction(id);
      toast.success('Red eliminada');
      router.refresh();
    });
  };

  const handleToggleSocial = (id: string, current: boolean) => {
    startTransition(async () => {
      await updateSocialLinkAction(id, { isActive: !current });
      router.refresh();
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Contenido</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestión de artículos y redes sociales del sitio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([['articles', 'Artículos', Newspaper], ['social', 'Redes sociales', Link2]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-brand-burgundy text-brand-burgundy'
                : 'border-transparent text-muted-foreground hover:text-nav-purple'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Articles tab ── */}
      {tab === 'articles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{posts.length} artículos</p>
            <ArticleFormDialog />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground/70">
                <Newspaper className="h-10 w-10 opacity-30" />
                <p className="text-sm">No hay artículos aún</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted transition-colors">
                    {/* Thumbnail */}
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Newspaper className="h-5 w-5 text-[#A98EC5]" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-nav-purple truncate">{post.title}</p>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${post.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                          {post.isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        {new Date(post.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(post.id, post.isPublished)}
                        disabled={togglingId === post.id}
                        aria-label={post.isPublished ? 'Despublicar' : 'Publicar'}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-muted hover:text-nav-purple transition-colors disabled:opacity-40"
                      >
                        {togglingId === post.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                        }
                      </button>
                      <ArticleFormDialog post={post} />
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingId === post.id}
                        aria-label="Eliminar artículo"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Social links tab ── */}
      {tab === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{socialLinks.length} redes configuradas</p>
            {!showSocialForm && !editingSocial && (
              <button
                onClick={() => setShowSocialForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6B1A2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B1A2B]/85 transition-colors"
              >
                <Plus className="h-4 w-4" /> Agregar red
              </button>
            )}
          </div>

          {/* Add form */}
          {showSocialForm && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-nav-purple">Nueva red social</p>
                <button onClick={() => setShowSocialForm(false)} className="text-muted-foreground/50 hover:text-nav-purple"><X className="h-4 w-4" /></button>
              </div>
              <SocialLinkForm onDone={() => setShowSocialForm(false)} />
            </div>
          )}

          {/* Edit form */}
          {editingSocial && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-nav-purple">Editar red social</p>
                <button onClick={() => setEditingSocial(null)} className="text-muted-foreground/50 hover:text-nav-purple"><X className="h-4 w-4" /></button>
              </div>
              <SocialLinkForm existing={editingSocial} onDone={() => setEditingSocial(null)} />
            </div>
          )}

          {/* List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {socialLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground/70">
                <Link2 className="h-10 w-10 opacity-30" />
                <p className="text-sm">No hay redes configuradas</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors">
                    <PlatformIcon platform={link.platform} className="h-5 w-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${link.isActive ? 'text-nav-purple' : 'text-muted-foreground/70'}`}>
                        {link.label}
                      </p>
                      <p className="text-xs text-muted-foreground/70 truncate">{link.url}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${link.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-muted text-muted-foreground/70'}`}>
                      {link.isActive ? 'Activa' : 'Oculta'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleSocial(link.id, link.isActive)}
                        aria-label={link.isActive ? 'Ocultar' : 'Mostrar'}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-muted hover:text-nav-purple transition-colors"
                      >
                        {link.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingSocial(link); setShowSocialForm(false); }}
                        aria-label="Editar"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-muted hover:text-nav-purple transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSocial(link.id)}
                        aria-label="Eliminar"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { PlatformIcon };
