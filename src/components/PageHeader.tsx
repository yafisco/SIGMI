'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  extraAction?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  actionHref,
  actionLabel = 'Nouveau',
  actionIcon = <Plus className="w-4 h-4" />,
  extraAction,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.back();
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#2563EB] bg-[length:200%_auto] animate-gradient border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backHref && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
              {description && (
                <p className="text-gray-200 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {extraAction && extraAction}
            {actionHref && (
              <Link href={actionHref}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient hover:scale-105 text-[#1D4ED8] shadow-lg shadow-[#D4AF37]/30 border-2 border-[#D4AF37] transition-all duration-300 font-semibold">
                    {actionIcon}
                    <span className="ml-2">{actionLabel}</span>
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
