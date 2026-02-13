import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';
import { Header } from '@/components/header';
import { Toaster } from 'sonner';
import { TermsConsentModal } from '@/components/terms-consent-modal';
import { WhatsAppButton } from '@/components/whatsapp-button';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'Leilões Reversa - Logística Reversa em Sorocaba',
  description: 'Plataforma de leilões de logística reversa em Sorocaba e região. Participe e aproveite as melhores oportunidades!',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Leilões Reversa - Logística Reversa em Sorocaba',
    description: 'Plataforma de leilões de logística reversa em Sorocaba e região',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <Header />
          <main>{children}</main>
          <Toaster position="top-right" richColors />
          <TermsConsentModal />
          <WhatsAppButton />
        </SessionProvider>
      </body>
    </html>
  );
}
