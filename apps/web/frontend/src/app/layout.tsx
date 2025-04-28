// src/app/layout.tsx
import './globals.css';
import Providers from './providers';          // ← new

export const metadata = {
  title: 'PrettyPrompt',
  description: 'Prompt optimizer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>     {/* now inside client boundary */}
      </body>
    </html>
  );
}
