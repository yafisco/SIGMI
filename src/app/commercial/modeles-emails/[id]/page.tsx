'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Edit, Copy, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { emailTemplatesService } from '@/lib/services';
import { EmailTemplate } from '@/types';
import Swal from 'sweetalert2';

export default function EmailTemplateDetailPage() {
  const params = useParams();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function fetchTemplate() {
      const data = await emailTemplatesService.getById(params.id as string);
      setTemplate(data);
      setLoading(false);
    }
    fetchTemplate();
  }, [params.id]);

  const handleCopy = async () => {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.corps);
      Swal.fire('Copié !', 'Le contenu du modèle a été copié', 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Impossible de copier le contenu', 'error');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      prospection: 'bg-blue-100 text-blue-700',
      agrement: 'bg-purple-100 text-purple-700',
      relance: 'bg-amber-100 text-amber-700',
      rendezvous: 'bg-green-100 text-green-700',
      devis: 'bg-cyan-100 text-cyan-700',
      livraison: 'bg-orange-100 text-orange-700',
      contrat: 'bg-emerald-100 text-emerald-700',
      autre: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.autre;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Modèle non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/commercial/modeles-emails">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux modèles
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{template.nom}</h1>
              <p className="text-slate-600 mt-1">{template.sujet}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/commercial/modeles-emails/${template.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <X className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Fermer' : 'Aperçu'}
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.categorie)}`}>
                {template.categorie}
              </span>
              {!template.actif && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Inactif
                </span>
              )}
            </div>

            {template.variables && template.variables.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Variables disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable, i) => (
                    <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Corps de l'e-mail</h3>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                  {template.corps}
                </pre>
              </div>
            </div>

            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white rounded-xl p-6 border-2 border-slate-200"
              >
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Aperçu de l'e-mail</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Objet : {template.sujet}</span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {template.corps}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
