import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { LoginForm } from '@/components/auth/LoginForm';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error } = await searchParams;

  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === 'ADMIN' ? `/${locale}/admin/dashboard` : `/${locale}`);
  }

  const initialError =
    error === 'CredentialsSignin' ? 'Email o contraseña incorrectos' : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient-pan"
        style={{
          background:
            'linear-gradient(135deg, #1A0A2E 0%, #3B1F5E 30%, #6B1A2B 60%, #2C0F3E 80%, #1A0A2E 100%)',
        }}
      />

      {/* Floating blobs */}
      <div
        className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-40 animate-float-a"
        style={{ background: 'radial-gradient(circle, #A98EC5 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-20 w-[520px] h-[520px] rounded-full blur-3xl opacity-30 animate-float-b"
        style={{ background: 'radial-gradient(circle, #6B1A2B 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-[65%] w-[300px] h-[300px] rounded-full blur-2xl opacity-25 animate-float-c delay-2000"
        style={{ background: 'radial-gradient(circle, #C9A8D9 0%, transparent 70%)' }}
      />

      {/* Accent dots */}
      <div className="absolute top-[15%] right-[12%] w-4 h-4 rounded-full bg-white/20 animate-float-a delay-1000" />
      <div className="absolute top-[65%] left-[7%] w-3 h-3 rounded-full bg-[#C9A8D9]/40 animate-float-b delay-3000" />
      <div className="absolute bottom-[18%] left-[22%] w-5 h-5 rounded-full bg-white/10 animate-float-c delay-2000" />
      <div className="absolute top-[40%] right-[6%] w-2 h-2 rounded-full bg-[#E8A0AE]/60 animate-float-a delay-3000" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-5">

        {/* Brand */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg">
            <span className="text-3xl select-none animate-rose-spin">🌸</span>
          </div>
          <h1 className="font-serif font-extrabold text-5xl text-white tracking-tight leading-none mb-2">
            Amy Rose
          </h1>
          <p className="text-[#C9A8D9] text-xs uppercase tracking-[0.3em] mt-2">
            Repostería artesanal
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl border border-white/15 p-7 shadow-2xl animate-fade-up delay-100"
          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}
        >
          <h2 className="font-serif font-semibold text-xl text-white/90 mb-6 text-center">
            Iniciar sesión
          </h2>
          <LoginForm initialError={initialError} />
        </div>

        {/* Back link */}
        <div className="mt-6 text-center animate-fade-up delay-200">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/90 text-sm transition-colors duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
