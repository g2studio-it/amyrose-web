import Image from 'next/image';
import Link from 'next/link';
import { Heart, Award, Clock, Cake } from 'lucide-react';

interface Props {
  params: Promise<{ locale: string }>;
}

const HIGHLIGHTS = [
  {
    icon: Heart,
    title: 'Hecha con amor',
    description: 'Cada pieza es única. Angeles pone su corazón en cada torta, cupcake y postre que prepara.',
  },
  {
    icon: Award,
    title: 'Calidad artesanal',
    description: 'Ingredientes seleccionados, técnicas profesionales y un ojo para el detalle que marca la diferencia.',
  },
  {
    icon: Clock,
    title: '+8 años de experiencia',
    description: 'Años de práctica, cursos y pasión que se traducen en resultados que superan expectativas.',
  },
  {
    icon: Cake,
    title: 'Pedidos personalizados',
    description: 'Desde cumpleaños hasta casamientos, Angeles crea la torta perfecta para cada celebración.',
  },
];

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-nav-purple via-nav-burgundy to-[#8B3A52] text-white py-24 px-4">
        {/* Decorative circles */}
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

          {/* Image */}
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
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-5 bg-card rounded-2xl shadow-xl px-5 py-4 border border-nav-lilac-divider/40">
              <p className="font-serif font-bold text-nav-burgundy text-2xl">+8</p>
              <p className="font-serif text-xs text-nav-purple/70 uppercase tracking-wider">años de experiencia</p>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-6">
            <div>
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Mi historia
              </p>
              <h2 className="font-serif font-bold text-3xl text-nav-purple leading-snug">
                Del amor por la cocina<br />a un sueño hecho realidad
              </h2>
            </div>

            <div className="space-y-4 text-nav-purple/80 leading-relaxed">
              <p>
                Desde pequeña, la cocina fue mi lugar favorito. Recuerdo pasar horas mirando a mi abuela
                preparar budines y tartas, fascinada por cómo ingredientes simples se convertían en algo
                mágico. Ese amor nunca se fue.
              </p>
              <p>
                Con el tiempo, lo que era un hobby se convirtió en vocación. Estudié pastelería
                profesional, tomé cursos de decoración artística y me especialicé en tortas personalizadas.
                Cada técnica aprendida fue un paso más hacia el proyecto que soñaba.
              </p>
              <p>
                Hoy, <span className="font-semibold text-nav-burgundy">Amy Rose Bakery</span> es ese sueño
                hecho realidad: un espacio donde el arte y el sabor se encuentran, y donde cada pedido
                es tratado con la misma dedicación que el primero.
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

      {/* ── Highlights ────────────────────────────────────────── */}
      <section className="bg-section-tinted py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Por qué elegirme
            </p>
            <h2 className="font-serif font-bold text-3xl text-nav-purple">
              Lo que me define
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card rounded-2xl p-6 border border-nav-burgundy/10 hover:border-nav-burgundy/30 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-nav-burgundy/10 mb-4">
                  <Icon className="h-6 w-6 text-nav-burgundy" />
                </div>
                <h3 className="font-serif font-bold text-nav-purple mb-2">{title}</h3>
                <p className="text-sm text-nav-purple/65 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Cómo trabajo
          </p>
          <h2 className="font-serif font-bold text-3xl text-nav-purple">
            El proceso de un pedido
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Me contás tu idea', desc: 'Hablamos sobre la ocasión, el sabor, el diseño y la cantidad de porciones que necesitás.' },
            { step: '02', title: 'Creo tu pedido', desc: 'Con ingredientes frescos y mucho cariño, preparo tu torta o postre de forma artesanal.' },
            { step: '03', title: 'Lo disfrutás', desc: 'Coordinamos la entrega o retiro y vos solo te preocupás de disfrutar cada mordida.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative">
              <div className="font-serif font-extrabold text-6xl text-nav-burgundy/10 leading-none mb-2">
                {step}
              </div>
              <h3 className="font-serif font-bold text-lg text-nav-purple mb-2">{title}</h3>
              <p className="text-sm text-nav-purple/65 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-nav-burgundy to-nav-purple py-16 text-center text-white px-4">
        <h2 className="font-serif font-bold text-3xl mb-4">
          ¿Querés hacer un pedido?
        </h2>
        <p className="text-nav-lilac-divider mb-8 max-w-md mx-auto">
          Explorá el catálogo o contactame directamente para hablar de tu pedido personalizado.
        </p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex font-serif font-semibold px-8 py-3.5 rounded-full bg-background text-nav-burgundy hover:bg-nav-lilac-bg transition-colors duration-200"
        >
          Ver el catálogo
        </Link>
      </section>
    </div>
  );
}
