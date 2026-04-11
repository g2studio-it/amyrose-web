'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Trash2, PackagePlus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { createAdminProductAction } from '@/actions/admin';
import type { ApiCategory } from '@/lib/api';

interface Variant {
  name: string;
  price: string;
  stock: string;
  sku: string;
}

const EMPTY_VARIANT: Variant = { name: '', price: '', stock: '', sku: '' };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface Props {
  categories: ApiCategory[];
}

export function CreateProductDialog({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([{ ...EMPTY_VARIANT }]);

  function resetForm() {
    setName('');
    setSlug('');
    setSlugManual(false);
    setDescription('');
    setCategoryId('');
    setIsFeatured(false);
    setVariants([{ ...EMPTY_VARIANT }]);
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(val);
  }

  function addVariant() {
    setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
  }

  function removeVariant(index: number) {
    setVariants((v) => v.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((v) => v.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId) {
      toast.error('Seleccioná una categoría');
      return;
    }
    if (variants.some((v) => !v.name || !v.price)) {
      toast.error('Completá nombre y precio en todas las variantes');
      return;
    }

    startTransition(async () => {
      const result = await createAdminProductAction({
        categoryId,
        name,
        slug,
        description: description || undefined,
        isFeatured,
        variants: variants.map((v) => ({
          name: v.name,
          price: parseFloat(v.price),
          stock: v.stock ? parseInt(v.stock) : undefined,
          sku: v.sku || undefined,
        })),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${name}" creado correctamente`);
        handleClose();
      }
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#6B1A2B] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1624] focus-visible:outline-none"
      >
        <Plus className="h-4 w-4" />
        Nuevo producto
      </button>

      {/* Backdrop + Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#6B1A2B]/10 px-6 py-4">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Name + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#3B1F5E]">
                    Nombre <span className="text-[#6B1A2B]">*</span>
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Torta de chocolate"
                    className="w-full rounded-lg border border-[#6B1A2B]/20 bg-white px-3 py-2 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none focus:ring-2 focus:ring-[#6B1A2B]/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#3B1F5E]">
                    Slug <span className="text-[#6B1A2B]">*</span>
                  </label>
                  <input
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="torta-de-chocolate"
                    className="w-full rounded-lg border border-[#6B1A2B]/20 bg-white px-3 py-2 font-mono text-xs text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none focus:ring-2 focus:ring-[#6B1A2B]/10"
                  />
                </div>
              </div>

              {/* Category + Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#3B1F5E]">
                    Categoría <span className="text-[#6B1A2B]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#6B1A2B]/20 bg-white px-3 py-2 pr-8 text-sm text-[#3B1F5E] focus:border-[#6B1A2B]/50 focus:outline-none focus:ring-2 focus:ring-[#6B1A2B]/10"
                    >
                      <option value="">Seleccioná una categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#3B1F5E]/40" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#3B1F5E]">Opciones</label>
                  <label className="flex h-[38px] cursor-pointer items-center gap-2.5 rounded-lg border border-[#6B1A2B]/20 px-3">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-[#6B1A2B]/30 accent-[#6B1A2B]"
                    />
                    <span className="text-sm text-[#3B1F5E]/70">Marcar como destacado</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#3B1F5E]">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Descripción del producto (opcional)"
                  className="w-full resize-none rounded-lg border border-[#6B1A2B]/20 bg-white px-3 py-2 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none focus:ring-2 focus:ring-[#6B1A2B]/10"
                />
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#3B1F5E]">
                    Variantes <span className="text-[#6B1A2B]">*</span>
                    <span className="ml-1.5 font-normal text-[#3B1F5E]/40">
                      (tamaño, sabor, etc.)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#6B1A2B] transition-colors hover:bg-[#6B1A2B]/8"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar variante
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-[#6B1A2B]/12 bg-[#F9F5FB]/50 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-[#3B1F5E]/50">
                          Variante {index + 1}
                        </span>
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

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">
                            Nombre *
                          </label>
                          <input
                            required
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            placeholder="Ej: Chico"
                            className="w-full rounded-md border border-[#6B1A2B]/20 bg-white px-2.5 py-1.5 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">
                            Precio *
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#3B1F5E]/40">
                              $
                            </span>
                            <input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-md border border-[#6B1A2B]/20 bg-white py-1.5 pl-6 pr-2 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                            placeholder="0"
                            className="w-full rounded-md border border-[#6B1A2B]/20 bg-white px-2.5 py-1.5 text-sm text-[#3B1F5E] placeholder:text-[#3B1F5E]/30 focus:border-[#6B1A2B]/50 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium uppercase tracking-wide text-[#3B1F5E]/50">
                            SKU
                          </label>
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

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-[#6B1A2B]/10 pt-4">
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
            </form>
          </div>
        </div>
      )}
    </>
  );
}
