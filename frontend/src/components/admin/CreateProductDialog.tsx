'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Trash2, PackagePlus, ChevronDown, Star, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createAdminProductAction, addProductImageAction } from '@/actions/admin';
import type { ApiCategory } from '@/lib/api';
import { ImageUpload } from '@/components/ui/image-upload';

// ── Types ──────────────────────────────────────────────────────────────────

interface Variant {
  name: string;
  price: string;
  stock: string;
}

interface ImageRow {
  url: string;
  altText: string;
  isPrimary: boolean;
}

const EMPTY_VARIANT: Variant = { name: '', price: '', stock: '' };
const EMPTY_IMAGE: ImageRow = { url: '', altText: '', isPrimary: false };

// ── Helpers ────────────────────────────────────────────────────────────────

const INPUT =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:border-brand-burgundy/50 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10';

const LABEL = 'text-xs font-medium text-nav-purple';
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
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([{ ...EMPTY_VARIANT }]);

  // Images
  const [images, setImages] = useState<ImageRow[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function reset() {
    setName(''); setDescription(''); setCategoryId(''); setIsFeatured(false);
    setVariants([{ ...EMPTY_VARIANT }]);
    setImages([]); setNewImageUrl(''); setNewImageAlt(''); setUploadingImage(false);
  }

  function handleClose() { setOpen(false); reset(); }

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

    // Auto-include any uploaded image that wasn't manually added via "Agregar"
    const imagesToSave: ImageRow[] = newImageUrl.trim()
      ? [...images, { url: newImageUrl.trim(), altText: newImageAlt.trim(), isPrimary: images.length === 0 }]
      : images;

    startTransition(async () => {
      // 1. Create product
      const result = await createAdminProductAction({
        categoryId, name,
        description: description || undefined,
        isFeatured,
        variants: variants.map((v) => ({
          name: v.name,
          price: parseFloat(v.price),
          stock: v.stock ? parseInt(v.stock) : undefined,
        })),
      });

      if (result.error) { toast.error(result.error); return; }

      // 2. Add images sequentially
      let imageError = false;
      if (result.productId && imagesToSave.length > 0) {
        for (const img of imagesToSave) {
          const imgResult = await addProductImageAction(result.productId, {
            url: img.url,
            altText: img.altText || undefined,
            isPrimary: img.isPrimary,
          });
          if (imgResult.error) {
            toast.error(`Producto creado pero la imagen no se guardó: ${imgResult.error}`);
            imageError = true;
          }
        }
      }

      toast.success(imageError ? `"${name}" creado (revisá las imágenes)` : `"${name}" creado correctamente`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl max-h-[96svh] md:max-h-[92vh]">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6B1A2B]/10">
                  <PackagePlus className="h-4 w-4 text-brand-burgundy" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-nav-purple">Nuevo producto</h2>
                  <p className="text-xs text-muted-foreground">Completá los datos para agregar un producto</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-nav-purple"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — stacked on mobile, two columns on md+ */}
            <form onSubmit={handleSubmit} className="flex flex-1 min-h-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
              {/* Left: info + variants */}
              <div className="flex flex-col shrink-0 border-b border-border px-4 py-4 space-y-5 md:w-80 md:overflow-y-auto md:border-b-0 md:border-r md:px-5 md:py-5">
                {/* Basic info */}
                <div className="space-y-4">
                  <p className={SECTION_TITLE}>Información básica</p>

                  <div className="space-y-1.5">
                    <label className={LABEL}>Nombre <span className="text-brand-burgundy">*</span></label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Torta de chocolate"
                      className={INPUT}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL}>Categoría <span className="text-brand-burgundy">*</span></label>
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
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
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

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 accent-[#6B1A2B]"
                    />
                    <span className="text-sm text-muted-foreground">Marcar como destacado</span>
                  </label>
                </div>

                {/* Variants */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={SECTION_TITLE}>
                      Variantes <span className="normal-case text-brand-burgundy">*</span>
                    </p>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-burgundy transition-colors hover:bg-[#6B1A2B]/8"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="rounded-lg border border-border bg-muted/50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Variante {index + 1}</span>
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
                            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Nombre *</label>
                            <input
                              required
                              value={variant.name}
                              onChange={(e) => updateVariant(index, 'name', e.target.value)}
                              placeholder="Ej: Chico"
                              className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:border-brand-burgundy/50 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Precio *</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">$</span>
                              <input
                                required type="number" min="0" step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                placeholder="0"
                                className="w-full rounded-md border border-border bg-card py-1.5 pl-6 pr-2 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:border-brand-burgundy/50 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Stock</label>
                            <input
                              type="number" min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:border-brand-burgundy/50 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: images + submit */}
              <div className="flex flex-col px-4 py-4 md:flex-1 md:overflow-y-auto md:px-5 md:py-5">
                <div className="flex-1 space-y-4">
                  <p className={SECTION_TITLE}>Imágenes</p>

                  {/* Current image list */}
                  {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-muted-foreground/50">
                      <ImageIcon className="h-8 w-8 opacity-40" />
                      <p className="text-xs">Sin imágenes aún</p>
                      <p className="text-[10px] text-nav-purple/20">La primera que agregues será la principal</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                            img.isPrimary
                              ? 'border-amber-200 bg-amber-50/50'
                              : 'border-border bg-muted/50'
                          }`}
                        >
                          {/* Preview */}
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
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
                            <p className="truncate text-xs font-medium text-nav-purple">{img.url}</p>
                            {img.altText && (
                              <p className="truncate text-[10px] text-muted-foreground/70">{img.altText}</p>
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
                  <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                      Agregar imagen
                    </p>
                    <ImageUpload
                      value={newImageUrl}
                      onChange={(url) => { setNewImageUrl(url); setUploadingImage(false); }}
                      folder="amyrose/products"
                      previewClassName="h-28 w-full"
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
                        disabled={!newImageUrl.trim() || uploadingImage}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#6B1A2B]/10 px-3 py-2 text-xs font-medium text-brand-burgundy transition-colors hover:bg-[#6B1A2B]/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4 pb-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-nav-purple disabled:opacity-50"
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
