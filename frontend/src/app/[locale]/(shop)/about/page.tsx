import Image from 'next/image';
import Link from 'next/link';
import { Clock, Cake, ExternalLink, Instagram, Facebook, Youtube, Linkedin, Twitter, Link2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ locale: string }>;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Link2,
  whatsapp: Link2,
  other: Link2,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
  facebook: 'bg-blue-600',
  youtube: 'bg-red-600',
  linkedin: 'bg-blue-700',
  twitter: 'bg-slate-800',
  tiktok: 'bg-slate-900',
  whatsapp: 'bg-green-500',
  other: 'bg-[#6B1A2B]',
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;

  const [articles, socialLinks] = await Promise.all([
    prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    }).catch(() => []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((prisma as any).socialLink as typeof prisma.socialLink | undefined)
      ?.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { platform: 'asc' }],
      })
      .catch(() => []) ?? Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-nav-purple via-nav-burgundy to-[#8B3A52] text-white py-24 px-4">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative container mx-auto max-w-3xl text-center">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-nav-lilac-divider mb-4">
            La persona detrás de cada creación
          </p>
          <h1 className="font-serif font-extrabold text-5xl md:text-6xl mb-6 leading-tight">
            Hola, soy <span className="italic">Angeles</span>
          </h1>
          <p className="text-nav-lilac-divider text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
            Pastelera apasionada, creadora de momentos dulces y artista del azúcar.
            Bienvenida a Amy Rose Bakery, mi lugar en el mundo.
          </p>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=700&q=80"
                alt="Angeles pastelera"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl px-5 py-4 border border-nav-lilac-divider/40">
              <p className="font-serif font-bold text-nav-burgundy text-2xl">+8</p>
              <p className="font-serif text-xs text-nav-purple/70 uppercase tracking-wider">años de experiencia</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#A98EC5] mb-2">Mi historia</p>
              <h2 className="font-serif font-bold text-3xl text-nav-purple leading-snug">
                Del amor por la cocina<br />a un sueño hecho realidad
              </h2>
            </div>
            <div className="space-y-4 text-nav-purple/80 leading-relaxed">
              <p>
                Desde pequeña, la cocina fue mi lugar favorito. Recuerdo pasar horas mirando a mi abuela
                preparar budines y tartas, fascinada por cómo ingredientes simples se convertían en algo mágico.
              </p>
              <p>
                Con el tiempo, lo que era un hobby se convirtió en vocación. Estudié pastelería profesional,
                tomé cursos de decoración artística y me especialicé en tortas personalizadas.
              </p>
              <p>
                Hoy, <span className="font-semibold text-nav-burgundy">Amy Rose Bakery</span> es ese sueño
                hecho realidad: un espacio donde el arte y el sabor se encuentran.
              </p>
            </div>
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex items-center gap-2 bg-nav-burgundy hover:bg-nav-burgundy/85 text-white font-serif font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Ver mis creaciones
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick stats ───────────────────────────────────────── */}
      <section className="bg-[#F9F5FB] py-14 px-4">
        <div className="container mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Clock, value: '+8', label: 'Años de experiencia' },
            { icon: Cake, value: '∞', label: 'Recetas propias' },
            { icon: Cake, value: '100%', label: 'Artesanal' },
            { icon: Clock, value: '48h', label: 'Anticipación mínima' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-nav-burgundy/10 shadow-sm">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-nav-burgundy/10 mb-3 mx-auto">
                <Icon className="h-5 w-5 text-nav-burgundy" />
              </div>
              <p className="font-serif font-extrabold text-2xl text-nav-burgundy">{value}</p>
              <p className="text-xs text-nav-purple/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Articles ──────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <div className="text-center mb-12">
            <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#A98EC5] mb-2">Del blog</p>
            <h2 className="font-serif font-bold text-3xl text-nav-purple">Artículos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl border border-nav-burgundy/10 overflow-hidden hover:border-nav-burgundy/30 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {article.imageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-nav-purple/10 to-nav-burgundy/10 flex items-center justify-center">
                    <span className="text-4xl">🍰</span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <h3 className="font-serif font-bold text-lg text-nav-purple leading-snug">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-nav-purple/65 leading-relaxed line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>
                  )}
                  {article.publishedAt && (
                    <p className="text-xs text-nav-purple/40">
                      {new Date(article.publishedAt).toLocaleDateString('es-AR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Process ───────────────────────────────────────────── */}
      <section className={`px-4 py-20 max-w-4xl mx-auto ${articles.length > 0 ? 'border-t border-nav-burgundy/10' : ''}`}>
        <div className="text-center mb-12">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#A98EC5] mb-2">Cómo trabajo</p>
          <h2 className="font-serif font-bold text-3xl text-nav-purple">El proceso de un pedido</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Me contás tu idea', desc: 'Hablamos sobre la ocasión, el sabor, el diseño y la cantidad de porciones.' },
            { step: '02', title: 'Creo tu pedido', desc: 'Con ingredientes frescos y mucho cariño, preparo tu torta o postre de forma artesanal.' },
            { step: '03', title: 'Lo disfrutás', desc: 'Coordinamos la entrega o retiro y vos solo te preocupás de disfrutar cada mordida.' },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <div className="font-serif font-extrabold text-6xl text-nav-burgundy/10 leading-none mb-2">{step}</div>
              <h3 className="font-serif font-bold text-lg text-nav-purple mb-2">{title}</h3>
              <p className="text-sm text-nav-purple/65 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social networks ───────────────────────────────────── */}
      {socialLinks.length > 0 && (
        <section className="bg-[#F9F5FB] py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#A98EC5] mb-2">
              Seguime en
            </p>
            <h2 className="font-serif font-bold text-3xl text-nav-purple mb-10">
              Redes sociales
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] ?? Link2;
                const colorClass = PLATFORM_COLORS[link.platform] ?? 'bg-[#6B1A2B]';
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-2xl border border-white bg-white px-5 py-3.5 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${colorClass} text-white shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-nav-purple text-sm">{link.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-nav-purple/30 group-hover:text-nav-purple/60 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-nav-burgundy to-nav-purple py-16 text-center text-white px-4">
        <h2 className="font-serif font-bold text-3xl mb-4">¿Querés hacer un pedido?</h2>
        <p className="text-nav-lilac-divider mb-8 max-w-md mx-auto">
          Explorá el catálogo o contactame directamente para hablar de tu pedido personalizado.
        </p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex font-serif font-semibold px-8 py-3.5 rounded-full bg-white text-nav-burgundy hover:bg-nav-lilac-bg transition-colors duration-200"
        >
          Ver el catálogo
        </Link>
      </section>
    </div>
  );
}
