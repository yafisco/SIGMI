'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VentesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/gestion-commerciale/ventes/historique');
  }, [router]);

  return null;
}
