import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Mail, Phone, Calendar, Shield } from 'lucide-react';
import { getProfileAction } from '@/actions/users';
import { ProfileForm } from '@/components/shop/ProfileForm';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const user = await getProfileAction();

  const displayName = user?.name ?? session.user.name ?? '';
  const displayEmail = user?.email ?? session.user.email ?? '';
  const displayPhone = user?.phone ?? '';
  const displayRole = user?.role ?? session.user.role ?? 'CUSTOMER';
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : (displayEmail.charAt(0).toUpperCase() || '?');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="mb-8 text-3xl font-extrabold text-brand-burgundy">Mi Perfil</h1>

        {/* ── Profile card ───────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-burgundy to-brand-violet flex items-center justify-center text-white text-2xl font-bold shrink-0 select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-brand-burgundy truncate">
                {displayName || 'Sin nombre'}
              </h2>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  displayRole === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {displayRole === 'ADMIN' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-brand-burgundy/60 shrink-0" />
              <span className="text-muted-foreground w-28 shrink-0">Email</span>
              <span className="font-medium truncate">{displayEmail}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-brand-burgundy/60 shrink-0" />
              <span className="text-muted-foreground w-28 shrink-0">Teléfono</span>
              <span className="font-medium">{displayPhone || <em className="text-muted-foreground not-italic">Sin teléfono</em>}</span>
            </div>

            {user?.createdAt && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-brand-burgundy/60 shrink-0" />
                <span className="text-muted-foreground w-28 shrink-0">Miembro desde</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-brand-burgundy/60 shrink-0" />
              <span className="text-muted-foreground w-28 shrink-0">Estado</span>
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  user?.isActive !== false ? 'text-green-700' : 'text-red-600'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    user?.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {user?.isActive !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Edit form ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-brand-burgundy mb-5">
            Editar información
          </h3>
          <ProfileForm initialName={displayName} initialPhone={displayPhone} />
        </div>
      </div>
    </div>
  );
}
