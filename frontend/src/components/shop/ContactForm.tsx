'use client';

import { useState, useTransition } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { sendContactMessageAction } from '@/actions/contact';

const INPUT =
  'w-full rounded-xl border border-nav-lilac-divider dark:border-dm-secondary/40 bg-white dark:bg-card px-4 py-3 text-sm text-nav-purple dark:text-[#F5E6F0] placeholder:text-nav-purple/40 focus:border-brand-burgundy/50 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10 transition-colors';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await sendContactMessageAction({ name, email, message });
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error ?? 'Error al enviar');
      }
    });
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-serif font-bold text-xl text-nav-purple dark:text-[#F5E6F0]">
          ¡Mensaje enviado!
        </h3>
        <p className="text-sm text-nav-purple/65 dark:text-[#F5E6F0]/60 max-w-xs">
          Gracias por escribirme. Te respondo a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-nav-purple/70 dark:text-[#F5E6F0]/60 uppercase tracking-wide">
            Nombre
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className={INPUT}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-nav-purple/70 dark:text-[#F5E6F0]/60 uppercase tracking-wide">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={INPUT}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-nav-purple/70 dark:text-[#F5E6F0]/60 uppercase tracking-wide">
          Mensaje
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Contame tu idea, ocasión, sabores preferidos..."
          className={`${INPUT} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full bg-nav-burgundy px-7 py-3 text-sm font-semibold font-serif text-white shadow-sm transition-all hover:bg-nav-burgundy/85 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isPending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
