'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getVisibleSections, type NavSection, type NavItem } from '@/lib/navigation';

function SectionGroup({
  section,
  pathname,
  defaultOpen,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  defaultOpen: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  const hasActiveItem = section.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  );

  useEffect(() => {
    if (hasActiveItem) setOpen(true);
  }, [hasActiveItem]);

  if (section.items.length === 1 && section.items[0].href === section.items[0].href) {
    const item = section.items[0];
    const ItemIcon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A] shadow-lg shadow-[#D4AF37]/20'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        <ItemIcon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0F172A]' : 'text-[#D4AF37]'}`} />
        <span>{section.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          hasActiveItem && !open
            ? 'bg-white/10 text-white'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${hasActiveItem ? 'text-[#D4AF37]' : 'text-[#D4AF37]/70'}`} />
        <span className="flex-1 text-left">{section.label}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-white/50" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/50" />
        )}
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A] shadow-md shadow-[#D4AF37]/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0F172A]' : 'text-white/50'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = getVisibleSections(user?.role);

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut();
    router.push('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const isAuthPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/auth');
  if (isAuthPage || !user) return null;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity" onClick={closeMobile}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFE4B5] rounded-full blur-md opacity-40" />
            <img
              src="/logo-group-mi.png"
              alt="SIGMI"
              className="relative w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE4B5] to-[#D4AF37] tracking-wider">
              SIGMI
            </h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Group MI</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-white/10">
        <p className="text-sm font-medium text-white truncate">
          {user.prenom} {user.nom}
        </p>
        <p className="text-xs text-[#D4AF37]/80 capitalize">
          {user.role.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {/* Lien pôle pour responsable de pôle */}
        {user.role === 'responsable_pole' && user.pole && (
          <Link
            href={`/poles/${encodeURIComponent(user.pole)}`}
            onClick={closeMobile}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/poles/')
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A] shadow-lg shadow-[#D4AF37]/20'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className={`w-5 h-5 shrink-0 ${pathname.startsWith('/poles/') ? 'text-[#0F172A]' : 'text-[#D4AF37]'}`} />
            <span>Mon pôle</span>
          </Link>
        )}

        {sections.map((section) => (
          <SectionGroup
            key={section.key}
            section={section}
            pathname={pathname}
            defaultOpen={section.items.some(
              (i) => pathname === i.href || pathname.startsWith(i.href + '/'),
            )}
            onNavigate={closeMobile}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[#0F172A] text-white rounded-xl shadow-lg border border-[#D4AF37]/30 hover:bg-[#1D4ED8] transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#1D4ED8] border-r border-[#D4AF37]/20 sticky top-0 h-screen overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <aside className="relative w-72 h-full bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#1D4ED8] shadow-2xl">
            <button
              type="button"
              onClick={closeMobile}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
