import React from 'react';
import { Building2 } from 'lucide-react';

interface GroupMIHeaderProps {
  showContact?: boolean;
}

export default function GroupMIHeader({ showContact = false }: GroupMIHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white py-4 px-4 sm:px-6 lg:px-8 border-b-2 border-yellow-600">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo et nom */}
          <div className="flex items-center gap-4">
            {/* Logo stylisé */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-blue-300">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wider">GROUP MI</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-px w-8 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                <p className="text-yellow-400 text-xs font-medium tracking-wide uppercase">
                  Diversifier, innover, impacter
                </p>
                <div className="h-px w-8 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
              </div>
            </div>
          </div>

          {/* CTA - seulement sur landing page */}
          {showContact && (
            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-white hover:text-yellow-400 transition-colors text-sm font-medium">
                Fonctionnalités
              </a>
              <a href="#poles" className="text-white hover:text-yellow-400 transition-colors text-sm font-medium">
                Pôles
              </a>
              <a href="/login" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 px-6 py-2 rounded-lg text-sm font-semibold border-2 border-yellow-400 shadow-lg">
                Connexion
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
