'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Pencil,
  Trash2,
  Plus,
  Star,
  ImageIcon,
  PackageOpen,
  Check,
  Loader2,
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import {
  updateAdminProductAction,
  addProductImageAction,
  updateProductImageAction,
  deleteProductImageAction,
  addProductVariantAction,
  updateProductVariantAction,
  deleteProductVariantAction,
} from '@/actions/admin';
import type { ApiProduct, ApiCategory, ApiImage, ApiVariant } from '@/lib/api';

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
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:border-brand-burgundy/50 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10';

// ── Image row ──────────────────────────────────────────────────────────────

function ImageRow({ image, productId }: { image: ApiImage; productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setPrimary = () =>
    startTransition(async () => {
      const res = await updateProductImageAction(productId, image.id, { isPrimary: true });
      if (res.error) toast.error(res.error);
      else { toast.success('Imagen principal actualizada'); router.refresh(); }
    });

  const remove = () =>
    startTransition(async () => {
      const res = await deleteProductImageAction(productId, image.id);
      if (res.error) toast.error(res.error);
      else { toast.success('Imagen eliminada'); router.refresh(); }
    });

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-2.5">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
        <img src={image.url} alt={image.altText ?? ''} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-nav-purple">{image.url}</p>
        {image.altText && (
          <p className="truncate text-[10px] text-muted-foreground/70">{image.altText}</p>
        )}
      </div>

      {image.isPrimary && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          <Star className="h-2.5 w-2.5" />
          Principal
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1">
        {!image.isPrimary && (
          <button
            onClick={setPrimary}
            disabled={isPending}
            title="Marcar como principal"
            className="rounded-md p-1.5 text-amber-500 transition-colors hover:bg-amber-50 disabled:opacity-40"
          >
            <Star className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={remove}
          disabled={isPending}
          title="Eliminar"
          className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ── Add image form ─────────────────────────────────────────────────────────

function AddImageForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!url.trim()) return;
    startTransition(async () => {
      const res = await addProductImageAction(productId, {
        url: url.trim(),
        altText: altText.trim() || undefined,
        isPrimary,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success('Imagen agregada');
        setUrl(''); setAltText(''); setIsPrimary(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        Agregar imagen
      </p>
      <ImageUpload
        value={url}
        onChange={setUrl}
        folder="amyrose/products"
        previewClassName="h-28 w-full"
      />
      <div className="flex gap-2">
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Texto alternativo (opcional)"
          className={`${INPUT} flex-1`}
        />
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="accent-[#6B1A2B]"
          />
          Principal
        </label>
      </div>
      <button
        onClick={handleAdd}
        disabled={!url.trim() || isPending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B1A2B]/10 px-3 py-1.5 text-xs font-medium text-brand-burgundy transition-colors hover:bg-[#6B1A2B]/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Agregar
      </button>
    </div>
  );
}

// ── Variant row ────────────────────────────────────────────────────────────

function VariantRow({ variant, productId }: { variant: ApiVariant; productId: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(variant.name);
  const [price, setPrice] = useState(String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!editing) {
      setName(variant.name);
      setPrice(String(variant.price));
      setStock(String(variant.stock));
    }
  }, [variant, editing]);

  const save = () =>
    startTransition(async () => {
      const res = await updateProductVariantAction(productId, variant.id, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
      });
      if (res.error) toast.error(res.error);
      else { toast.success('Variante actualizada'); setEditing(false); router.refresh(); }
    });

  const remove = () =>
    startTransition(async () => {
      const res = await deleteProductVariantAction(productId, variant.id);
      if (res.error) toast.error(res.error);
      else { toast.success('Variante eliminada'); router.refresh(); }
    });

  const toggleActive = () =>
    startTransition(async () => {
      const res = await updateProductVariantAction(productId, variant.id, {
        isActive: !variant.isActive,
      });
      if (res.error) toast.error(res.error);
      else router.refresh();
    });

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
      {editing ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Precio</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                  className={`${INPUT} pl-6`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Stock</label>
              <input
                type="number" min="0"
                value={stock} onChange={(e) => setStock(e.target.value)}
                className={INPUT}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save} disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md bg-[#6B1A2B] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Guardar
            </button>
            <button
              onClick={() => setEditing(false)} disabled={isPending}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-card"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={toggleActive} disabled={isPending}
            title={variant.isActive ? 'Desactivar' : 'Activar'}
            className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors disabled:opacity-40 ${
              variant.isActive ? 'border-green-500 bg-green-500' : 'border-[#3B1F5E]/20 bg-transparent'
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${variant.isActive ? 'text-nav-purple' : 'text-muted-foreground/70 line-through'}`}>
              {variant.name}
            </p>
            <p className="text-xs text-muted-foreground">
              ${Number(variant.price).toLocaleString('es-AR')} · {variant.stock} en stock
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setEditing(true)} disabled={isPending}
              className="rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-card hover:text-nav-purple"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={remove} disabled={isPending}
              className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add variant form ───────────────────────────────────────────────────────

function AddVariantForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!name.trim() || !price) return;
    startTransition(async () => {
      const res = await addProductVariantAction(productId, {
        name: name.trim(),
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : undefined,
        sku: sku.trim() || undefined,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success('Variante agregada');
        setName(''); setPrice(''); setStock(''); setSku('');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        Nueva variante
      </p>
      <input
        value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Nombre (ej: Chico, Grande…)"
        className={INPUT}
      />
      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">$</span>
          <input
            type="number" min="0" step="0.01"
            value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio"
            className={`${INPUT} pl-6`}
          />
        </div>
        <input
          type="number" min="0"
          value={stock} onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          className={INPUT}
        />
        <input
          value={sku} onChange={(e) => setSku(e.target.value)}
          placeholder="SKU"
          className={INPUT}
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={!name.trim() || !price || isPending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B1A2B]/10 px-3 py-1.5 text-xs font-medium text-brand-burgundy transition-colors hover:bg-[#6B1A2B]/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Agregar
      </button>
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────────────

interface Props {
  product: ApiProduct;
  categories: ApiCategory[];
}

export function EditProductDialog({ product, categories }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Basic info state — reset from prop when dialog opens
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description ?? '');
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [isActive, setIsActive] = useState(product.isActive);

  // Sync when server re-renders with fresh data after router.refresh()
  useEffect(() => {
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description ?? '');
    setCategoryId(product.categoryId);
    setIsFeatured(product.isFeatured);
    setIsActive(product.isActive);
  }, [product]);

  const handleSave = () =>
    startTransition(async () => {
      const res = await updateAdminProductAction(product.id, {
        name,
        slug,
        description: description || undefined,
        categoryId,
        isFeatured,
        isActive,
      });
      if (res.error) toast.error(res.error);
      else { toast.success('Producto actualizado'); router.refresh(); }
    });

  const sortedImages = [...product.images].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder,
  );
  const sortedVariants = [...product.variants].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        title="Editar producto"
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-nav-purple"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" style={{ maxHeight: '92vh' }}>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6B1A2B]/10">
                  <PackageOpen className="h-4 w-4 text-brand-burgundy" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-nav-purple">Editar producto</h2>
                  <p className="max-w-xs truncate text-xs text-muted-foreground/70">{product.name}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-nav-purple"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — two columns */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: basic info */}
              <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border px-5 py-5">
                <div className="flex-1 space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A98EC5]">
                    Información básica
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-nav-purple">Nombre *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={INPUT}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-nav-purple">Slug *</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className={`${INPUT} font-mono text-xs`}
                    />
                    <button
                      type="button"
                      onClick={() => setSlug(slugify(name))}
                      className="text-[10px] text-brand-burgundy/60 hover:text-brand-burgundy"
                    >
                      ↺ Regenerar desde nombre
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-nav-purple">Categoría *</label>
                    <div className="relative">
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={`${INPUT} appearance-none pr-8`}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-nav-purple">Descripción</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Sin descripción"
                      className={`${INPUT} resize-none`}
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="h-4 w-4 accent-[#6B1A2B]"
                      />
                      <span className="text-sm text-muted-foreground">Destacado</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 accent-[#6B1A2B]"
                      />
                      <span className="text-sm text-muted-foreground">Activo</span>
                    </label>
                  </div>
                </div>

                {/* Save */}
                <div className="mt-5 shrink-0 border-t border-border pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6B1A2B] py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1624] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Guardar cambios
                  </button>
                </div>
              </div>

              {/* Right: images + variants */}
              <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5 space-y-6">
                {/* Images */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A98EC5]">
                    Imágenes
                  </p>
                  {sortedImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-muted-foreground/50">
                      <ImageIcon className="h-8 w-8 opacity-40" />
                      <p className="text-xs">Sin imágenes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedImages.map((img) => (
                        <ImageRow key={img.id} image={img} productId={product.id} />
                      ))}
                    </div>
                  )}
                  <AddImageForm productId={product.id} />
                </div>

                {/* Variants */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A98EC5]">
                    Variantes
                  </p>
                  {sortedVariants.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50">Sin variantes</p>
                  ) : (
                    <div className="space-y-2">
                      {sortedVariants.map((v) => (
                        <VariantRow key={v.id} variant={v} productId={product.id} />
                      ))}
                    </div>
                  )}
                  <AddVariantForm productId={product.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
