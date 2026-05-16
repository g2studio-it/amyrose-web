'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAdminCategoryAction,
  updateAdminCategoryAction,
  deleteAdminCategoryAction,
} from '@/actions/admin';
import type { ApiCategory } from '@/lib/api';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  sortOrder: '0',
  isActive: true,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface Props {
  initialCategories: ApiCategory[];
}

export function CategoriesAdminClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(cat: ApiCategory) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: editingId ? f.slug : slugify(name),
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('El slug es obligatorio');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error('El slug solo puede tener minúsculas, números y guiones');
      return;
    }

    const data = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateAdminCategoryAction(editingId, data)
        : await createAdminCategoryAction(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingId ? 'Categoría actualizada' : 'Categoría creada');
      closeDialog();

      // Optimistic update — server revalidation will sync on next navigation
      if (editingId) {
        setCategories((prev) =>
          prev.map((c): ApiCategory =>
            c.id === editingId
              ? {
                  ...c,
                  name: data.name,
                  slug: data.slug,
                  description: data.description ?? null,
                  isActive: data.isActive,
                  sortOrder: data.sortOrder,
                }
              : c,
          ),
        );
      } else {
        const temp: ApiCategory = {
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          imageUrl: null,
          name: data.name,
          slug: data.slug,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          description: data.description ?? null,
        };
        setCategories((prev) => [...prev, temp]);
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const result = await deleteAdminCategoryAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Categoría eliminada');
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
      setDeleteTarget(null);
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-nav-purple">Categorías</h1>
          <p className="text-sm text-nav-purple/50 mt-0.5">{categories.length} categorías</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-burgundy to-brand-violet px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      {/* Table / empty state */}
      <div className="bg-card rounded-xl border border-nav-lilac-divider/50 overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-nav-purple/40">
            <Tag className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay categorías aún</p>
            <button
              onClick={openCreate}
              className="mt-1 text-xs text-nav-burgundy hover:underline font-medium"
            >
              Crear primera categoría →
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-section-tinted text-nav-purple/50 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 text-left font-medium">Nombre</th>
                    <th className="px-6 py-3 text-left font-medium">Slug</th>
                    <th className="px-6 py-3 text-left font-medium">Descripción</th>
                    <th className="px-6 py-3 text-left font-medium">Orden</th>
                    <th className="px-6 py-3 text-left font-medium">Estado</th>
                    <th className="px-6 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-section-tinted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-brand-lilac-dark/10 flex items-center justify-center shrink-0">
                            <Tag className="h-3.5 w-3.5 text-nav-burgundy" />
                          </div>
                          <p className="font-medium text-nav-purple">{cat.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-section-tinted text-nav-burgundy px-2 py-0.5 rounded font-mono">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-nav-purple/60 text-xs max-w-56">
                        {cat.description ? (
                          <p className="truncate">{cat.description}</p>
                        ) : (
                          <span className="text-nav-purple/30">Sin descripción</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-nav-purple/50 text-xs">{cat.sortOrder}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            cat.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${cat.isActive ? 'bg-green-600' : 'bg-red-600'}`}
                          />
                          {cat.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            aria-label="Editar"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-nav-purple/40 hover:bg-muted hover:text-nav-burgundy transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            aria-label="Eliminar"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-nav-purple/40 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-lilac-dark/10 flex items-center justify-center shrink-0">
                    <Tag className="h-3.5 w-3.5 text-nav-burgundy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-nav-purple truncate">{cat.name}</p>
                    <p className="text-xs text-nav-purple/50 font-mono mt-0.5">{cat.slug}</p>
                  </div>
                  <span
                    className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      cat.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {cat.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <button
                    onClick={() => openEdit(cat)}
                    aria-label="Editar"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-nav-purple/40 hover:bg-muted hover:text-nav-burgundy transition-colors shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    aria-label="Eliminar"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-nav-purple/40 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit dialog ── */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeDialog}
        >
          <div
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-lg text-nav-purple">
                {editingId ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button
                onClick={closeDialog}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-nav-purple/50 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Tortas personalizadas"
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-nav-purple placeholder:text-muted-foreground/40 focus:border-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-nav-purple/50 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  placeholder="ej: tortas-personalizadas"
                  maxLength={120}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono text-nav-burgundy placeholder:text-muted-foreground/40 focus:border-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Solo minúsculas, números y guiones
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-nav-purple/50 mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  maxLength={500}
                  placeholder="Breve descripción de la categoría…"
                  className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-nav-purple placeholder:text-muted-foreground/40 focus:border-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10"
                />
              </div>

              {/* Sort order + Active */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-nav-purple/50 mb-1.5">
                    Orden
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-nav-purple focus:border-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-nav-purple/50">
                    Activa
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`mt-0.5 relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                      form.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        form.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
              <button
                onClick={closeDialog}
                disabled={isPending}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-burgundy to-brand-violet px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando…
                  </>
                ) : editingId ? (
                  'Guardar cambios'
                ) : (
                  'Crear categoría'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-6 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-bold text-nav-purple text-lg">¿Eliminar categoría?</h3>
              <p className="text-sm text-muted-foreground">
                Vas a eliminar{' '}
                <span className="font-semibold text-nav-purple">{deleteTarget.name}</span>.
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-nav-purple hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
