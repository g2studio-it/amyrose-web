'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Copy, Check, FileImage, X } from 'lucide-react';
import { attachProofAction, cancelOrderAction } from '@/actions/orders';
import type { ApiOrder } from '@/lib/api';

const BANK_DETAILS = {
  cbu: '0000003100022812345678',
  alias: 'AMYROSE.BAKERY',
  holder: 'Amy Rose Repostería',
};

interface Props {
  order: ApiOrder;
  locale: string;
}

export function TransferForm({ order, locale }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('El archivo supera el límite de 10 MB');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleRemoveFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCopy(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleConfirm() {
    setIsProcessing(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-proof', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Error al subir el comprobante');
        await attachProofAction(order.id, data.url);
      }
      router.push(`/${locale}/orders/success?orderId=${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al confirmar el pedido');
      setIsProcessing(false);
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelOrderAction(order.id);
    } catch {
      // best-effort
    }
    toast.info('Pedido cancelado');
    router.push(`/${locale}/orders`);
  }

  const busy = isProcessing || isCancelling;

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg space-y-5">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-brand-burgundy">Confirmá tu transferencia</h1>
          <p className="text-muted-foreground mt-1.5 text-sm max-w-sm mx-auto">
            Realizá la transferencia y adjuntá el comprobante para confirmar tu pedido.
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-2xl px-5 py-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm gap-2">
                <span className="text-nav-purple dark:text-white min-w-0 truncate">
                  {item.productName}
                  <span className="text-muted-foreground"> — {item.variantName} × {item.quantity}</span>
                </span>
                <span className="font-semibold text-brand-burgundy shrink-0">
                  ${Number(item.subtotal).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold text-nav-purple dark:text-white">
            <span>Total</span>
            <span className="text-brand-burgundy text-lg">
              ${Number(order.total).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Bank details */}
        <div className="bg-card border border-border rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Datos bancarios
          </p>

          {/* Highlighted amount */}
          <div className="flex items-center justify-between rounded-xl border border-brand-burgundy/20 bg-brand-burgundy/5 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">Importe a transferir</span>
            <span className="text-brand-burgundy font-extrabold text-lg">
              ${Number(order.total).toLocaleString('es-AR')}
            </span>
          </div>

          <BankRow
            label="CBU"
            value={BANK_DETAILS.cbu}
            mono
            onCopy={() => handleCopy(BANK_DETAILS.cbu, 'cbu')}
            copied={copiedField === 'cbu'}
          />
          <BankRow
            label="Alias"
            value={BANK_DETAILS.alias}
            mono
            onCopy={() => handleCopy(BANK_DETAILS.alias, 'alias')}
            copied={copiedField === 'alias'}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Titular</span>
            <span className="text-sm font-medium text-nav-purple dark:text-white">
              {BANK_DETAILS.holder}
            </span>
          </div>
        </div>

        {/* Proof upload */}
        <div className="bg-card border border-border rounded-2xl px-5 py-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Comprobante de pago
            </p>
            <span className="text-[10px] text-muted-foreground">(opcional)</span>
          </div>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Comprobante"
                className="w-full rounded-xl object-contain max-h-52 border border-border"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={busy}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="text-xs text-muted-foreground mt-1.5 text-center truncate px-2">
                {file?.name}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 px-4 text-muted-foreground transition-colors hover:border-brand-burgundy/40 hover:bg-brand-burgundy/5 disabled:opacity-40"
            >
              <FileImage className="h-8 w-8 opacity-40" />
              <span className="text-sm font-medium">Seleccioná el comprobante</span>
              <span className="text-xs">JPG, PNG, WebP — máx. 10 MB</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="flex-1 rounded-2xl border-2 border-gray-300 py-3 px-5 text-sm font-semibold text-muted-foreground transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
          >
            {isCancelling
              ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              : 'Cancelar pedido'
            }
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-brand-burgundy to-brand-violet py-3 px-5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {file ? 'Subiendo…' : 'Confirmando…'}
              </>
            ) : (
              'Confirmar pago'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BankRow({
  label,
  value,
  mono,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold text-nav-purple dark:text-white truncate ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-brand-burgundy/30 hover:text-brand-burgundy"
      >
        {copied
          ? <><Check className="h-3 w-3 text-green-500" /> ¡Copiado!</>
          : <><Copy className="h-3 w-3" /> Copiar</>
        }
      </button>
    </div>
  );
}
