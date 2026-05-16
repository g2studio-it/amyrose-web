'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  previewClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'amyrose',
  className = '',
  previewClassName = 'h-32 w-full',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body });
        const json = await res.json();

        if (!res.ok) {
          setError(json.error ?? 'Error al subir la imagen');
          return;
        }

        onChange(json.url);
      } catch {
        setError('Error de red al subir la imagen');
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange],
  );

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      upload(file);
    },
    [upload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const INPUT_CLASSES =
    'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30';

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="preview"
            className={`${previewClassName} rounded-lg border border-border object-cover`}
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            title="Quitar imagen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Upload className="h-3 w-3" />
            Cambiar
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
            dragging
              ? 'border-brand-burgundy/60 bg-brand-burgundy/5'
              : 'border-border hover:border-brand-burgundy/40 hover:bg-muted/50'
          } ${previewClassName}`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-burgundy/60" />
          ) : (
            <>
              <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/70">
                Hacer clic o arrastrar imagen
              </p>
              <p className="text-[10px] text-muted-foreground/50">JPG, PNG, WebP · máx. 5 MB</p>
            </>
          )}
        </div>
      )}

      {uploading && !value && null}

      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}

      {/* Also allow pasting a URL manually */}
      <input
        type="url"
        value={value}
        onChange={(e) => { setError(null); onChange(e.target.value); }}
        placeholder="O pegá una URL de imagen…"
        className={INPUT_CLASSES}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
