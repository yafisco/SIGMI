'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, FolderKanban, FileText, LayoutDashboard, LogOut, Users2, Briefcase, Kanban, MessageSquare, CheckSquare, Contact, Menu, X, Wallet, Receipt, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function GlobalHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/clients', label: 'Clients', icon: Users2 },
    { href: '/opportunites', label: 'Opportunités', icon: Briefcase },
    { href: '/pipeline', label: 'Pipeline', icon: Kanban },
    { href: '/interactions', label: 'Interactions', icon: MessageSquare },
    { href: '/taches', label: 'Tâches', icon: CheckSquare },
    { href: '/projets', label: 'Projets', icon: FolderKanban },
    { href: '/collaborateurs', label: 'Collaborateurs', icon: Users },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/tresorerie', label: 'Trésorerie', icon: Wallet },
    { href: '/tresorerie/factures', label: 'Factures', icon: Receipt },
    { href: '/commercial', label: 'Dashboard Commercial', icon: TrendingUp },
  ];

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const isDashboardPage = pathname === '/dashboard' || pathname === '/collaborateurs' || pathname === '/projets' || pathname === '/documents' || pathname === '/clients' || pathname === '/opportunites' || pathname === '/pipeline' || pathname === '/interactions' || pathname === '/taches' || pathname === '/contacts';

  return (
    <header className="relative bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#0F172A] bg-[length:200%_auto] animate-gradient text-white shadow-2xl border-b border-[#D4AF37]/30 sticky top-0 z-50 backdrop-blur-xl bg-opacity-95">
      {/* Subtle golden glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#D4AF37]/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo et nom */}
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

          {/* Navigation Desktop - Visible only for authenticated users */}
          {isDashboardPage && (
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A] shadow-lg shadow-[#D4AF37]/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F172A]' : 'text-[#D4AF37] group-hover:text-white'}`} />
                    <span className="relative">
                      {item.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#0F172A] rounded-full" />
                      )}
                    </span>
                  </Link>
                );
              })}
              {/* Menu "Plus" pour les items restants */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  <span>Plus</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-br from-[#0F172A] to-[#1D4ED8] rounded-xl shadow-2xl border border-[#D4AF37]/30 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 backdrop-blur-xl">
                  {navItems.slice(6).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}

          {/* Actions */}
          {pathname === '/' && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="relative group px-6 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-[#D4AF37] transition-all duration-300 border border-white/20 hover:border-[#D4AF37]/50"
              >
                <span className="relative z-10">Connexion</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/register"
                className="relative group px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A] shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Inscription</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#B89B6E] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          )}

          {isDashboardPage && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="relative group flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-[#D4AF37] transition-all duration-300 border border-white/20 hover:border-[#D4AF37]/50"
              >
                <LogOut className="w-4 h-4" />
                <span className="relative z-10">Déconnexion</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              {/* Navigation items - Visible only for authenticated users */}
              {isDashboardPage && navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A]'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Auth Buttons - Visible for non-authenticated users */}
              {!isDashboardPage && (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A] transition-all"
                  >
                    <span>Inscription</span>
                  </Link>
                </>
              )}

              {/* Logout Button - Visible for authenticated users */}
              {isDashboardPage && (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-[#D4AF37] hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
