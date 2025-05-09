// src/app/layout.tsx
import './globals.css';
import Providers from './providers';          // ← new
import Header from '@/components/Header';


export const metadata = {
  title: 'PrettyPrompt',
  description: 'Prompt optimizer',
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
      <Providers>
          <Header />
          {children}
        </Providers>    {/* now inside client boundary */}
      </body>
    </html>
  );
}
