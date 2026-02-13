'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Gavel, User, LogOut, LayoutDashboard, Shield, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Verificar se é admin
    if (session?.user?.email === 'admin@reversa.com') {
      setIsAdmin(true);
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Logout realizado com sucesso');
    router.push('/');
    router.refresh();
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-16 h-16">
            <Image
              src="/logo-reversa.png"
              alt="Leilões Reversa"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-2xl text-[#2c5282]">Leilões Reversa</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/lotes">
            <Button variant="ghost" className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              <span>Leilões</span>
            </Button>
          </Link>

          <Link href="/contato">
            <Button variant="ghost" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Contato</span>
            </Button>
          </Link>

          {status === 'authenticated' ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="bg-[#2c5282] hover:bg-[#1e3a5f] text-white">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
