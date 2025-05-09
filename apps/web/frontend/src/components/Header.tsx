// src/components/Header.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';


export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-blue-100 dark:border-zinc-800">
      {/* Top row: logo + title + auth */}
      <div className="flex justify-between items-center px-4 py-3 md:px-8 md:py-5">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="PrettyPrompt logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
          </Link>
          <Link href="/">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-emerald-400 tracking-tight">
              PrettyPrompt
            </h1>
          </Link>
        </div>

        {session ? (
          <button
            onClick={() => signOut()}
            className="flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold shadow hover:from-blue-700 hover:to-emerald-600 transition"
          >
            <span className="hidden sm:inline">Sign&nbsp;out</span>
            <span className="ml-1 truncate max-w-[100px]">
              ({session.user?.email?.split('@')[0]})
            </span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/login"
              className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              Sign&nbsp;in
            </Link>
            <Link
              href="/register"
              className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg bg-emerald-100 text-emerald-800 font-semibold shadow hover:bg-emerald-200 transition"
            >
              Sign&nbsp;up
            </Link>
          </div>
        )}
      </div>

      <SecondaryNav />
    </header>
  );
}


const navItems = [
  { name: 'PrettyYourPrompt',    href: '/prettyprompt' },
  { name: 'Templates', href: '/templates' },
];
export function SecondaryNav() {
  const pathname = usePathname();

  return (
    <nav className="px-4 md:px-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-blue-100 dark:border-zinc-800">
      <ul className="flex space-x-6 py-2 text-sm md:text-base">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  relative
                  inline-block
                  px-1
                  py-1
                  font-medium
                  transition
                  ${isActive
                    ? 'text-blue-600 dark:text-emerald-400'
                    : 'text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-emerald-400'}
                `}
              >
                {item.name}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-400"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
