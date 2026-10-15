import React from 'react';
import { Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';

export default function GroupMIFooter() {
  return (
    <footer className="bg-groupmi-blue-dark text-white py-8 border-t-2 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Colonne 1: Logo et slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center border-2 border-white">
                <Building2 className="w-6 h-6 text-[#1D4ED8]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">GROUP MI</h3>
                <p className="text-[#D4AF37] text-xs tracking-wide uppercase mt-1">
                  Diversifier, innover, impacter
                </p>
              </div>
            </div>
          </div>

          {/* Colonne 2: Contact simplifié */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-200">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>+221 77 590 86 42</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>info@madinainfotech.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span>www.group-mi.com</span>
              </div>
            </div>
          </div>

          {/* Colonne 3: Adresse */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Adresse</h4>
            <div className="space-y-2 text-sm text-gray-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span>Dixième Riaom, Thiès, Sénégal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6">
          <p className="text-center text-gray-200 text-sm">
            © 2026 GROUP MI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
