'use client';

import { usePathname } from 'next/navigation';
import GlobalHeader from "@/components/GlobalHeader";
import GroupMIFooter from "@/components/GroupMIFooter";
import AppSidebar from "@/components/AppSidebar";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname.startsWith('/auth');

  return (
    <>
      <GlobalHeader />
      <div className="flex flex-1">
        {!isPublicPage && <AppSidebar />}
        <main className={`${isPublicPage ? 'flex-1' : 'flex-1 min-w-0'}`}>{children}</main>
      </div>
      <GroupMIFooter />
    </>
  );
}
