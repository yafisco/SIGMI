'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function GlobalHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === '/';

  return (
    <header className="relative bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#0F172A] bg-[length:200%_auto] animate-gradient text-white shadow-2xl border-b border-[#D4AF37]/30 sticky top-0 z-50 backdrop-blur-xl bg-opacity-95">
      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#D4AF37]/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFE4B5] rounded-full blur-lg opacity-50 animate-pulse" />
              <img
                src="/logo-group-mi.png"
                alt="SIGMI Logo"
                className="relative w-16 h-16 object-contain drop-shadow-2xl"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE4B5] to-[#D4AF37] bg-[length:200%_auto] animate-gradient tracking-wider">SIGMI</h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isHomePage && (
              <>
                <Link
                  href="#features"
                  className="text-white hover:text-[#D4AF37] transition-colors font-medium"
                >
                  Fonctionnalités
                </Link>
                <Link
                  href="#poles"
                  className="text-white hover:text-[#D4AF37] transition-colors font-medium"
                >
                  Pôles
                </Link>
                <Link
                  href="#why-us"
                  className="text-white hover:text-[#D4AF37] transition-colors font-medium"
                >
                  About us
                </Link>
              </>
            )}
            <Link
              href="/login"
              className="relative group px-6 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-[#D4AF37] transition-all duration-300 border border-white/20 hover:border-[#D4AF37]/50"
            >
              <span className="relative z-10">Connexion</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              {isHomePage && (
                <>
                  <Link
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <span>Fonctionnalités</span>
                  </Link>
                  <Link
                    href="#poles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <span>Pôles</span>
                  </Link>
                  <Link
                    href="#why-us"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <span>About us</span>
                  </Link>
                </>
              )}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Connexion</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
