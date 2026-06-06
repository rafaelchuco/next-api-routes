import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sistema de Biblioteca",
  description: "API Routes con Next.js, Prisma y Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="shell flex items-center justify-between gap-4 py-4">
            <Link className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300" href="/">
              Biblioteca API
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm text-slate-200">
              <Link className="nav-link" href="/">
                Dashboard
              </Link>
              <Link className="nav-link" href="/books">
                Libros
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
