'use client';

import { Construction } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function PageEnConstruction({ title, description, icon: Icon = Construction }: Props) {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl flex items-center justify-center">
          <Icon className="w-10 h-10 text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{title}</h1>
        <p className="text-slate-500 text-lg mb-6">
          {description || 'Cette fonctionnalité est en cours de développement.'}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-sm font-medium">
          <Construction className="w-4 h-4" />
          En construction
        </div>
      </div>
    </div>
  );
}
