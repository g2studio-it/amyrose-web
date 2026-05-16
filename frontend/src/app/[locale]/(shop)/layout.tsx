import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Instagram } from 'lucide-react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Fixed Instagram button */}
      <a
        href="https://www.instagram.com/amyrose.pasteleria"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Seguinos en Instagram"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
      >
        <Instagram className="h-5 w-5" />
      </a>
    </div>
  );
}
