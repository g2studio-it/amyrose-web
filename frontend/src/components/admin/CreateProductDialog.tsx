'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Trash2, PackagePlus, ChevronDown, ImageIcon, Star } from 'lucide-react';
import { toast } from 'sonner';
import { createAdminProductAction, addProductImageAction } from '@/actions/admin';
import type { ApiCategory } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface Variant {
  name: string;
  price: string;
  stock: string;
  sku: string;
}

interface ImageRow {
  url: string;
  altText: string;
  isPrimary: boolean;
}

const EMPTY_VARIANT: Variant = { name: '', price: '', stock: '', sku: '' };
const EMPTY_IMAGE: ImageRow = { url: '', altText: '', isPrimary: false };

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const INPUT =
  'w-full rounded-lg border border-[#6B1A2B]/20 bg-white px-3 py-2 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none focus:ring-2 focus:ring-[#6B1A2B]/10';

const LABEL = 'text-xs font-medium text-[#3B1F5E]';
const SECTION_TITLE =
  'text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A98EC5]';

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  categories: ApiCategory[];
}

export function CreateProductDialog({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Basic info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([{ ...EMPTY_VARIANT }]);

  // Images
  const [images, setImages] = useState<ImageRow[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────

  function reset() {
    setName(''); setSlug(''); setSlugManual(false);
    setDescription(''); setCategoryId(''); setIsFeatured(false);
    setVariants([{ ...EMPTY_VARIANT }]);
    setImages([]); setNewImageUrl(''); setNewImageAlt('');
  }

  function handleClose() { setOpen(false); reset(); }

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  // ── Variant helpers ───────────────────────────────────────────────────────

  function addVariant() { setVariants((v) => [...v, { ...EMPTY_VARIANT }]); }
  function removeVariant(i: number) { setVariants((v) => v.filter((_, idx) => idx !== i)); }
  function updateVariant(i: number, field: keyof Variant, val: string) {
    setVariants((v) => v.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));
  }

  // ── Image helpers ─────────────────────────────────────────────────────────

  function addImage() {
    if (!newImageUrl.trim()) return;
    const isPrimary = images.length === 0; // first image is auto-primary
    setImages((prev) => [...prev, { url: newImageUrl.trim(), altText: newImageAlt.trim(), isPrimary }]);
    setNewImageUrl(''); setNewImageAlt('');
  }

  function removeImage(i: number) {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      // If we removed the primary, promote the first remaining
      if (prev[i].isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  }

  function setPrimary(i: number) {
    setImages((prev) => prev.map((img, idx) => ({ ...img, isPrimary: idx === i })));
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId) { toast.error('Seleccioná una categoría'); return; }
    if (variants.some((v) => !v.name || !v.price)) {
      toast.error('Completá nombre y precio en todas las variantes'); return;
    }

    startTransition(async () => {
      // 1. Create product
      const result = await createAdminProductAction({
        categoryId, name, slug,
        description: description || undefined,
        isFeatured,
        variants: variants.map((v) => ({
          name: v.name,
          price: parseFloat(v.price),
          stock: v.stock ? parseInt(v.stock) : undefined,
          sku: v.sku || undefined,
        })),
      });

      if (result.error) { toast.error(result.error); return; }

      // 2. Add images sequentially
      if (result.productId && images.length > 0) {
        for (const img of images) {
          const imgResult = await addProductImageAction(result.productId, {
            url: img.url,
            altText: img.altText || undefined,
            isPrimary: img.isPrimary,
          });
          if (imgResult.error) {
            toast.warning(`Producto creado, pero error al subir imagen: ${imgResult.error}`);
          }
        }
      }

      toast.success(`"${name}" creado correctamente`);
      handleClose();
    });
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#6B1A2B] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1624] focus-visible:outline-none"
      >
        <Plus className="h-4 w-4" />
        Nuevo producto
      </button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '92vh' }}>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#6B1A2B]/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6B1A2B]/10">
                  <PackagePlus className="h-4 w-4 text-[#6B1A2B]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#3B1F5E]">Nuevo producto</h2>
                  <p className="text-xs text-[#3B1F5E]/50">Completá los datos para agregar un producto</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-[#3B1F5E]/40 transition-colors hover:bg-[#F9F5FB] hover:text-[#3B1F5E]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — two columns */}
            <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
              {/* Left: info + variants */}
              <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-[#6B1A2B]/8 px-5 py-5 space-y-5">
                {/* Basic info */}
                <div className="space-y-4">
                  <p className={SECTION_TITLE}>Información básica</p>

                  <div className="space-y-1.5">
                    <label className={LABEL}>Nombre <span className="text-[#6B1A2B]">*</span></label>
                    <input
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ej: Torta de chocolate"
                      className={INPUT}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL}>Slug <span className="text-[#6B1A2B]">*</span></label>
                    <input
                      required
                      value={slug}
                      onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                      placeholder="torta-de-chocolate"
                      className={`${INPUT} font-mono text-xs`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL}>Categoría <span className="text-[#6B1A2B]">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={`${INPUT} appearance-none pr-8`}
                      >
                        <option value="">Seleccioná una categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#3B1F5E]/40" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL}>Descripción</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Descripción del producto (opcional)"
                      className={`${INPUT} resize-none`}
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#6B1A2B]/15 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 accent-[#6B1A2B]"
                    />
                    <span className="text-sm text-[#3B1F5E]/70">Marcar como destacado</span>
                  </label>
                </div>

                {/* Variants */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={SECTION_TITLE}>
                      Variantes <span className="normal-case text-[#6B1A2B]">*</span>
                    </p>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#6B1A2B] transition-colors hover:bg-[#6B1A2B]/8"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="rounded-lg border border-[#6B1A2B]/12 bg-[#F9F5FB]/50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-[#3B1F5E]/50">Variante {index + 1}</span>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="rounded p-0.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">Nombre *</label>
                            <input
                              required
                              value={variant.name}
                              onChange={(e) => updateVariant(index, 'name', e.target.value)}
                              placeholder="Ej: Chico"
                              className="w-full rounded-md border border-[#6B1A2B]/20 bg-white px-2.5 py-1.5 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">Precio *</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#3B1F5E]/40">$</span>
                              <input
                                required type="number" min="0" step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                placeholder="0"
                                className="w-full rounded-md border border-[#6B1A2B]/20 bg-white py-1.5 pl-6 pr-2 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">Stock</label>
                            <input
                              type="number" min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-md border border-[#6B1A2B]/20 bg-white px-2.5 py-1.5 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">SKU</label>
                            <input
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                              placeholder="Opcional"
                              className="w-full rounded-md border border-[#6B1A2B]/20 bg-white px-2.5 py-1.5 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: images + submit */}
              <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5">
                <div className="flex-1 space-y-4">
                  <p className={SECTION_TITLE}>Imágenes</p>

                  {/* Current image list */}
                  {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#6B1A2B]/15 py-10 text-[#3B1F5E]/30">
                      <ImageIcon className="h-8 w-8 opacity-40" />
                      <p className="text-xs">Sin imágenes aún</p>
                      <p className="text-[10px] text-[#3B1F5E]/20">La primera que agregues será la principal</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                            img.isPrimary
                              ? 'border-amber-200 bg-amber-50/50'
                              : 'border-[#6B1A2B]/12 bg-[#F9F5FB]/50'
                          }`}
                        >
                          {/* Preview */}
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[#6B1A2B]/10 bg-[#F9F5FB]">
                            <img
                              src={img.url}
                              alt={img.altText || ''}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-[#3B1F5E]">{img.url}</p>
                            {img.altText && (
                              <p className="truncate text-[10px] text-[#3B1F5E]/40">{img.altText}</p>
                            )}
                          </div>

                          {/* Primary badge / set primary button */}
                          {img.isPrimary ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              <Star className="h-2.5 w-2.5" />
                              Principal
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrimary(i)}
                              title="Marcar como principal"
                              className="shrink-0 rounded-md p-1.5 text-amber-400 transition-colors hover:bg-amber-50"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="shrink-0 rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add image form */}
                  <div className="space-y-2 rounded-lg border border-dashed border-[#6B1A2B]/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3B1F5E]/40">
                      Agregar imagen
                    </p>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className={INPUT}
                    />
                    <div className="flex gap-2">
                      <input
                        value={newImageAlt}
                        onChange={(e) => setNewImageAlt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                        placeholder="Texto alternativo (opcional)"
                        className={`${INPUT} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        disabled={!newImageUrl.trim()}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#6B1A2B]/10 px-3 py-2 text-xs font-medium text-[#6B1A2B] transition-colors hover:bg-[#6B1A2B]/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 shrink-0 flex items-center justify-end gap-3 border-t border-[#6B1A2B]/10 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-[#3B1F5E]/60 transition-colors hover:bg-[#F9F5FB] hover:text-[#3B1F5E] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#6B1A2B] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1624] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Crear producto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
